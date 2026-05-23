import { NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const result = await db.select().from(assets).where(eq(assets.id, id as string)).limit(1);
      if (result.length === 0) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      return NextResponse.json(result[0]);
    }

    const allAssets = await db.select().from(assets);
    return NextResponse.json(allAssets);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { assetCode, category, brand, model, serialNumber, location, computerName, monitorSize } = body;

    // เตรียมข้อมูล specifications ตามประเภท
    const specifications: {
      computerName?: string;
      monitorSize?: string;
    } = {};
    if (category === "computer") specifications.computerName = computerName;
    if (category === "monitor") specifications.monitorSize = monitorSize;

    const newAsset = await db.insert(assets).values({
      assetCode,
      category,
      brand,
      model,
      serialNumber,
      location,
      specifications,
      status: "active",
    }).returning();

    return NextResponse.json(newAsset[0]);
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json({ error: "Failed to create asset" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...updateData } = body;

    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    // รวมข้อมูลที่ส่งมาเพื่อ update ในฟิลด์ที่ถูกต้อง
    const updated = await db
      .update(assets)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(assets.id, id))
      .returning();

    if (updated.length === 0) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}
