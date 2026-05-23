import { NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema/assets";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

    // 1. แยกค่า id และค่าที่จะเก็บใน specifications ออกมา
    const { 
      id: _, 
      computerName, ipAddress, monitorSize, 
      purchaseDate, warrantyExpire,
      ...rest 
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // 2. จัดกลุ่มข้อมูลเฉพาะทางลงใน specifications (JSONB)
    const specifications = {
      ...(computerName && { computerName }),
      ...(ipAddress && { ipAddress }),
      ...(monitorSize && { monitorSize }),
    };

    // ทำการอัปเดตข้อมูลในฐานข้อมูล
    const updated = await db
      .update(assets)
      .set({
        ...rest,
        specifications, // บันทึกเข้า JSONB column
        // ป้องกัน Error หากวันที่เป็นค่าว่าง
        purchaseDate: purchaseDate && purchaseDate !== "" ? new Date(purchaseDate) : null,
        warrantyExpire: warrantyExpire ? new Date(warrantyExpire) : null,
        updatedAt: new Date(), // อัปเดตเวลาล่าสุด
      })
      .where(eq(assets.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    // ล้าง Cache เพื่อให้หน้า Dashboard และหน้าติดตามแสดงข้อมูลใหม่ทันที
    revalidatePath("/dashboard/assets");
    revalidatePath(`/track/${id}`);

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

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const deleted = await db.delete(assets).where(eq(assets.id, id)).returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, deleted: deleted[0] });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
  }
}
