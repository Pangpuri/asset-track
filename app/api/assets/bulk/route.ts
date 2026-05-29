import { NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema/assets";
import { sql } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const factory = searchParams.get("factory");
    const count = parseInt(searchParams.get("count") || "1");
    const checkCode = searchParams.get("checkCode");
    const excludeId = searchParams.get("excludeId");

    if (checkCode) {
      const query = excludeId 
        ? sql`SELECT id FROM assets WHERE asset_code = ${checkCode} AND id != ${excludeId} LIMIT 1`
        : sql`SELECT id FROM assets WHERE asset_code = ${checkCode} LIMIT 1`;
      
      const existing = await db.execute(query);
      return NextResponse.json({ exists: existing.length > 0 });
    }

    if (!category || !factory) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    const prefixMap: Record<string, string> = {
      computer: "PC",
      printer: "PT",
      monitor: "MO",
      network: "NW",
      other: "E",
    };

    const factoryMap: Record<string, string> = {
      "โรงงาน 1": "1",
      "โรงงาน 2": "2",
      "อื่นๆ": "E",
      "ทั้ง 2 โรงงาน": "E",
    };

    const fullPrefix = `${prefixMap[category] || "E"}${factoryMap[factory] || "E"}`;

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
      const suffix = lastCode.substring(fullPrefix.length);
      if (suffix) {
        lastNumber = parseInt(suffix) || 0;
      }
    }

    const nextCodes = [];
    for (let i = 1; i <= count; i++) {
      const nextNumber = lastNumber + i;
      nextCodes.push(`${fullPrefix}${nextNumber.toString().padStart(5, '0')}`);
    }

    return NextResponse.json({ nextCodes });
  } catch (error) {
    console.error("Error fetching next codes:", error);
    return NextResponse.json(
      { error: "ไม่สามารถคำนวณรหัสถัดไปได้" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Support both single config (backward compatibility) and array of configs
    const configs = Array.isArray(body) ? body : [body];
    const allNewAssets: any[] = [];

    // Map for current sequence trackers to handle multiple items of same type in one batch
    const sequenceTrackers: Record<string, number> = {};

    for (const config of configs) {
      const { count, category, factory } = config;
      const numToCreate = parseInt(count) || 1;

      const prefixMap: Record<string, string> = {
        computer: "PC",
        printer: "PT",
        monitor: "MO",
        network: "NW",
        other: "E",
      };
      const categoryPrefix = prefixMap[category as string] || "E";
      
      const factoryMap: Record<string, string> = {
        "โรงงาน 1": "1",
        "โรงงาน 2": "2",
        "อื่นๆ": "E",
      };
      const factoryCode = factoryMap[factory as string] || "1";
      const fullPrefix = `${categoryPrefix}${factoryCode}`;

      // Initialize tracker if not exists
      if (sequenceTrackers[fullPrefix] === undefined) {
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
          const suffix = lastCode.substring(fullPrefix.length);
          if (suffix) {
            lastNumber = parseInt(suffix) || 0;
          }
        }
        sequenceTrackers[fullPrefix] = lastNumber;
      }

      for (let i = 1; i <= numToCreate; i++) {
        sequenceTrackers[fullPrefix]++;
        const assetCode = `${fullPrefix}${sequenceTrackers[fullPrefix].toString().padStart(5, '0')}`;
        
        allNewAssets.push({
          assetCode,
          category: category || "other",
          factory: factory || "โรงงาน 1",
          status: "pending" as const,
        });
      }
    }

    if (allNewAssets.length === 0) {
      return NextResponse.json({ error: "No assets to create" }, { status: 400 });
    }

    if (allNewAssets.length > 200) {
       return NextResponse.json({ error: "จำกัดการสร้างไม่เกิน 200 รายการต่อครั้ง" }, { status: 400 });
    }

    const created = await db.insert(assets).values(allNewAssets).returning();
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("Error creating bulk assets:", error);
    return NextResponse.json(
      { error: "ไม่สามารถสร้างข้อมูลได้" },
      { status: 500 }
    );
  }
}
