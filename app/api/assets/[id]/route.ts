import { NextResponse } from "next/server";
import { db } from "@/db";
import { assets, logs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { formatSpecifications, isSoftDeleteStatus } from "@/lib/asset-helpers";

// Method สำหรับดึงข้อมูลอุปกรณ์ตัวเดียว
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const asset = await db.query.assets.findFirst({
      where: eq(assets.id, id),
    });
    if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(asset);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Method สำหรับแก้ไขข้อมูล (Update)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      id: _,
      purchaseDate, warrantyExpire, warrantyStatus,
      assignedTo,
      specifications: existingSpecs,
      ...rest
    } = body;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const currentAsset = await db.query.assets.findFirst({
      where: eq(assets.id, id),
    });

    if (!currentAsset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    // ใช้ Helper ในการจัดรูปแบบ specifications และรวบรวมกับข้อมูลเดิม
    const updatedSpecs = {
      ...(currentAsset.specifications || {}),
      ...formatSpecifications(body),
    };

    const updateFields: Partial<typeof assets.$inferInsert> = {
      ...rest,
      specifications: updatedSpecs,
      updatedAt: new Date(),
    };

    // ใช้ Helper จัดการ Soft Delete
    if (isSoftDeleteStatus(rest.status)) {
      updateFields.deletedAt = new Date();
    } else if (rest.status) {
      updateFields.deletedAt = null;
    }

    if (purchaseDate !== undefined) {
      updateFields.purchaseDate = purchaseDate && purchaseDate !== "" ? new Date(purchaseDate) : null;
    }
    if (warrantyExpire !== undefined) {
      updateFields.warrantyExpire = warrantyExpire && warrantyExpire !== "" ? new Date(warrantyExpire) : null;
    }
    if (assignedTo !== undefined) {
      updateFields.receivedBy = assignedTo || null;
    }

    const updated = await db
      .update(assets)
      .set(updateFields)
      .where(eq(assets.id, id))
      .returning();

    revalidatePath("/dashboard/assets");
    revalidatePath(`/track/${id}`);
    revalidatePath("/dashboard");

    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const retired = await db.update(assets)
      .set({ 
        deletedAt: new Date(), 
        status: "retired", 
        updatedAt: new Date() 
      })
      .where(eq(assets.id, id))
      .returning();

    revalidatePath("/dashboard/assets");

    if (retired.length === 0) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    await db.insert(logs).values({
      assetId: id,
      action: "retire",
      notes: "จำหน่ายออกผ่านระบบ (เพื่อให้เลขไม่ซ้ำ)",
      actionDate: new Date(),
    });

    return NextResponse.json({ success: true, retired: retired[0] });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
