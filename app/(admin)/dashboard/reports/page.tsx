"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Printer, Loader2, ArrowLeft, Settings2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const columns = [
  { id: "assetCode", label: "รหัสทรัพย์สิน", default: true },
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
  const [assets, setAssets] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/assets").then(res => res.json()).then(setAssets);
  }, []);

  const toggleColumn = (id: string) => {
    setSelectedColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handlePrint = () => {
    toast.dismiss();
    setIsGenerating(true);
    // หน่วงเวลาเล็กน้อยเพื่อให้ UI อัปเดตสถานะก่อนสั่งพิมพ์
    setTimeout(() => {
        window.print();
        setIsGenerating(false);
    }, 200);
  };

  const isLandscape = selectedColumns.length > 6;

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl pb-20">
      {/* 1. ส่วนควบคุมหลัก (ซ่อนตอนพิมพ์) */}
      <div className="flex items-center gap-4 print:hidden">
        <Link href="/dashboard/assets">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-[1000] tracking-tight flex items-center gap-3 text-zinc-900 uppercase">
            <FileText className="h-8 w-8 text-indigo-600" />
            Report Builder
          </h1>
          <p className="text-zinc-400 font-black text-[9px] uppercase tracking-[0.3em] mt-1 ml-0.5">A4 Export System v4</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3 print:hidden">
        {/* Left: Configuration */}
        <Card className="md:col-span-1 border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden flex flex-col">
          <CardHeader className="bg-zinc-900 text-white p-6">
            <div className="flex items-center gap-2 mb-1">
              <Settings2 className="h-4 w-4 text-indigo-400" />
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Config Fields</CardTitle>
            </div>
            <CardDescription className="text-[10px] font-bold text-zinc-400">เลือกข้อมูลที่ต้องการแสดง</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-2 flex-1">
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
                Print PDF
            </Button>
          </CardContent>
        </Card>

        {/* Right: Info Area */}
        <Card className="md:col-span-2 border-none shadow-xl bg-zinc-50/30 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />
            <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="font-[1000] text-xl text-zinc-900 tracking-tight mb-2 uppercase">Ready for Printing</h3>
            <p className="text-zinc-500 text-sm font-bold max-w-sm leading-relaxed mb-10">
                ระบบใช้ฟอนต์สากล <span className="text-indigo-600">Tahoma / Segoe UI</span> 
                รองรับภาษาไทย 100% โปรดเลือกปลายทางเป็น <span className="underline">Save as PDF</span>
            </p>
            <div className="bg-white px-8 py-5 rounded-[1.8rem] shadow-sm border border-zinc-100 inline-flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
                    {isLandscape ? "A4 Landscape Mode" : "A4 Portrait Mode"}
                </span>
            </div>
        </Card>
      </div>

      {/* 2. ส่วนของรายงานสำหรับพิมพ์ (ซ่อนในหน้าปกติ / แสดงตอนกดพิมพ์) */}
      <div className="hidden print:block font-sans">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { 
              size: A4 ${isLandscape ? "landscape" : "portrait"}; 
              margin: 15mm; 
            }
            html, body {
              background: #fff !important;
              color: #000 !important;
              font-family: 'Tahoma', 'Segoe UI', sans-serif !important;
            }
            .print-header { border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            th { background-color: #f0f0f0 !important; border: 1px solid #ccc; padding: 8px 5px; text-align: left; font-size: 11px; -webkit-print-color-adjust: exact; }
            td { border: 1px solid #eee; padding: 6px 5px; font-size: 10px; word-wrap: break-word; vertical-align: top; }
            .print-footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 9px; color: #666; }
          }
        `}} />
        
        {/* เนื้อหารายงาน */}
        <div className="print-header flex justify-between items-end">
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, margin: 0 }}>ASSET INVENTORY REPORT</h1>
            <p style={{ fontSize: '11px', fontWeight: 'bold', margin: 0, color: '#666' }}>MIS DEPARTMENT • INTERNAL ONLY</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '10px', color: '#666' }}>
            <p style={{ margin: 0 }}>DATE: {new Date().toLocaleDateString("th-TH")}</p>
            <p style={{ margin: 0 }}>TOTAL: {assets.length} ITEMS</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              {columns.filter(c => selectedColumns.includes(c.id)).map(col => (
                <th key={col.id}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                {columns.filter(c => selectedColumns.includes(c.id)).map(col => {
                  let val = asset[col.id];
                  if (col.id.toLowerCase().includes("date") || col.id.toLowerCase().includes("expire")) {
                    val = val ? new Date(val).toLocaleDateString("th-TH") : "-";
                  }
                  if (col.id === "status") {
                    const statusMap: Record<string, string> = {
                        active: "ใช้งานปกติ", broken: "ชำรุด", pending: "รอลงทะเบียน", retired: "เลิกใช้", lost: "สูญหาย"
                    };
                    val = statusMap[val] || val;
                  }
                  return <td key={col.id}>{val || "-"}</td>;
                })}
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="print-footer">Generated by AssetTrack MIS System</div>
      </div>
    </div>
  );
}
