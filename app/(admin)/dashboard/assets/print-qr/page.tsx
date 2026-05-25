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

      const assets = await response.json();
      
      const qrs = await Promise.all(assets.map(async (asset: any) => ({
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
    const windowPrint = window.open('', '', 'width=800,height=1000');
    if (windowPrint) {
      const content = document.getElementById('printable-area')?.innerHTML;
      windowPrint.document.write(`
        <html>
          <head>
            <title>Print Bulk QR Codes</title>
            <style>
              @media print {
                .no-print { display: none; }
              }
              body { font-family: sans-serif; margin: 0; padding: 20px; }
              .grid { display: grid; grid-template-columns: repeat(auto-fill, 170px); gap: 10px; }
              .sticker { 
                width: 170px; 
                height: 95px;
                border: 1px solid black; 
                padding: 5px; 
                text-align: center;
                page-break-inside: avoid;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                box-sizing: border-box;
                background: white;
              }
              .sticker-header { display: flex; align-items: center; justify-content: center; gap: 8px; flex: 1; }
              .qr-img { width: 65px; height: 65px; }
              .asset-info { text-align: left; }
              .label { font-size: 8px; font-weight: bold; color: #666; }
              .value { font-size: 11px; font-mono font-bold black; line-height: 1.1; }
              .footer { border-top: 0.5px solid #eee; padding-top: 2px; font-size: 8px; font-weight: bold; }
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
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            สร้าง QR ตามประเภทอุปกรณ์ 
          </h1>
          <p className="text-muted-foreground">สร้างรหัสทรัพย์สินและ QR Code แบบรันหมายเลขตามหมวดหมู่</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>ตั้งค่าการสร้าง</CardTitle>
            <CardDescription>เลือกหมวดหมู่และระบุจำนวน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>หมวดหมู่ที่ต้องการสร้าง</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="computer">Computer / Laptop (PC)</SelectItem>
                  <SelectItem value="printer">Printer (P)</SelectItem>
                  <SelectItem value="monitor">Monitor (M)</SelectItem>
                  <SelectItem value="network">Network (W)</SelectItem>
                  <SelectItem value="other">อื่นๆ (E)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="count">จำนวนที่สร้าง (1-100)</Label>
              <Input 
                id="count" 
                type="number" 
                min={1} 
                max={100} 
                value={count} 
                onChange={(e) => setCount(parseInt(e.target.value))} 
              />
            </div>
            
            <Button 
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700" 
              onClick={handleGenerate} 
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  กำลังสร้าง...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  สร้างรหัสและ QR ใหม่
                </>
              )}
            </Button>
            
            {generatedQRs.length > 0 && (
              <Button 
                variant="outline" 
                className="w-full gap-2 border-green-600 text-green-600 hover:bg-green-50" 
                onClick={handlePrint}
              >
                <Printer className="h-4 w-4" />
                พิมพ์ทั้งหมด ({generatedQRs.length} ใบ)
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>ตัวอย่างสติกเกอร์ที่สร้าง</CardTitle>
            <CardDescription>รหัสทรัพย์สินจะถูกรันหมายเลขให้อัตโนมัติ</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedQRs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                <QrCode className="h-12 w-12 mb-4 opacity-20" />
                <p>ยังไม่มีการสร้างรหัสทรัพย์สิน</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-auto p-2" id="printable-area">
                {generatedQRs.map((qr) => (
                  <div key={qr.id} className="sticker border border-black p-2 rounded bg-white shadow-sm w-[170px] h-[95px] flex flex-col justify-between mx-auto">
                    <div className="sticker-header flex items-center justify-center gap-2 flex-1">
                      <img src={qr.qrData} alt="QR" className="qr-img w-[65px] h-[65px]" />
                      <div className="asset-info text-left">
                        <div className="label text-[8px] font-bold text-gray-500 uppercase">ฝ่าย MIS</div>
                        <div className="value text-[12px] font-mono font-bold break-all uppercase leading-tight">
                          {qr.assetCode}
                        </div>
                        <div className="text-[6px] text-muted-foreground mt-0.5">
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
