import { NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { eq, and, or, ilike, isNull, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const q = searchParams.get("q");
    const filter = searchParams.get("filter");

    if (id) {
      const result = await db.select().from(assets).where(eq(assets.id, id as string)).limit(1);
      if (result.length === 0) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      return NextResponse.json(result[0]);
    }

    let conditions = [];

    // กรองตามสถานะ (เช่น active, broken, pending)
    if (status && status !== "all") {
      conditions.push(eq(assets.status, status as any));
    }

    // กรองตามหมวดหมู่
    if (category && category !== "all") {
      conditions.push(eq(assets.category, category));
    }

    // ค้นหาด้วยคำสำคัญ (Search)
    if (q) {
      conditions.push(
        or(
          ilike(assets.assetCode, `%${q}%`),
          ilike(assets.assetName, `%${q}%`),
          ilike(assets.serialNumber, `%${q}%`),
          ilike(assets.brand, `%${q}%`),
          ilike(assets.model, `%${q}%`),
          ilike(assets.location, `%${q}%`),
          ilike(assets.department, `%${q}%`)
        )
      );
    }

    // กรองข้อมูลที่ยังไม่สมบูรณ์ (Incomplete)
    // Logic: สถานะเป็น active แต่ขาดข้อมูลสำคัญ (S/N, Brand, หรือ Location)
    if (filter === "incomplete") {
      conditions.push(
        and(
          eq(assets.status, "active"),
          or(
            isNull(assets.serialNumber),
            eq(assets.serialNumber, ""),
            isNull(assets.brand),
            eq(assets.brand, ""),
            isNull(assets.location),
            eq(assets.location, "")
          )
        )
      );
    }

    const query = db.select().from(assets);
    
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    // เรียงลำดับตามวันที่สร้างล่าสุด
    query.orderBy(desc(assets.createdAt));

    const allAssets = await query;
    return NextResponse.json(allAssets);
  } catch (error) {
    console.error("Failed to fetch assets:", error);
    return NextResponse.json({ error: "Failed to fetch assets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      assetCode, category, brand, model, serialNumber, location, 
      computerName, monitorSize, ipAddress, vendor,
      receivedBy, deliveredBy, purchaseDate, warrantyExpire
    } = body;

    // เตรียมข้อมูล specifications ตามประเภท
    const specifications = {
      ...(computerName && { computerName }),
      ...(monitorSize && { monitorSize }),
      ...(ipAddress && { ipAddress }),
    };

    const newAsset = await db.insert(assets).values({
      assetCode,
      category,
      brand,
      model,
      serialNumber,
      location,
      specifications,
      vendor,
      receivedBy,
      deliveredBy,
      purchaseDate: purchaseDate && purchaseDate !== "" ? new Date(purchaseDate) : null,
      warrantyExpire: warrantyExpire && warrantyExpire !== "" ? new Date(warrantyExpire) : null,
      status: body.status || "active",
    }).returning();

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/assets");

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

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/assets");

    if (updated.length === 0) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
  }
}
