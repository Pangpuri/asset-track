import { NextResponse } from "next/server";
import { db } from "@/db";
import { assets } from "@/db/schema/assets";

export async function GET() {
  try {
    const allAssets = await db.select().from(assets);

    const htmlTableRows = allAssets.map(a => `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px; font-family: 'monospace';">${a.assetCode}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${a.category}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${a.brand || "-"} ${a.model || ""}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${a.location || "-"}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${a.status}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${a.createdAt ? new Date(a.createdAt).toLocaleDateString("th-TH") : ""}</td>
      </tr>
    `).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Asset Report - ${new Date().toLocaleDateString()}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;700&display=swap" rel="stylesheet">
        <style>
          body { font-family: 'Noto Sans Thai', sans-serif; padding: 40px; color: #333; }
          h1 { text-align: center; color: #2563eb; }
          .meta { text-align: right; margin-bottom: 20px; font-size: 0.9em; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background-color: #f8fafc; border: 1px solid #ddd; padding: 12px 8px; text-align: left; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          @media print {
            .no-print { display: none; }
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="margin-bottom: 20px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 5px; cursor: pointer;">
            คลิกเพื่อบันทึกเป็น PDF / สั่งพิมพ์
          </button>
        </div>
        <h1>รายงานสรุปข้อมูลอุปกรณ์ (Asset Report)</h1>
        <div class="meta">
          วันที่ออกรายงาน: ${new Date().toLocaleString("th-TH")} <br>
          จำนวนอุปกรณ์ทั้งหมด: ${allAssets.length} รายการ
        </div>
        <table>
          <thead>
            <tr>
              <th>Asset Code</th>
              <th>ประเภท</th>
              <th>ยี่ห้อ/รุ่น</th>
              <th>สถานที่ติดตั้ง</th>
              <th>สถานะ</th>
              <th>วันที่เพิ่ม</th>
            </tr>
          </thead>
          <tbody>
            ${htmlTableRows}
          </tbody>
        </table>
      </body>
      </html>
    `;

    return new Response(htmlContent, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to export data" }, { status: 500 });
  }
}