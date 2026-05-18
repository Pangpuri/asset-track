import { NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema/assets";
import { logs } from "@/db/schema/logs";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { oldAssetId, newAssetId, reason } = await req.json();

    if (!oldAssetId || !newAssetId) {
      return NextResponse.json(
        { error: "Missing oldAssetId or newAssetId" },
        { status: 400 }
      );
    }

    const result = await db.transaction(async (tx) => {
      // 1. ดึงข้อมูลอุปกรณ์ทั้งสอง
      const [oldAsset] = await tx.select().from(assets).where(eq(assets.id, oldAssetId)).limit(1);
      const [newAsset] = await tx.select().from(assets).where(eq(assets.id, newAssetId)).limit(1);

      if (!oldAsset || !newAsset) {
        throw new Error("Asset not found");
      }

      // 2. อัปเดตเครื่องเก่า: เปลี่ยนสถานะเป็น broken (หรือตามเหตุผล)
      await tx.update(assets)
        .set({ 
          status: "broken", 
          updatedAt: new Date() 
        })
        .where(eq(assets.id, oldAssetId));

      // 3. อัปเดตเครื่องใหม่: รับช่วงต่อสถานที่ และเปลี่ยนสถานะเป็น active
      await tx.update(assets)
        .set({ 
          location: oldAsset.location,
          status: "active",
          updatedAt: new Date()
        })
        .where(eq(assets.id, newAssetId));

      // 4. บันทึก Log สำหรับเครื่องเก่า
      await tx.insert(logs).values({
        assetId: oldAssetId,
        action: "replaced",
        notes: `ถูกเปลี่ยนออกโดยเครื่อง ${newAsset.assetCode || newAsset.id.substring(0,8)}. เหตุผล: ${reason || "ไม่ระบุ"}`,
        location: oldAsset.location,
      });

      // 5. บันทึก Log สำหรับเครื่องใหม่
      await tx.insert(logs).values({
        assetId: newAssetId,
        action: "replace_unit",
        notes: `นำมาเปลี่ยนแทนเครื่อง ${oldAsset.assetCode || oldAsset.id.substring(0,8)}`,
        location: oldAsset.location,
      });

      return { success: true };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error replacing asset:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to replace asset" },
      { status: 500 }
    );
  }
}
