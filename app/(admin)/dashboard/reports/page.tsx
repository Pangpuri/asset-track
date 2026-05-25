"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2, ArrowLeft, Settings2, Table as TableIcon, Printer } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ใช้แนวทาง HTML -> Print/PDF มาตรฐานเพื่อให้ภาษาไทยแสดงผลได้สมบูรณ์ 100% 
// และจัดตารางได้สวยงามไม่ซ้อนทับกันครับ

const columns = [
  { id: "assetCode", label: "Asset Code", default: true },
  { id: "category", label: "ประเภท", default: true },
  { id: "brand", label: "ยี่ห้อ", default: true },
  { id: "model", label: "รุ่น", default: true },
  { id: "serialNumber", label: "Serial Number", default: true },
  { id: "location", label: "จุดติดตั้ง", default: true },
  { id: "status", label: "สถานะ", default: true },
  { id: "receivedBy", label: "ผู้รับมอบ", default: false },
  { id: "purchaseDate", label: "วันที่ซื้อ", default: false },
  { id: "warrantyExpire", label: "ประกันหมด", default: false },
];

export default function ExportPDFPage() {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.filter(c => c.default).map(c => c.id)
  );
  const [isExporting, setIsGenerating] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  const toggleColumn = (id: string) => {
    setSelectedColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handlePrint = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/assets");
      if (!res.ok) throw new Error();
      const assets = await res.json();

      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const tableHeaders = columns
        .filter(c => selectedColumns.includes(c.id))
        .map(c => `<th>${c.label}</th>`)
        .join("");

      const tableRows = assets.map((a: any) => {
        const cells = columns
          .filter(c => selectedColumns.includes(c.id))
          .map(c => {
            let val = a[c.id];
            if (c.id.toLowerCase().includes("date") || c.id.toLowerCase().includes("expire")) {
              val = val ? new Date(val).toLocaleDateString("th-TH") : "-";
            }
            if (c.id === "status") {
                const statusMap: Record<string, string> = {
                    active: "ใช้งานปกติ",
                    broken: "ชำรุด",
                    pending: "รอลงทะเบียน",
                    retired: "เลิกใช้",
                    lost: "สูญหาย"
                };
                val = statusMap[val] || val;
            }
            return `<td>${val || "-"}</td>`;
          })
          .join("");
        return `<tr>${cells}</tr>`;
      }).join("");

      const isLandscape = selectedColumns.length > 6;

      printWindow.document.write(`
        <html>
          <head>
            <title>Asset Report - ${new Date().toLocaleDateString("th-TH")}</title>
            <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Thai:wght@400;700&display=swap" rel="stylesheet">
            <style>
              @page { 
                size: A4 ${isLandscape ? "landscape" : "portrait"}; 
                margin: 15mm; 
              }
              body { 
                font-family: 'Noto Sans Thai', sans-serif; 
                margin: 0; 
                padding: 0; 
                color: #1f2937;
              }
              .header { 
                text-align: left; 
                margin-bottom: 30px; 
                border-bottom: 2px solid #4f46e5;
                padding-bottom: 15px;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
              }
              h1 { margin: 0; font-size: 24px; font-weight: 900; color: #111827; }
              .meta { font-size: 12px; color: #6b7280; font-weight: bold; }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                font-size: 11px;
                table-layout: fixed;
              }
              th { 
                background-color: #f9fafb; 
                border: 1px solid #e5e7eb; 
                padding: 10px 8px; 
                text-align: left; 
                font-weight: 700;
                color: #374151;
                word-wrap: break-word;
              }
              td { 
                border: 1px solid #e5e7eb; 
                padding: 8px; 
                vertical-align: top;
                word-wrap: break-word;
                overflow-wrap: break-word;
              }
              tr:nth-child(even) { background-color: #fdfdfd; }
              .footer {
                position: fixed;
                bottom: 0;
                width: 100%;
                text-align: center;
                font-size: 10px;
                color: #9ca3af;
                padding: 10px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1>ASSET INVENTORY REPORT</h1>
                <div class="meta">ฝ่าย MIS • สรุปรายการทรัพย์สินไอที</div>
              </div>
              <div style="text-align: right">
                <div class="meta">วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}</div>
                <div class="meta">จำนวนทั้งหมด: ${assets.length} รายการ</div>
              </div>
            </div>
            <table>
              <thead>
                <tr>${tableHeaders}</tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            <div class="footer">Internal Use Only • MIS Department Asset Tracking System</div>
            <script>
              window.onload = () => {
                window.print();
                // window.close(); // นำออกหากต้องการดูผลก่อนปิด
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
      toast.success("กำลังจัดเตรียมไฟล์ PDF...");
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการดึงข้อมูล");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/assets">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-[1000] tracking-tight flex items-center gap-3 text-zinc-900 leading-none">
            <FileText className="h-8 w-8 text-indigo-600" />
            EXPORT REPORT
          </h1>
          <p className="text-zinc-400 font-black text-[9px] uppercase tracking-[0.3em] mt-1 ml-0.5">Professional A4 Document Builder</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-1 border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-zinc-900 text-white p-6">
            <div className="flex items-center gap-2 mb-1">
              <Settings2 className="h-4 w-4 text-indigo-400" />
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Config Fields</CardTitle>
            </div>
            <CardDescription className="text-[10px] font-bold text-zinc-400">เลือกข้อมูลที่ต้องการแสดง</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-2">
            {columns.map((col) => (
              <div 
                key={col.id} 
                className={cn(
                    "flex items-center space-x-3 p-3 rounded-2xl transition-all cursor-pointer border-2",
                    selectedColumns.includes(col.id) ? "border-indigo-100 bg-indigo-50/30 text-indigo-900" : "border-transparent bg-zinc-50/50 text-zinc-400 hover:bg-zinc-50"
                )}
                onClick={() => toggleColumn(col.id)}
              >
                <Checkbox 
                    id={col.id} 
                    checked={selectedColumns.includes(col.id)} 
                    onCheckedChange={() => toggleColumn(col.id)} 
                    className="data-[state=checked]:bg-indigo-600 border-zinc-300"
                />
                <Label htmlFor={col.id} className="text-sm font-black cursor-pointer leading-none">{col.label}</Label>
              </div>
            ))}
            
            <Button 
                className="w-full h-14 mt-8 bg-zinc-900 hover:bg-black text-white rounded-2xl font-[1000] text-sm uppercase tracking-widest shadow-xl active:scale-95 transition-all gap-3" 
                onClick={handlePrint}
                disabled={isExporting}
            >
                {isExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Printer className="h-5 w-5" />}
                Export to PDF
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-none shadow-xl bg-zinc-50/30 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />
            
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mb-8 rotate-3">
                <FileText className="h-12 w-12 text-indigo-600" />
            </div>
            
            <h3 className="font-[1000] text-2xl text-zinc-900 tracking-tight mb-2 uppercase">A4 Layout Ready</h3>
            <p className="text-zinc-500 text-sm font-bold max-w-sm leading-relaxed mb-10">
                ระบบจะสร้างเอกสารภาษาไทยที่สมบูรณ์แบบ รองรับการจัดคอลัมน์อัตโนมัติ 
                <span className="text-indigo-600 block mt-2 font-black uppercase text-[10px] tracking-widest">
                    {selectedColumns.length > 6 ? "⚡ Auto Landscape Mode (Data Dense)" : "📄 Portrait Mode (Standard)"}
                </span>
            </p>
            
            <div className="w-full grid grid-cols-2 gap-4 max-w-xs">
                <div className="bg-white p-5 rounded-3xl shadow-sm text-left">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Items</span>
                    <span className="text-xl font-[1000] text-zinc-900 leading-none">Auto</span>
                </div>
                <div className="bg-white p-5 rounded-3xl shadow-sm text-left">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Encoding</span>
                    <span className="text-xl font-[1000] text-zinc-900 leading-none">TH/UTF8</span>
                </div>
            </div>

            <div className="mt-12 flex items-center gap-2 text-zinc-400">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">System Integrated Engine v2</span>
            </div>
        </Card>
      </div>
    </div>
  );
}
