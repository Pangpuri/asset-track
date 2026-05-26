import { NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema/assets";
import { sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { count, category } = await req.json();
    const numToCreate = parseInt(count) || 1;

    if (numToCreate <= 0 || numToCreate > 100) {
      return NextResponse.json(
        { error: "จำนวนต้องอยู่ระหว่าง 1 ถึง 100" },
        { status: 400 }
      );
    }

    // กำหนด Prefix ตามหมวดหมู่
    const prefixMap: Record<string, string> = {
      computer: "PC",
      printer: "PT",
      monitor: "MO",
      network: "NW",
      other: "E",
    };

    const prefix = prefixMap[category as string] || "E";

    // ค้นหาเลขล่าสุดที่ขึ้นต้นด้วย prefix นี้
    // ใช้ SQL เพื่อดึงเลขที่มากที่สุดออกมา (สมมติ format คือ PREFIX + ตัวเลข)
    const lastAsset = await db.execute(sql`
      SELECT asset_code 
      FROM assets 
      WHERE asset_code LIKE ${prefix + '%'} 
      ORDER BY length(asset_code) DESC, asset_code DESC 
      LIMIT 1
    `);

    let lastNumber = 0;
    if (lastAsset.length > 0) {
      const row = lastAsset[0] as unknown as { asset_code: string };
      const lastCode = row.asset_code;
      // ดึงเฉพาะตัวเลขออกมา
      const match = lastCode.match(/\d+/);
      if (match) {
        lastNumber = parseInt(match[0]);
      }
    }

    const newAssets = [];
    for (let i = 1; i <= numToCreate; i++) {
      const nextNumber = lastNumber + i;
      // ทำเลขให้เป็น 5 หลัก เช่น PC00001
      const assetCode = `${prefix}${nextNumber.toString().padStart(5, '0')}`;
      
      newAssets.push({
        assetCode,
        category: category || "other",
        status: "pending" as const,
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
