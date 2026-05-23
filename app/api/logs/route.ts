import { NextResponse } from "next/server";
import { db } from "@/db";
import { logs, assets, employees } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      assetId,
      action,
      location,
      department,
      assignedTo,   // ชื่อพนักงาน (String)
      assignedToId, // ID พนักงาน (UUID)
      handledBy,
      actionDate,
      condition,
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
      let finalAssignedToId = assignedToId;

      // ถ้าไม่มี ID แต่มีชื่อมาให้ (กรณีจากหน้า Register สาธารณะ)
      if (!finalAssignedToId && typeof assignedTo === "string" && assignedTo.trim() !== "") {
        // ลองหาพนักงานจากชื่อ
        const existingEmployee = await tx.query.employees.findFirst({
          where: eq(employees.name, assignedTo)
        });

        if (existingEmployee) {
          finalAssignedToId = existingEmployee.id;
        } else {
          // ถ้าไม่เจอ ให้สร้างพนักงานใหม่
          const [newEmployee] = await tx.insert(employees).values({
            name: assignedTo,
            employeeId: `EMP-${Date.now()}`, // สร้าง ID ชั่วคราว
            department: department,
          }).returning();
          finalAssignedToId = newEmployee.id;
        }
      }

      const [newLog] = await tx
        .insert(logs)
        .values({
          assetId,
          action,
          location,
          department,
          assignedToId: finalAssignedToId,
          handledBy,
          actionDate: actionDate ? new Date(actionDate) : new Date(),
          condition,
          notes,
        })
        .returning();

      // อัปเดตข้อมูลสถานที่และแผนกในตาราง Assets
      await tx.update(assets)
        .set({ 
          location: location, 
          department: department,
          updatedAt: new Date() 
        })
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

    // ดึงประวัติทั้งหมดสำหรับ asset นี้ พร้อมข้อมูลพนักงาน
    const result = await db.query.logs.findMany({
      where: eq(logs.assetId, assetId),
      orderBy: [desc(logs.actionDate)],
      with: {
        employee: true
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}
