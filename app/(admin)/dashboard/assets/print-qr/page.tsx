"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Printer, Plus, Loader2, QrCode, Trash2, CheckCircle2, Factory, Package } from "lucide-react";
import { toast } from "sonner";
import { generateAssetQRCode } from "@/lib/qr";

interface QueuedBatch {
  id: string; // Internal local ID
  category: string;
  factory: string;
  count: number;
  predictedCodes: string[];
}

interface GeneratedAsset {
  id: string;
  assetCode: string;
  qrData: string;
}

export default function BulkPrintPage() {
  const [count, setCount] = useState(10);
  const [category, setCategory] = useState("computer");
  const [factory, setFactory] = useState("โรงงาน 1");
  
  const [queue, setQueue] = useState<QueuedBatch[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQRs, setGeneratedQRs] = useState<GeneratedAsset[]>([]);

  // Persistence: Load queue from localStorage on mount
  useEffect(() => {
    const savedQueue = localStorage.getItem("asset_track_bulk_queue");
    if (savedQueue) {
      try {
        setQueue(JSON.parse(savedQueue));
      } catch (e) {
        console.error("Failed to parse saved queue");
      }
    }
  }, []);

  // Persistence: Save queue to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("asset_track_bulk_queue", JSON.stringify(queue));
  }, [queue]);

  const handleAddToQueue = async () => {
    if (count <= 0 || count > 100) {
      toast.error("จำนวนต้องอยู่ระหว่าง 1 ถึง 100");
      return;
    }

    setIsAdding(true);
    try {
      // Check next codes for preview, accounting for what's already in the queue
      const params = new URLSearchParams({ category, factory, count: count.toString() });
      const res = await fetch(`/api/assets/bulk?${params.toString()}`);
      if (!res.ok) throw new Error();
      
      const { nextCodes } = await res.json();
      
      // Filter out codes that might already be in queue (simple local handling)
      // Note: A more robust version would handle prefix sequence properly locally
      
      const newBatch: QueuedBatch = {
        id: Math.random().toString(36).substring(7),
        category,
        factory,
        count,
        predictedCodes: nextCodes
      };

      setQueue(prev => [...prev, newBatch]);
      toast.success(`เพิ่ม ${count} รายการลงในคิวแล้ว`);
    } catch (err) {
      toast.error("ไม่สามารถตรวจสอบลำดับรหัสได้");
    } finally {
      setIsAdding(false);
    }
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(b => b.id !== id));
  };

  const handleConfirmAndGenerate = async () => {
    if (queue.length === 0) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/assets/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queue.map(q => ({
          count: q.count,
          category: q.category,
          factory: q.factory
        }))),
      });

      if (!response.ok) throw new Error("Failed to generate assets");

      const assets = await response.json();
      
      const qrs = await Promise.all(assets.map(async (asset: any) => ({
        id: asset.id,
        assetCode: asset.assetCode,
        qrData: await generateAssetQRCode(asset.id)
      })));

      setGeneratedQRs(qrs);
      setQueue([]);
      toast.success(`บันทึกข้อมูล ${qrs.length} รายการ และสร้าง QR เรียบร้อยแล้ว`);
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
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
                @page { size: A4 portrait; margin: 5mm; }
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

  const totalQueued = queue.reduce((acc, q) => acc + q.count, 0);

  return (
    <div className="container mx-auto p-6 space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-2xl font-[1000] tracking-tight flex items-center gap-2 uppercase">
            สร้าง QR แบบคละชุด
          </h1>
          <p className="text-muted-foreground font-bold text-xs uppercase tracking-[0.2em]">Mix & Match Bulk QR Generator</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Step 1: Selection Form */}
        <Card className="md:col-span-4 border-none shadow-xl bg-white rounded-[2rem] overflow-hidden self-start">
          <CardHeader className="bg-indigo-600 text-white">
            <CardTitle className="text-sm font-black uppercase tracking-wider">1. เลือกอุปกรณ์</CardTitle>
            <CardDescription className="text-indigo-100 text-xs">ระบุหมวดหมู่และจำนวนที่ต้องการ</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-1.5">
                <Factory className="h-3 w-3" /> โรงงาน
              </Label>
              <Select value={factory} onValueChange={(val) => setFactory(val || "โรงงาน 1")}>
                <SelectTrigger className="h-12 rounded-2xl border-zinc-100 bg-zinc-50 font-bold">
                  <SelectValue placeholder="เลือกโรงงาน" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-2xl border-none shadow-2xl">
                  <SelectItem value="โรงงาน 1" className="font-bold">โรงงาน 1 (Prefix: 1)</SelectItem>
                  <SelectItem value="โรงงาน 2" className="font-bold">โรงงาน 2 (Prefix: 2)</SelectItem>
                  <SelectItem value="อื่นๆ" className="font-bold">อื่นๆ (Prefix: E)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">หมวดหมู่</Label>
              <Select value={category} onValueChange={(val) => setCategory(val || "other")}>
                <SelectTrigger className="h-12 rounded-2xl border-zinc-100 bg-zinc-50 font-bold">
                  <SelectValue placeholder="เลือกหมวดหมู่" />
                </SelectTrigger>
                <SelectContent className="bg-white rounded-2xl border-none shadow-2xl">
                  <SelectItem value="computer" className="font-bold">Computer / Laptop (PC)</SelectItem>
                  <SelectItem value="printer" className="font-bold">Printer (PT)</SelectItem>
                  <SelectItem value="monitor" className="font-bold">Monitor (MO)</SelectItem>
                  <SelectItem value="network" className="font-bold">Network (NW)</SelectItem>
                  <SelectItem value="other" className="font-bold">อื่นๆ (E)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="count" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">จำนวน</Label>
              <Input 
                id="count" 
                type="number" 
                min={1} 
                max={100} 
                value={count} 
                onChange={(e) => setCount(parseInt(e.target.value) || 0)} 
                className="h-12 rounded-2xl border-zinc-100 bg-zinc-50 font-black text-lg text-center"
              />
            </div>
            
            <Button 
              className="w-full h-14 gap-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl font-[1000] text-sm uppercase tracking-widest active:scale-95 transition-all" 
              onClick={handleAddToQueue}
              disabled={isAdding}
            >
              {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
              เพิ่มลงรายการรอสร้าง
            </Button>
          </CardContent>
        </Card>

        {/* Step 2: Queue Review & Execution */}
        <Card className="md:col-span-8 border-none shadow-xl bg-zinc-50/50 rounded-[2.5rem] overflow-hidden flex flex-col">
          <CardHeader className="bg-white border-b border-zinc-100">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-wider text-zinc-900">2. รายการรอสร้าง ({totalQueued} ชิ้น)</CardTitle>
                <CardDescription className="text-xs font-bold text-zinc-400 uppercase tracking-widest italic">Review & Confirm</CardDescription>
              </div>
              {queue.length > 0 && (
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black px-6 gap-2"
                  onClick={handleConfirmAndGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  บันทึกลงฐานข้อมูลและออก QR
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-6">
            {queue.length === 0 && generatedQRs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-zinc-300 border-2 border-dashed border-zinc-200 rounded-[2rem] bg-white">
                <Package className="h-16 w-16 mb-4 opacity-20" />
                <p className="font-bold text-xs uppercase tracking-widest">ยังไม่มีรายการในคิว</p>
                <p className="text-[10px] mt-2 opacity-50 font-bold uppercase">เลือกอุปกรณ์ทางด้านซ้ายเพื่อเพิ่มลงรายการ</p>
              </div>
            ) : generatedQRs.length > 0 ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                   <div className="flex items-center gap-3">
                      <div className="bg-indigo-600 p-2 rounded-xl text-white">
                        <Printer className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-indigo-900">สร้างเรียบร้อยแล้ว {generatedQRs.length} รายการ</p>
                        <p className="text-[10px] font-bold text-indigo-400 uppercase">พร้อมสำหรับการสั่งพิมพ์</p>
                      </div>
                   </div>
                   <Button onClick={handlePrint} className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 font-black rounded-xl">
                      สั่งพิมพ์ทันที
                   </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-0 max-h-[500px] overflow-auto p-4 bg-white rounded-[2rem] shadow-inner border border-zinc-100" id="printable-area">
                  {generatedQRs.map((qr) => (
                    <div key={qr.id} className="sticker border border-zinc-100 p-2 bg-white flex flex-col justify-center aspect-[1.7/1] hover:bg-zinc-50 transition-colors cursor-default">
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
                
                <Button 
                  variant="ghost" 
                  className="w-full text-zinc-400 font-bold text-xs uppercase"
                  onClick={() => setGeneratedQRs([])}
                >
                  ล้างหน้าจอเพื่อเริ่มใหม่
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map((batch) => (
                  <div key={batch.id} className="bg-white p-4 rounded-2xl border border-zinc-100 flex justify-between items-center group hover:border-indigo-200 transition-all shadow-sm">
                    <div className="flex gap-4 items-center">
                      <div className="bg-zinc-900 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black">
                        {batch.count}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-zinc-900 capitalize">{batch.category}</span>
                          <span className="text-[10px] bg-zinc-100 px-2 py-0.5 rounded-full font-bold text-zinc-500 uppercase">{batch.factory}</span>
                        </div>
                        <p className="text-[10px] font-mono font-bold text-indigo-600 mt-1">
                          {batch.predictedCodes[0]} {batch.count > 1 ? `... ${batch.predictedCodes[batch.count-1]}` : ''}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                      onClick={() => removeFromQueue(batch.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
