"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Plus, Loader2, ArrowLeft, QrCode } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { generateAssetQRCode } from "@/lib/qr";

interface BulkAsset {
  id: string;
  assetCode: string;
}

export default function BulkPrintPage() {
  const [count, setCount] = useState(10);
  const [category, setCategory] = useState("computer");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQRs, setGeneratedQRs] = useState<{ id: string, assetCode: string, qrData: string }[]>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/assets/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count, category }),
      });

      if (!response.ok) throw new Error("Failed to generate assets");

      const assets: BulkAsset[] = await response.json();
      
      const qrs = await Promise.all(assets.map(async (asset: BulkAsset) => ({
        id: asset.id,
        assetCode: asset.assetCode,
        qrData: await generateAssetQRCode(asset.id)
      })));

      setGeneratedQRs(qrs);
      toast.success(`สร้าง QR จำนวน ${count} ใบ สำหรับหมวดหมู่ ${category} เรียบร้อยแล้ว`);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการสร้าง QR Code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const windowPrint = window.open('', '', 'width=900,height=1000');
    if (windowPrint) {
      const content = document.getElementById('printable-area')?.innerHTML;
      windowPrint.document.write(`
        <html>
          <head>
            <title>Print Bulk QR Codes</title>
            <style>
              @media print {
                .no-print { display: none; }
                @page { 
                  size: A4 portrait; 
                  margin: 5mm; 
                }
                body { margin: 0; padding: 0; background: white; }
              }
              body { font-family: sans-serif; }
              .grid { 
                display: grid; 
                grid-template-columns: repeat(4, 48mm); 
                gap: 0; 
                justify-content: center;
                padding: 5mm 0;
              }
              .sticker { 
                width: 48mm; 
                height: 28mm;
                border: 0.5px solid #000; 
                padding: 2mm; 
                text-align: center;
                page-break-inside: avoid;
                display: flex;
                flex-direction: column;
                justify-content: center;
                box-sizing: border-box;
                background: white;
              }
              .sticker-header { display: flex; align-items: center; justify-content: center; gap: 2mm; flex: 1; }
              .qr-img { width: 18mm; height: 18mm; }
              .asset-info { text-align: left; overflow: hidden; }
              .label { font-size: 6pt; font-weight: bold; color: #666; text-transform: uppercase; line-height: 1; }
              .value { font-size: 10pt; font-family: monospace; font-weight: bold; color: black; line-height: 1.1; margin-top: 1pt; word-break: break-all; }
              .id-text { font-size: 5pt; color: #999; margin-top: 1pt; }
            </style>
          </head>
          <body>
            <div class="grid">
              ${content}
            </div>
            <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
          </body>
        </html>
      `);
      windowPrint.document.close();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-[1000] tracking-tight flex items-center gap-2 uppercase">
            สร้าง QR แบบชุด
          </h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.2em]">Bulk QR Generator (4 Units per Row)</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-zinc-900 text-white">
            <CardTitle className="text-sm font-black uppercase tracking-wider">ตั้งค่าการสร้าง</CardTitle>
            <CardDescription className="text-zinc-400 text-xs">เลือกหมวดหมู่และระบุจำนวน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">หมวดหมู่</Label>
              <Select value={category} onValueChange={(val) => setCategory(val || "other")}>
                <SelectTrigger className="h-12 rounded-2xl border-zinc-100 bg-zinc-50 font-bold">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-2xl border-none shadow-2xl">
                  <SelectItem value="computer" className="font-bold">Computer / Laptop (PC)</SelectItem>
                  <SelectItem value="printer" className="font-bold">Printer (P)</SelectItem>
                  <SelectItem value="monitor" className="font-bold">Monitor (M)</SelectItem>
                  <SelectItem value="network" className="font-bold">Network (W)</SelectItem>
                  <SelectItem value="other" className="font-bold">อื่นๆ (E)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="count" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">จำนวน (Max 100)</Label>
              <Input 
                id="count" 
                type="number" 
                min={1} 
                max={100} 
                value={count} 
                onChange={(e) => setCount(parseInt(e.target.value))} 
                className="h-12 rounded-2xl border-zinc-100 bg-zinc-50 font-black text-lg text-center"
              />
            </div>
            
            <div className="space-y-3 pt-2">
                <Button 
                className="w-full h-14 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-[1000] text-sm uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all" 
                onClick={handleGenerate} 
                disabled={isGenerating}
                >
                {isGenerating ? (
                    <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    กำลังสร้าง...
                    </>
                ) : (
                    <>
                    <Plus className="h-5 w-5" />
                    สร้างรหัสใหม่
                    </>
                )}
                </Button>
                
                {generatedQRs.length > 0 && (
                <Button 
                    variant="outline" 
                    className="w-full h-14 gap-2 border-zinc-200 text-zinc-900 rounded-2xl font-[1000] text-sm uppercase tracking-widest hover:bg-zinc-50 active:scale-95 transition-all" 
                    onClick={handlePrint}
                >
                    <Printer className="h-5 w-5" />
                    พิมพ์ทั้งหมด ({generatedQRs.length})
                </Button>
                )}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-none shadow-xl bg-zinc-50/50 rounded-[2.5rem] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-wider text-zinc-900">ตัวอย่าง (A4 Preview)</CardTitle>
            <CardDescription className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Layout: 4 Stickers per Row</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedQRs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-300 border-2 border-dashed border-zinc-200 rounded-[2rem] bg-white">
                <QrCode className="h-16 w-16 mb-4 opacity-20" />
                <p className="font-bold text-xs uppercase tracking-widest">ยังไม่มีการสร้างรหัส</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 max-h-[600px] overflow-auto p-4 bg-white/80 rounded-[2rem] shadow-inner" id="printable-area">
                {generatedQRs.map((qr) => (
                  <div key={qr.id} className="sticker border border-zinc-200 p-2 bg-white flex flex-col justify-center aspect-[1.7/1] hover:bg-zinc-50 transition-colors cursor-default">
                    <div className="sticker-header flex items-center justify-center gap-2">
                      <img src={qr.qrData} alt="QR" className="qr-img w-[50px] h-[50px]" />
                      <div className="asset-info text-left">
                        <div className="label text-[7px] font-black text-zinc-400 uppercase">MIS Dept</div>
                        <div className="value text-[10px] font-mono font-black break-all uppercase leading-tight text-zinc-900">
                          {qr.assetCode}
                        </div>
                        <div className="id-text text-[5px] text-zinc-300 font-bold mt-0.5">
                          ID: {qr.id.substring(0, 8)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
