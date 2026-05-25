"use client";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Printer, Loader2, ArrowLeft, Settings2, ShieldCheck, CheckCircle2 } from "lucide-react";
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
    // ปิด Toast ทั้งหมดก่อนพิมพ์เพื่อไม่ให้บัง
    toast.dismiss();
    
    setIsGenerating(true);
    // ไม่ใช้ toast.success ที่นี่เพื่อป้องกันการบังหน้าจอตอนพิมพ์
    
    setTimeout(() => {
        window.print();
        setIsGenerating(false);
    }, 300);
  };

  const isLandscape = selectedColumns.length > 6;

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl pb-20 print:p-0 print:m-0 print:max-w-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          /* ซ่อนทุกอย่างยกเว้นพื้นที่พิมพ์ */
          body * { visibility: hidden; }
          #printable-report, #printable-area, .print-content, .print-content * { visibility: visible; }
          #printable-report { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%;
          }
          /* ซ่อน UI ของ Library ต่างๆ */
          [data-sonner-toaster], .sonner-toast, .print\\:hidden { display: none !important; }
        }
      `}} />

      {/* ส่วนหัว (ซ่อนตอนพิมพ์) */}
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
          <p className="text-zinc-400 font-black text-[9px] uppercase tracking-[0.3em] mt-1 ml-0.5">Native PDF Engine (Thai Supported)</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3 print:hidden">
        {/* Left: Configuration (ซ่อนตอนพิมพ์) */}
        <Card className="md:col-span-1 border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-zinc-900 text-white p-6">
            <div className="flex items-center gap-2 mb-1">
              <Settings2 className="h-4 w-4 text-indigo-400" />
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Config Fields</CardTitle>
            </div>
            <CardDescription className="text-[10px] font-bold text-zinc-400">เลือกข้อมูลที่จะให้แสดงใน PDF</CardDescription>
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
                Print to PDF
            </Button>
          </CardContent>
        </Card>

        {/* Right: Info (ซ่อนตอนพิมพ์) */}
        <Card className="md:col-span-2 border-none shadow-xl bg-zinc-50/30 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />
            <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="h-10 w-10 text-emerald-500" />
            </div>
            <h3 className="font-[1000] text-xl text-zinc-900 tracking-tight mb-2 uppercase">Thai Language Verified</h3>
            <p className="text-zinc-500 text-sm font-bold max-w-sm leading-relaxed mb-8">
                ระบบใช้ฟอนต์สากล <span className="text-indigo-600">Tahoma / Segoe UI</span> 
                ที่รองรับภาษาไทย 100% บนทุกแพลตฟอร์ม
            </p>
            <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-zinc-100 flex items-center gap-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                    A4 {isLandscape ? "Landscape" : "Portrait"} Mode
                </span>
            </div>
        </Card>
      </div>

      {/* --- PRINTABLE AREA (แสดงผลเฉพาะตอนกดพิมพ์) --- */}
      <div className="hidden print:block font-sans text-zinc-900">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { 
                size: A4 ${isLandscape ? "landscape" : "portrait"}; 
                margin: 15mm; 
            }
            body { 
                -webkit-print-color-adjust: exact; 
                font-family: 'Tahoma', 'Segoe UI', sans-serif !important;
            }
            .no-print { display: none !important; }
          }
        `}} />
        
        {/* Header รายงาน */}
        <div className="flex justify-between items-end border-b-4 border-zinc-900 pb-5 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tighter m-0">ASSET INVENTORY REPORT</h1>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest m-0 mt-1">MIS DEPARTMENT • INTERNAL USE ONLY</p>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-zinc-400 m-0">DATE: {new Date().toLocaleDateString("th-TH")}</p>
            <p className="text-xs font-bold text-zinc-400 m-0">TOTAL: {assets.length} ITEMS</p>
          </div>
        </div>

        {/* ตารางข้อมูล */}
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-zinc-900">
              {columns.filter(c => selectedColumns.includes(c.id)).map(col => (
                <th key={col.id} className="border border-zinc-800 p-3 text-white text-left font-bold uppercase">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => (
              <tr key={asset.id} className={index % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}>
                {columns.filter(c => selectedColumns.includes(c.id)).map(col => {
                  let val = asset[col.id];
                  if (col.id.toLowerCase().includes("date") || col.id.toLowerCase().includes("expire")) {
                    val = val ? new Date(val).toLocaleDateString("th-TH") : "-";
                  }
                  if (col.id === "status") {
                    const statusMap: Record<string, string> = {
                        active: "ใช้งานปกติ",
                        broken: "ชำรุด",
                        pending: "รอลงทะเบียน",
                        retired: "เลิกใช้",
                        lost: "สูญหาย"
                    };
                    val = statusMap[val] || val;
                  }
                  return (
                    <td key={col.id} className="border border-zinc-200 p-2.5 font-semibold text-zinc-700">
                      {val || "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer รายงาน */}
        <div className="mt-10 pt-5 border-t border-zinc-200 text-center">
          <p className="text-[9px] font-bold text-zinc-300 uppercase tracking-[0.4em]">
            Generated by AssetTrack MIS Management System
          </p>
        </div>
      </div>
    </div>
  );
}
