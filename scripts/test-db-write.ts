import { db } from "../db";
import { assets } from "../db/schema/assets";
import { sql } from "drizzle-orm";

async function testWrite() {
  console.log("🚀 Testing database write to Supabase...");
  try {
    // 1. ลอง Insert ข้อมูลทดสอบ
    const newAsset = await db.insert(assets).values({
      assetCode: "TEST-" + Math.floor(Math.random() * 1000),
      category: "test",
      brand: "MIS-TEST",
      status: "pending"
    }).returning();

    console.log("✅ Write Successful! Created Asset:", newAsset[0]);

    // 2. ลองลบข้อมูลทดสอบทิ้ง (เพื่อไม่ให้ขยะค้าง)
    await db.execute(sql`DELETE FROM assets WHERE brand = 'MIS-TEST'`);
    console.log("🗑️ Cleaned up test data.");

  } catch (err) {
    console.error("❌ Write Failed!");
    console.error("Error Detail:", err);
    
    if (err instanceof Error) {
      if (err.message.includes("SSL")) {
        console.log("💡 Suggestion: Check SSL settings. Try adding ?sslmode=require to your DATABASE_URL");
      }
      if (err.message.includes("authentication failed")) {
        console.log("💡 Suggestion: Check your Supabase password or connection string.");
      }
    }
  } finally {
    process.exit(0);
  }
}

testWrite();
