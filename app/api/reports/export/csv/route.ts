import { NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema/assets";

export async function GET() {
  try {
    const allAssets = await db.select().from(assets);

    // ส่วนหัวของไฟล์ CSV
    const headers = ["Asset Code", "Category", "Brand", "Model", "Serial Number", "Status", "Location", "Warranty Expire", "Created At", "Factory"];
    
    // แปลงข้อมูลเป็นแถวของ CSV
    const rows = allAssets.map((a) => [
      a.assetCode,
      a.category,
      a.brand || "",
      a.model || "",
      a.serialNumber || "",
      a.status,
      a.location || "",
      a.warrantyExpire ? new Date(a.warrantyExpire).toLocaleDateString("th-TH") : "-",
      // ป้องกัน Error หาก createdAt เป็นค่าว่างหรือรูปแบบผิด
      a.createdAt ? new Date(a.createdAt).toLocaleDateString("th-TH") : "-",
      a.factory || ""
    ]);

    // สร้างเนื้อหา CSV พร้อม BOM (\uFEFF) เพื่อให้อ่านภาษาไทยใน Excel ได้ทันที
    const csvContent = "\uFEFF" + [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="asset-report-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Failed to export CSV" }, { status: 500 });
  }
}