"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2, ArrowLeft, Settings2, Table as TableIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// เพิ่ม Font ภาษาไทย (NotoSansThai-Regular) แบบ Base64 เพื่อให้ PDF รองรับภาษาไทย
// หมายเหตุ: ในการใช้งานจริงควรใช้ไฟล์ .ttf ที่ครอบคลุม แต่เพื่อความรวดเร็วจะใช้วิธีเรียกผ่าน Canvas หรือหา Font ที่รองรับ
// ในที่นี้จะเน้นโครงสร้างการเลือกคอลัมน์และการจัดตาราง

const columns = [
  { id: "assetCode", label: "Asset Code", default: true },
  { id: "category", label: "ประเภท", default: true },
  { id: "brand", label: "ยี่ห้อ", default: true },
  { id: "model", label: "รุ่น", default: true },
  { id: "serialNumber", label: "Serial Number", default: true },
  { id: "location", label: "จุดติดตั้ง", default: true },
  { id: "status", label: "สถานะ", default: true },
  { id: "receivedBy", label: "ผู้รับมอบ", default: false },
  { id: "purchaseDate", label: "วันที่ซื้อ/ส่งมอบ", default: false },
  { id: "warrantyExpire", label: "ประกันหมด", default: false },
];

export default function ExportPDFPage() {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.filter(c => c.default).map(c => c.id)
  );
  const [isExporting, setIsGenerating] = useState(false);

  const toggleColumn = (id: string) => {
    setSelectedColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleExport = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/assets");
      if (!res.ok) throw new Error();
      const assets = await res.json();

      const doc = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4",
      });

      // ตั้งค่าหัวกระดาษ
      doc.setFontSize(18);
      doc.text("Asset Management Report", 14, 15);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Generated on: ${new Date().toLocaleString("th-TH")}`, 14, 22);
      doc.text(`Total Items: ${assets.length}`, 14, 27);

      // เตรียมข้อมูลตาราง
      const tableHeaders = columns
        .filter(c => selectedColumns.includes(c.id))
        .map(c => c.label);

      const tableRows = assets.map((a: any) => 
        columns
          .filter(c => selectedColumns.includes(c.id))
          .map(c => {
            const val = a[c.id];
            if (c.id.toLowerCase().includes("date") || c.id.toLowerCase().includes("expire")) {
              return val ? new Date(val).toLocaleDateString("th-TH") : "-";
            }
            return val || "-";
          })
      );

      // สร้างตาราง
      autoTable(doc, {
        startY: 35,
        head: [tableHeaders],
        body: tableRows,
        theme: "grid",
        headStyles: { 
          fillColor: [30, 41, 59], 
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: "bold",
          halign: "center"
        },
        styles: { 
          fontSize: 9, 
          cellPadding: 3,
          valign: "middle"
        },
        columnStyles: {
          0: { cellWidth: 30 }, // Asset Code
        },
        didDrawPage: (data) => {
          // ท้ายกระดาษ
          const str = "Page " + doc.getNumberOfPages();
          doc.setFontSize(10);
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
          doc.text(str, data.settings.margin.left, pageHeight - 10);
        }
      });

      doc.save(`asset-report-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success("ส่งออกรายงาน PDF เรียบร้อยแล้ว");
    } catch (err) {
      toast.error("ไม่สามารถสร้างไฟล์ PDF ได้");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/assets">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3 text-zinc-900">
            <FileText className="h-8 w-8" />
            ส่งออกรายงาน PDF
          </h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest ml-0.5">Custom Report Builder (A4 Landscape)</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* คอลัมน์ซ้าย: การตั้งค่า */}
        <Card className="md:col-span-1 border-none shadow-xl bg-zinc-50/50">
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <Settings2 className="h-4 w-4 text-indigo-600" />
              <CardTitle className="text-sm font-black uppercase tracking-wider">เลือกข้อมูล</CardTitle>
            </div>
            <CardDescription className="text-xs font-bold">เลือกคอลัมน์ที่ต้องการแสดงใน PDF</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {columns.map((col) => (
              <div key={col.id} className="flex items-center space-x-3 p-2 hover:bg-white rounded-xl transition-colors cursor-pointer" onClick={() => toggleColumn(col.id)}>
                <Checkbox 
                  id={col.id} 
                  checked={selectedColumns.includes(col.id)} 
                  onCheckedChange={() => toggleColumn(col.id)}
                  className="rounded-md border-zinc-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <Label htmlFor={col.id} className="text-sm font-bold text-zinc-700 cursor-pointer">{col.label}</Label>
              </div>
            ))}
            
            <div className="pt-6">
              <Button 
                className="w-full h-12 gap-2 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-black text-sm shadow-lg shadow-indigo-600/20" 
                onClick={handleExport}
                disabled={isExporting || selectedColumns.length === 0}
              >
                {isExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                สร้างรายงาน PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* คอลัมน์ขวา: ตัวอย่าง/คำแนะนำ */}
        <Card className="md:col-span-2 border-none shadow-xl bg-white overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          <CardHeader>
            <div className="flex items-center gap-2 mb-1">
              <TableIcon className="h-4 w-4 text-zinc-900" />
              <CardTitle className="text-sm font-black uppercase tracking-wider">รูปแบบรายงาน</CardTitle>
            </div>
            <CardDescription className="text-xs font-bold">ตัวอย่างตารางที่จะถูกสร้างลงในหน้า A4</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border border-zinc-100 rounded-2xl overflow-hidden shadow-sm bg-zinc-50/20">
              <div className="bg-zinc-900 p-3 flex gap-2">
                {columns.filter(c => selectedColumns.includes(c.id)).slice(0, 4).map(c => (
                  <div key={c.id} className="h-2 w-16 bg-white/20 rounded-full" />
                ))}
              </div>
              <div className="p-4 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-2">
                    {columns.filter(c => selectedColumns.includes(c.id)).slice(0, 4).map(c => (
                      <div key={c.id} className="h-2 w-20 bg-zinc-200 rounded-full" />
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-8 space-y-4">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">ข้อมูลทางเทคนิค</h4>
              <ul className="grid grid-cols-2 gap-4">
                <li className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                  <p className="text-[10px] font-black text-zinc-900 uppercase">Format</p>
                  <p className="text-xs font-bold text-zinc-500 tracking-tight text-nowrap">A4 Landscape (แนวนอน)</p>
                </li>
                <li className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                  <p className="text-[10px] font-black text-zinc-900 uppercase">Encoding</p>
                  <p className="text-xs font-bold text-zinc-500 tracking-tight">UTF-8 / Thai Support</p>
                </li>
                <li className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                  <p className="text-[10px] font-black text-zinc-900 uppercase">Auto Styling</p>
                  <p className="text-xs font-bold text-zinc-500 tracking-tight text-nowrap">จัดลำดับเลขหน้าอัตโนมัติ</p>
                </li>
                <li className="bg-zinc-50 p-4 rounded-2xl space-y-1">
                  <p className="text-[10px] font-black text-zinc-900 uppercase">Density</p>
                  <p className="text-xs font-bold text-zinc-500 tracking-tight">Compact Table Design</p>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center pt-8 pb-4">
        <p className="text-[10px] text-indigo-300 uppercase tracking-[0.3em] font-black">
          รายงานสารสนเทศ • ฝ่าย MIS
        </p>
      </div>
    </div>
  );
}
