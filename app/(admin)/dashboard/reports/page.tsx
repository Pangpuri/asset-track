"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FileText, Printer, Loader2, ArrowLeft, Settings2, ShieldCheck, Filter, Factory, Tag, Activity } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const columns = [
  { id: "assetCode", label: "รหัสทรัพย์สิน", default: true },
  { id: "category", label: "ประเภท", default: true },
  { id: "brand", label: "ยี่ห้อ", default: true },
  { id: "model", label: "รุ่น", default: true },
  { id: "location", label: "จุดติดตั้ง", default: true },
  { id: "receivedBy", label: "ผู้รับมอบ", default: false },   
  { id: "status", label: "สถานะ", default: true },
  { id: "serialNumber", label: "Serial Number", default: true },
  { id: "purchaseDate", label: "วันที่ซื้อ", default: false },
  { id: "warrantyExpire", label: "ประกันหมด", default: false },
  { id: "factory", label: "โรงงาน", default: true },
];

export default function ExportPDFPage() {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    columns.filter(c => c.default).map(c => c.id)
  );
  const [isExporting, setIsGenerating] = useState(false);
  const [isCsvExporting, setIsCsvExporting] = useState(false);
  const [assets, setAssets] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [factoryFilter, setFactoryFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchFilteredAssets = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (factoryFilter !== "all") sp.append("factory", factoryFilter);
      if (categoryFilter !== "all") sp.append("category", categoryFilter);
      if (statusFilter !== "all") sp.append("status", statusFilter);
      
      const res = await fetch(`/api/assets?${sp.toString()}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAssets(data);
    } catch (err) {
      toast.error("ไม่สามารถโหลดข้อมูลอุปกรณ์ได้");
    } finally {
      setLoading(false);
    }
  }, [factoryFilter, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchFilteredAssets();
  }, [fetchFilteredAssets]);

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

  const handleExportCsv = () => {
    setIsCsvExporting(true);
    try {
      // 1. กรองเฉพาะคอลัมน์ที่ผู้ใช้เลือก
      const activeCols = columns.filter(c => selectedColumns.includes(c.id));
      const headers = activeCols.map(c => c.label);
      
      // 2. แปลงข้อมูล assets เป็นแถวตามคอลัมน์ที่เลือก
      const rows = assets.map(asset => {
        return activeCols.map(col => {
          let val = (asset as Record<string, any>)[col.id];
          
          // จัดการรูปแบบข้อมูลพิเศษเหมือนในหน้า Preview
          if (col.id.toLowerCase().includes("date") || col.id.toLowerCase().includes("expire")) {
            val = val ? new Date(val).toLocaleDateString("th-TH") : "-";
          }
          if (col.id === "status") {
            const statusMap: Record<string, string> = {
                active: "ใช้งานปกติ", broken: "ชำรุด", pending: "รอลงทะเบียน", retired: "เลิกใช้", lost: "สูญหาย"
            };
            val = statusMap[val as string] || val;
          }
          return val || "-";
        });
      });

      // 3. สร้างเนื้อหา CSV พร้อม BOM (\uFEFF) เพื่อภาษาไทย
      const csvContent = "\uFEFF" + [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

      // 4. สร้าง Blob และดาวน์โหลด
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `asset-report-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("ดาวน์โหลด CSV เรียบร้อยแล้ว (ตามคอลัมน์ที่เลือก)");
    } catch (error) {
      console.error("Export Error:", error);
      toast.error("ไม่สามารถสร้างไฟล์ CSV ได้");
    } finally {
      setIsCsvExporting(false);
    }
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

            <Button 
                className="w-full h-14 mt-4 bg-white hover:bg-zinc-50 text-zinc-900 border-2 border-zinc-200 rounded-2xl font-[1000] text-sm uppercase tracking-widest active:scale-95 transition-all gap-3 shadow-sm" 
                onClick={handleExportCsv}
                disabled={isCsvExporting}
            >
                {isCsvExporting ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileText className="h-5 w-5 text-indigo-600" />}
                Export CSV
            </Button>
          </CardContent>
        </Card>

        {/* Right: Info Area & Advanced Filters */}
        <Card className="md:col-span-2 border-none shadow-xl bg-zinc-50/30 rounded-[2.5rem] p-8 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500" />
            
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <Filter className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-black text-lg text-zinc-900 uppercase tracking-tight">Advanced Filters</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {/* Factory Filter */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                        <Factory className="h-3 w-3" /> Factory
                    </Label>
                    <Select value={factoryFilter} onValueChange={setFactoryFilter}>
                        <SelectTrigger className="border-none bg-white h-12 rounded-2xl font-bold shadow-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl bg-white z-[60]">
                            <SelectItem value="all" className="font-bold">ทุกโรงงาน</SelectItem>
                            <SelectItem value="โรงงาน 1" className="font-bold">โรงงาน 1</SelectItem>
                            <SelectItem value="โรงงาน 2" className="font-bold">โรงงาน 2</SelectItem>
                            <SelectItem value="ทั้ง 2 โรงงาน" className="font-bold">ทั้ง 2 โรงงาน</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                        <Tag className="h-3 w-3" /> Category
                    </Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="border-none bg-white h-12 rounded-2xl font-bold shadow-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl bg-white z-[60]">
                            <SelectItem value="all" className="font-bold">ทุกประเภท</SelectItem>
                            <SelectItem value="computer" className="font-bold">Computer/Laptop</SelectItem>
                            <SelectItem value="printer" className="font-bold">Printer</SelectItem>
                            <SelectItem value="monitor" className="font-bold">Monitor</SelectItem>
                            <SelectItem value="network" className="font-bold">Network</SelectItem>
                            <SelectItem value="other" className="font-bold">อื่นๆ</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1.5">
                        <Activity className="h-3 w-3" /> Status
                    </Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="border-none bg-white h-12 rounded-2xl font-bold shadow-sm">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none shadow-2xl bg-white z-[60]">
                            <SelectItem value="all" className="font-bold">ทุกสถานะ</SelectItem>
                            <SelectItem value="active" className="font-bold text-emerald-600">ใช้งานปกติ</SelectItem>
                            <SelectItem value="broken" className="font-bold text-rose-600">ชำรุด/เสียหาย</SelectItem>
                            <SelectItem value="lost" className="font-bold text-zinc-500">สูญหาย</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-zinc-200 rounded-[2rem] bg-white/50 min-h-[200px]">
                {loading ? (
                    <div className="space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Filtering Data...</p>
                    </div>
                ) : (
                    <div className="space-y-6 w-full">
                        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto">
                            <ShieldCheck className="h-8 w-8 text-emerald-500" />
                        </div>
                        <div>
                            <h4 className="font-black text-xl text-zinc-900 mb-1 uppercase tracking-tight">Report Ready</h4>
                            <p className="text-zinc-500 text-sm font-bold max-w-xs mx-auto leading-relaxed">
                                พบข้อมูลทั้งหมด <span className="text-indigo-600">{assets.length}</span> รายการ 
                                ตรงตามเงื่อนไขที่คุณเลือก
                            </p>
                        </div>
                        <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-zinc-100 inline-flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                {isLandscape ? "A4 Landscape Mode" : "A4 Portrait Mode"}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </Card>
      </div>

      {/* 1.1 Data Preview (On-screen) */}
      <div className="space-y-6 print:hidden">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-black text-sm text-zinc-400 uppercase tracking-[0.3em]">Preview Data ({assets.length})</h3>
        </div>

        {loading ? (
          <div className="bg-zinc-50 rounded-[2rem] py-20 text-center border-2 border-dashed border-zinc-100">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-200" />
          </div>
        ) : assets.length === 0 ? (
          <div className="bg-zinc-50 rounded-[2rem] py-20 text-center border-2 border-dashed border-zinc-100 italic text-zinc-400 font-bold">
            ไม่พบข้อมูลตามเงื่อนไขที่เลือก
          </div>
        ) : (
          <div className="space-y-4">
            {/* Desktop Table Preview */}
            <div className="hidden md:block bg-white rounded-[2rem] shadow-xl border border-zinc-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-900 text-white">
                      {columns.filter(c => selectedColumns.includes(c.id)).map(col => (
                        <th key={col.id} className="p-4 text-[10px] font-black uppercase tracking-widest border-b border-zinc-800">{col.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {assets.slice(0, 10).map((asset, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50 transition-colors border-b border-zinc-50">
                        {columns.filter(c => selectedColumns.includes(c.id)).map(col => {
                          let val = (asset as Record<string, any>)[col.id];
                          if (col.id.toLowerCase().includes("date") || col.id.toLowerCase().includes("expire")) {
                            val = val ? new Date(val).toLocaleDateString("th-TH") : "-";
                          }
                          if (col.id === "status") {
                            const statusMap: Record<string, string> = {
                                active: "ใช้งานปกติ", broken: "ชำรุด", pending: "รอลงทะเบียน", retired: "เลิกใช้", lost: "สูญหาย"
                            };
                            val = statusMap[val as string] || val;
                          }
                          return <td key={col.id} className="p-4 text-xs font-bold text-zinc-600 truncate max-w-[150px]">{val || "-"}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {assets.length > 10 && (
                <div className="p-4 bg-zinc-50 text-center text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Showing first 10 items in preview • {assets.length - 10} more items will be in the actual report
                </div>
              )}
            </div>

            {/* Mobile Card Preview */}
            <div className="md:hidden space-y-3">
              {assets.slice(0, 5).map((asset, idx) => (
                <Card key={idx} className="border-none shadow-md rounded-2xl p-5 bg-white space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-[10px]">
                      {(asset as any).assetCode || "N/A"}
                    </span>
                    <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest opacity-60">
                      {(asset as any).status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2">
                    {columns.filter(c => selectedColumns.includes(c.id) && c.id !== "assetCode" && c.id !== "status").slice(0, 4).map(col => (
                      <div key={col.id}>
                        <p className="text-[8px] font-black text-zinc-300 uppercase tracking-tighter">{col.label}</p>
                        <p className="text-[10px] font-bold text-zinc-600 truncate">{(asset as any)[col.id] || "-"}</p>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
              {assets.length > 5 && (
                <p className="text-center text-[10px] font-black text-zinc-300 uppercase tracking-widest pt-2">
                  + {assets.length - 5} more items
                </p>
              )}
            </div>
          </div>
        )}
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
              <tr key={(asset as { id: string }).id}>
                {columns.filter(c => selectedColumns.includes(c.id)).map(col => {
                  let val = (asset as Record<string, any>)[col.id];
                  if (col.id.toLowerCase().includes("date") || col.id.toLowerCase().includes("expire")) {
                    val = val ? new Date(val).toLocaleDateString("th-TH") : "-";
                  }
                  if (col.id === "status") {
                    const statusMap: Record<string, string> = {
                        active: "ใช้งานปกติ", broken: "ชำรุด", pending: "รอลงทะเบียน", retired: "เลิกใช้", lost: "สูญหาย"
                    };
                    val = statusMap[val as string] || val;
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
