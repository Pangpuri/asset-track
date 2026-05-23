import "dotenv/config";
import { db } from "@/db";
import { assets } from "@/db/schema";

async function seedData() {
  try {
    console.log("🌱 เริ่มเพิ่มข้อมูลทดสอบ...");
    console.log("📡 DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 50) + "...");

    const testData = [
      {
        assetCode: "P001001",
        category: "computer",
        brand: "HP",
        model: "Victus",
        serialNumber: "SN123456",
        location: "IT Room",
        specifications: { 
          computerName: "IT-PC-01", 
          ipAddress: "192.168.1.50",
          ram: "16GB",
          storage: "512GB SSD"
        },
        status: "active" as const,
        purchaseDate: new Date(),
        warrantyExpire: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
      {
        assetCode: "M001002",
        category: "monitor",
        brand: "Dell",
        model: "UltraSharp 24",
        serialNumber: "SN987654",
        location: "Accounting",
        specifications: { 
          monitorSize: "24 inch",
        },
        status: "active" as const,
        purchaseDate: new Date(),
        warrantyExpire: new Date(Date.now() + 730 * 24 * 60 * 60 * 1000),
      }
    ];

    const testAssets = await db.insert(assets).values(testData).returning();

    console.log("✅ เพิ่มข้อมูลสำเร็จ! Asset IDs:");
    testAssets.forEach((asset) => {
      console.log(`  - ${asset.assetCode}: ${asset.id}`);
    });

    return testAssets;
  } catch (error) {
    console.error("❌ เกิดข้อผิดพลาด:", error);
    process.exit(1);
  }
}

seedData().then(() => {
  console.log("\n🎉 การเพิ่มข้อมูลเสร็จสิ้น");
  process.exit(0);
});
