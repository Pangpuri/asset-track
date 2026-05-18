import { NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema/assets";

export async function POST(req: Request) {
  try {
    const { count } = await req.json();
    const numToCreate = parseInt(count) || 1;

    if (numToCreate <= 0 || numToCreate > 100) {
      return NextResponse.json(
        { error: "จำนวนต้องอยู่ระหว่าง 1 ถึง 100" },
        { status: 400 }
      );
    }

    const newAssets = [];
    for (let i = 0; i < numToCreate; i++) {
      newAssets.push({
        status: "pending" as const,
        // assetCode และ category จะเป็น null
      });
    }

    const created = await db.insert(assets).values(newAssets).returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating bulk assets:", error);
    return NextResponse.json(
      { error: "ไม่สามารถสร้างข้อมูลชุดใหญ่ได้" },
      { status: 500 }
    );
  }
}
