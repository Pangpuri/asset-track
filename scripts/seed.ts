import "dotenv/config";
import { db } from "@/db";
import { assets } from "@/db/schema";

async function seedData() {
  try {
    console.log("🌱 เริ่มเพิ่มข้อมูลทดสอบ...");
    console.log("📡 DATABASE_URL:", process.env.DATABASE_URL?.substring(0, 50) + "...");

    // สร้าง test asset
    const testAssets = await db.insert(assets).values([
      {
        assetCode: "P001001",
        category: "computer",
        brand: "Dell",
        model: "Latitude 5420",
        serialNumber: "SN12345678",
        location: "อาคาร A ชั้น 3 ห้อง 301",
        specifications: {
          computerName: "PC-ADMIN-01",
          ipAddress: "192.168.10.50",
          ram: "16GB",
          storage: "512GB SSD",
        },
        status: "active",
        purchaseDate: new Date("2023-01-15"),
        warrantyExpire: new Date("2025-01-15"),
      },
      {
        assetCode: "P001002",
        category: "monitor",
        brand: "LG",
        model: "UltraFine 27",
        serialNumber: "SN87654321",
        location: "อาคาร A ชั้น 2 ห้อง 201",
        specifications: {
          monitorSize: "27 นิ้ว",
        },
        status: "active",
        purchaseDate: new Date("2023-06-20"),
        warrantyExpire: new Date("2025-06-20"),
      },
      {
        assetCode: "P001003",
        category: "printer",
        brand: "HP",
        model: "LaserJet Pro M404n",
        serialNumber: "SN11223344",
        location: "อาคาร B ชั้น 1 ห้องพิมพ์",
        status: "maintenance",
        purchaseDate: new Date("2022-09-10"),
        warrantyExpire: new Date("2024-09-10"),
      },
    ]).returning();

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
