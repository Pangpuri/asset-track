"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Download, Loader2, ArrowLeft, Settings2, Table as TableIcon, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/assets").then(res => res.json()).then(setAssets);
  }, []);

  const toggleColumn = (id: string) => {
    setSelectedColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    setIsGenerating(true);
    toast.info("ระบบกำลังเตรียมข้อมูลและจัดรูปแบบรายงาน...");

    try {
      // 1. ทำให้ Element ที่ซ่อนอยู่แสดงผลชั่วคราวเพื่อ Capture
      const element = reportRef.current;
      element.style.display = "block";

      // 2. ใช้ html2canvas แปลง HTML เป็นภาพ (Canvas)
      const canvas = await html2canvas(element, {
        scale: 2, // เพิ่มความชัด
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });

      // 3. ซ่อน Element กลับไปเหมือนเดิม
      element.style.display = "none";

      const imgData = canvas.toDataURL("image/png");
      
      // 4. สร้างไฟล์ PDF A4
      const isLandscape = selectedColumns.length > 6;
      const pdf = new jsPDF({
        orientation: isLandscape ? "landscape" : "portrait",
        unit: "mm",
        format: "a4"
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Asset_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.success("ดาวน์โหลดรายงาน PDF เรียบร้อยแล้ว");
    } catch (error) {
      console.error(error);
      toast.error("เกิดข้อผิดพลาดในการสร้างไฟล์ PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl pb-20">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/assets">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-zinc-100">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-[1000] tracking-tight flex items-center gap-3 text-zinc-900 uppercase leading-none">
            <FileText className="h-8 w-8 text-indigo-600" />
            Export Report
          </h1>
          <p className="text-zinc-400 font-black text-[9px] uppercase tracking-[0.3em] mt-1 ml-0.5">High-Fidelity PDF Engine v3</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left: Configuration */}
        <Card className="md:col-span-1 border-none shadow-2xl bg-white rounded-[2rem] overflow-hidden flex flex-col">
          <CardHeader className="bg-zinc-900 text-white p-6">
            <div className="flex items-center gap-2 mb-1">
              <Settings2 className="h-4 w-4 text-indigo-400" />
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Config Fields</CardTitle>
            </div>
            <CardDescription className="text-[10px] font-bold text-zinc-400 text-nowrap">เลือกข้อมูลที่ต้องการแสดงในรายงาน</CardDescription>
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
                onClick={handleExportPDF}
                disabled={isExporting}
            >
                {isExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                Download PDF
            </Button>
          </CardContent>
        </Card>

        {/* Right: Preview Info */}
        <Card className="md:col-span-2 border-none shadow-xl bg-zinc-50/30 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />
            
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-2xl flex items-center justify-center mb-8 rotate-3 transition-transform group-hover:rotate-0">
                <FileText className="h-12 w-12 text-indigo-600" />
            </div>
            
            <h3 className="font-[1000] text-2xl text-zinc-900 tracking-tight mb-2 uppercase">A4 WYSIWYG ENGINE</h3>
            <p className="text-zinc-500 text-sm font-bold max-w-sm leading-relaxed mb-10">
                ระบบใช้ฟอนต์สากล <span className="text-indigo-600">Noto Sans Thai</span> เพื่อการแสดงผลภาษาไทยที่คมชัดที่สุด 100% 
                <span className="text-indigo-600 block mt-2 font-black uppercase text-[10px] tracking-widest">
                    {selectedColumns.length > 6 ? "⚡ Auto Landscape Mode Active" : "📄 Portrait Mode Active"}
                </span>
            </p>
            
            <div className="w-full grid grid-cols-2 gap-4 max-w-xs">
                <div className="bg-white p-5 rounded-3xl shadow-sm text-left">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Items Found</span>
                    <span className="text-xl font-[1000] text-zinc-900 leading-none">{assets.length}</span>
                </div>
                <div className="bg-white p-5 rounded-3xl shadow-sm text-left">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Status</span>
                    <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-bold text-zinc-700">Ready</span>
                    </div>
                </div>
            </div>

            <div className="mt-12 flex items-center gap-2 text-zinc-400">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Thai Language Support Verified</span>
            </div>
        </Card>
      </div>

      {/* --- HIDDEN REPORT TEMPLATE (For Capture) --- */}
      <div 
        ref={reportRef} 
        style={{ 
          display: "none", 
          width: selectedColumns.length > 6 ? "297mm" : "210mm", 
          backgroundColor: "white", 
          padding: "20mm",
          fontFamily: "'Noto Sans Thai', sans-serif"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "30px", borderBottom: "4px solid #18181b", paddingBottom: "20px" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "32px", fontWeight: "900", letterSpacing: "-1px" }}>ASSET INVENTORY REPORT</h1>
            <p style={{ margin: "5px 0 0", fontSize: "14px", fontWeight: "bold", color: "#71717a", textTransform: "uppercase", letterSpacing: "2px" }}>MIS DEPARTMENT • DATA INTEGRITY REPORT</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold", color: "#a1a1aa" }}>DATE: {new Date().toLocaleDateString("th-TH")}</p>
            <p style={{ margin: 0, fontSize: "12px", fontWeight: "bold", color: "#a1a1aa" }}>TOTAL: {assets.length} ITEMS</p>
          </div>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#18181b" }}>
              {columns.filter(c => selectedColumns.includes(c.id)).map(col => (
                <th key={col.id} style={{ border: "1px solid #27272a", padding: "12px 10px", color: "white", textAlign: "left", fontSize: "12px", fontWeight: "bold" }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {assets.map((asset, index) => (
              <tr key={asset.id} style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#fafafa" }}>
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
                    <td key={col.id} style={{ border: "1px solid #e4e4e7", padding: "10px", fontSize: "11px", color: "#3f3f46", fontWeight: "600" }}>
                      {val || "-"}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: "40px", borderTop: "1px solid #e4e4e7", paddingTop: "20px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: "10px", fontWeight: "black", color: "#d4d4d8", textTransform: "uppercase", letterSpacing: "3px" }}>
            Internal Management System • Secure Document
          </p>
        </div>
      </div>
    </div>
  );
}
