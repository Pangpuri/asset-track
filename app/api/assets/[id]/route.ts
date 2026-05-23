import { NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema/assets";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Method สำหรับแก้ไขข้อมูล (Update)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // แยก id ออกจาก body เพื่อป้องกันการ update primary key ทับตัวเอง
    const { id: _, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    // ทำการอัปเดตข้อมูลในฐานข้อมูล
    const updated = await db
      .update(assets)
      .set({
        ...updateData,
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
