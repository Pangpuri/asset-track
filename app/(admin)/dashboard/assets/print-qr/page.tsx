"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer, Plus, Loader2, ArrowLeft, QrCode } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { generateAssetQRCode } from "@/lib/qr";

export default function BulkPrintPage() {
  const [count, setCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQRs, setGeneratedQRs] = useState<{ id: string, qrData: string }[]>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/assets/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });

      if (!response.ok) throw new Error("Failed to generate assets");

      const assets = await response.json();
      
      const qrs = await Promise.all(assets.map(async (asset: any) => ({
        id: asset.id,
        qrData: await generateAssetQRCode(asset.id)
      })));

      setGeneratedQRs(qrs);
      toast.success(`สร้าง QR เปล่าจำนวน ${count} ใบ เรียบร้อยแล้ว`);
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
              .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
              .sticker { 
                width: 300px; 
                border: 2px solid black; 
                padding: 10px; 
                text-align: center;
                page-break-inside: avoid;
              }
              .sticker-header { display: flex; align-items: center; justify-content: center; gap: 15px; }
              .qr-img { width: 120px; }
              .asset-info { text-align: left; }
              .label { font-size: 14px; font-weight: bold; }
              .value { font-size: 18px; font-weight: bold; color: #666; }
              .footer { margin-top: 10px; border-top: 1px solid #ccc; padding-top: 5px; font-size: 12px; font-weight: bold; }
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
        <Link href="/dashboard/assets">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <QrCode className="h-8 w-8 text-blue-600" />
            พิมพ์ QR Code ไม่เก็บข้อมูล
          </h1>
          <p className="text-muted-foreground">สร้าง QR Code เปล่าที่ใช้ทะเบียนภายหลัง</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>ตั้งค่าการสร้าง</CardTitle>
            <CardDescription>ระบุจำนวน QR Code ที่ต้องการสร้าง</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="count">จำนวน (1-100)</Label>
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
              className="w-full gap-2 bg-blue-600" 
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
                  สร้าง QR Code ใหม่
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
                พิมพ์ทั่งหมด ({generatedQRs.length} ใบ)
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>ตัวอย่างสติกเกอร์</CardTitle>
            <CardDescription>สติกเกอร์ที่สร้างขึ้นจะแสดงที่นี่</CardDescription>
          </CardHeader>
          <CardContent>
            {generatedQRs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
                <QrCode className="h-12 w-12 mb-4 opacity-20" />
                <p>ยังไม่มีการสร้าง QR Code</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] overflow-auto p-2" id="printable-area">
                {generatedQRs.map((qr, index) => (
                  <div key={qr.id} className="sticker border-2 border-black p-3 rounded-lg bg-white shadow-sm">
                    <div className="sticker-header flex items-center justify-center gap-4">
                      <img src={qr.qrData} alt="QR" className="qr-img w-[100px]" />
                      <div className="asset-info text-left">
                        <div className="label text-[12px] font-bold">AssetID</div>
                        <div className="value text-[14px] font-mono font-bold break-all opacity-50 uppercase">
                          NEW-QR
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-1">
                          ID: {qr.id.substring(0, 8)}...
                        </div>
                      </div>
                    </div>
                    <div className="footer mt-2 border-t border-gray-200 pt-2 text-[10px] font-bold text-center">
                      พัฒนาโดยฝ่าย MIS
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
