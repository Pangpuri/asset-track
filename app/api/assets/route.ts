import { NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema";
import { eq, and, desc, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { 
  formatSpecifications, 
  activeOnly, 
  buildSearchCondition, 
  isIncomplete 
} from "@/lib/asset-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const factory = searchParams.get("factory");
    const q = searchParams.get("q");
    const filter = searchParams.get("filter");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    if (id) {
      const result = await db.select().from(assets).where(eq(assets.id, id as string)).limit(1);
      if (result.length === 0) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      return NextResponse.json(result[0]);
    }

    const conditions = [];

    // กรองเอาเฉพาะข้อมูลที่ยังไม่ถูกลบ (Soft Delete) เป็นค่าเริ่มต้น
    if (!includeDeleted) {
      conditions.push(activeOnly);
    }

    // กรองตามสถานะ
    if (status && status !== "all") {
      conditions.push(eq(assets.status, status as "active" | "broken" | "lost" | "retired" | "pending"));
    }

    // กรองตามหมวดหมู่
    if (category && category !== "all") {
      conditions.push(eq(assets.category, category));
    }

    // กรองตามโรงงาน
    if (factory && factory !== "all") {
      conditions.push(ilike(assets.factory, `%${factory}%`));
    }

    // ค้นหาด้วยคำสำคัญ (Search)
    if (q) {
      conditions.push(buildSearchCondition(q));
    }

    // กรองข้อมูลที่ยังไม่สมบูรณ์ (Incomplete)
    if (filter === "incomplete") {
      conditions.push(isIncomplete);
    }

    const query = db.select().from(assets);
    
    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

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
      assetCode, assetName, category, brand, model, serialNumber, location, factory,
      vendor, receivedBy, deliveredBy, purchaseDate, warrantyExpire, warrantyStatus
    } = body;

    // ใช้ Helper ในการจัดรูปแบบ specifications
    const specifications = formatSpecifications(body);

    const newAsset = await db.insert(assets).values({
      assetCode,
      assetName,
      category,
      brand,
      model,
      serialNumber,
      location,
      factory,
      specifications,
      vendor,
      receivedBy,
      deliveredBy,
      purchaseDate: purchaseDate && purchaseDate !== "" ? new Date(purchaseDate) : null,
      warrantyExpire: warrantyExpire && warrantyExpire !== "" ? new Date(warrantyExpire) : null,
      warrantyStatus: warrantyStatus || "date",
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
