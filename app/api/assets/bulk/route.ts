import { NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema/assets";
import { sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { count, category, factory } = await req.json();
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

    const categoryPrefix = prefixMap[category as string] || "E";
    
    // กำหนดรหัสโรงงานสำหรับ Prefix
    const factoryMap: Record<string, string> = {
      "โรงงาน 1": "1",
      "โรงงาน 2": "2",
      "อื่นๆ": "E",
    };
    const factoryCode = factoryMap[factory as string] || "1";
    
    // รวมเป็น Full Prefix เช่น PC1, PC2, PCE
    const fullPrefix = `${categoryPrefix}${factoryCode}`;

    // ค้นหาเลขล่าสุดที่ขึ้นต้นด้วย fullPrefix นี้เท่านั้น เพื่อแยก Sequence ของแต่ละโรงงาน
    const lastAsset = await db.execute(sql`
      SELECT asset_code 
      FROM assets 
      WHERE asset_code LIKE ${fullPrefix + '%'} 
      ORDER BY length(asset_code) DESC, asset_code DESC 
      LIMIT 1
    `);

    let lastNumber = 0;
    if (lastAsset.length > 0) {
      const row = lastAsset[0] as unknown as { asset_code: string };
      const lastCode = row.asset_code;
      
      // ตัดเอาเฉพาะส่วนที่เป็นตัวเลขต่อจาก Prefix (เช่น PC100005 ตัด PC1 ออกเหลือ 00005)
      const suffix = lastCode.substring(fullPrefix.length);
      if (suffix) {
        lastNumber = parseInt(suffix) || 0;
      }
    }

    const newAssets = [];
    for (let i = 1; i <= numToCreate; i++) {
      const nextNumber = lastNumber + i;
      // ทำเลขให้เป็น 5 หลัก เช่น PC00001
      const assetCode = `${fullPrefix}${nextNumber.toString().padStart(5, '0')}`;
      
      newAssets.push({
        assetCode,
        category: category || "other",
        factory: factory || "โรงงาน 1", // บันทึกชื่อโรงงานลงไปด้วยเพื่อให้ Filter ในระบบทำงานได้
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
