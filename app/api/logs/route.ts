import { NextResponse } from "next/server";
import { db } from "@/db";
import { logs, assets } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      assetId,
      action,
      location,
      department,
      assignedTo,
      assignedBy,
      deliveryDate,
      returnDate,
      notes,
    } = body;

    if (!assetId || !action) {
      return NextResponse.json(
        { error: "Missing required fields: assetId, action" },
        { status: 400 }
      );
    }

    // ใช้ Transaction เพื่อให้มั่นใจว่าบันทึกทั้ง Log และ Update Asset สำเร็จพร้อมกัน
    const result = await db.transaction(async (tx) => {
      const [newLog] = await tx
        .insert(logs)
        .values({
          assetId,
          action,
          location,
          department,
          assignedTo,
          assignedBy,
          deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
          returnDate: returnDate ? new Date(returnDate) : null,
          notes,
        })
        .returning();

      // อัปเดตข้อมูลสถานที่และผู้ถือครองล่าสุดในตาราง Assets
      await tx.update(assets)
        .set({ location: location, updatedAt: new Date() })
        .where(eq(assets.id, assetId));

      return newLog;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error creating log:", error);
    return NextResponse.json(
      { error: "Failed to create log" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get("assetId");

    if (!assetId) {
      return NextResponse.json(
        { error: "Missing assetId parameter" },
        { status: 400 }
      );
    }

    // ดึงประวัติทั้งหมดสำหรับ asset นี้
    const result = await db
      .select()
      .from(logs)
      .where(eq(logs.assetId, assetId as string))
      .orderBy(desc(logs.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
