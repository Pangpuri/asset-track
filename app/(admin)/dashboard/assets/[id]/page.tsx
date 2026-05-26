"use client";

import { generateAssetQRCode } from "@/lib/qr";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, RefreshCw, Scan, X, Zap, ZapOff, Save } from "lucide-react";
import { AssetReplaceDialog } from "@/components/asset-replace-dialog";
import { cn } from "@/lib/utils";

const assetSchema = z.object({
  assetCode: z.string().min(2, "รหัสอุปกรณ์ต้องมีอย่างน้อย 2 ตัวอักษร"),
  category: z.string().min(1, "กรุณาเลือกประเภทอุปกรณ์"),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  computerName: z.string().optional(),
  monitorSize: z.string().optional(),
  warrantyExpire: z.string().optional(),
  purchaseDate: z.string().optional(),
  receivedBy: z.string().optional(),
  deliveredBy: z.string().optional(),
  ipAddress: z.string().optional(),
  status: z.string().optional(),
  factory: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

interface AssetData {
  id: string;
  assetCode: string | null;
  assetName?: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  location: string | null;
  status: string;
  factory: string | null;
  receivedBy: string | null;
  deliveredBy: string | null;
  purchaseDate: string | null;
  warrantyExpire: string | null;
  specifications?: {
    computerName?: string;
    ipAddress?: string;
    monitorSize?: string;
  } | null;
}

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [assetData, setAssetData] = useState<AssetData | null>(null);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);
  
  // Camera Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [isFlashOn, setIsFlashOn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting, errors } } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
  });

  const selectedCategory = watch("category");

  const startScanning = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Start Detection Loop
        if ("BarcodeDetector" in window) {
          interface DetectedBarcode {
            rawValue: string;
            format: string;
          }
          interface BarcodeDetectorOptions {
            formats?: string[];
          }
          interface BarcodeDetector {
            detect(source: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement): Promise<DetectedBarcode[]>;
          }
          const BarcodeDetectorClass = (window as unknown as { 
            BarcodeDetector: new (options?: BarcodeDetectorOptions) => BarcodeDetector 
          }).BarcodeDetector;
          
          const detector = new BarcodeDetectorClass({
            formats: ["code_128", "code_39", "ean_13", "qr_code"]
          });

          const detectLoop = async () => {
            if (!videoRef.current || videoRef.current.paused) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes.length > 0) {
                const sn = barcodes[0].rawValue;
                setValue("serialNumber", sn);
                toast.success(`พบ S/N: ${sn}`);
                stopScanning();
              } else {
                requestAnimationFrame(detectLoop);
              }
            } catch (e) {
              requestAnimationFrame(detectLoop);
            }
          };
          detectLoop();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("ไม่สามารถเข้าถึงกล้องได้");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const toggleFlash = async () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    const track = stream?.getVideoTracks()[0];
    if (track && "applyConstraints" in track) {
      try {
        const newFlash = !isFlashOn;
        // Fix (track as any) by using a more specific constraint check
        interface MediaStreamTrackWithTorch extends MediaStreamTrack {
          applyConstraints(constraints?: MediaTrackConstraints & { advanced?: Array<{ torch?: boolean }> }): Promise<void>;
        }
        await (track as unknown as MediaStreamTrackWithTorch).applyConstraints({
          advanced: [{ torch: newFlash }]
        });
        setIsFlashOn(newFlash);
      } catch (e) {
        toast.error("อุปกรณ์ไม่รองรับการเปิดไฟแฟลช");
      }
    }
  };

  useEffect(() => {
    const fetchAsset = async () => {
      const res = await fetch(`/api/assets/${params.id}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setAssetData(data);
        reset({
          ...data,
          computerName: data.specifications?.computerName || "",
          ipAddress: data.specifications?.ipAddress || "",
          monitorSize: data.specifications?.monitorSize || "",
          receivedBy: data.receivedBy || "",
          deliveredBy: data.deliveredBy || "",
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString().split('T')[0] : "",
          warrantyExpire: data.warrantyExpire ? new Date(data.warrantyExpire).toISOString().split('T')[0] : "",
          factory: data.factory || "",
        });
        setLoading(false);
      } else {
        toast.error("ไม่พบข้อมูลอุปกรณ์");
        router.push("/dashboard/assets");
      }
    };
    fetchAsset();
  }, [params.id, reset, router]);

  const onSubmit = async (data: AssetFormValues) => {
    try {
      const response = await fetch(`/api/assets/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();
      toast.success("อัปเดตข้อมูลอุปกรณ์เรียบร้อยแล้ว");
      router.push("/dashboard/assets");
      router.refresh();
    } catch (error) {
      toast.error("ไม่สามารถอัปเดตข้อมูลได้");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /> กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="active:opacity-50 text-black">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-black tracking-tight text-black">แก้ไข {assetData?.assetCode || "อุปกรณ์"}</h1>
        </div>
        <div className="flex gap-2">
          {assetData?.status === "active" && (
            <Button variant="ghost" className="text-orange-500 p-0 hover:bg-transparent" onClick={() => setShowReplaceDialog(true)}>
              <RefreshCw className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {showReplaceDialog && (
        <AssetReplaceDialog
          oldAssetId={params.id as string}
          oldAssetCode={assetData?.assetCode || "NEW-QR"}
          onClose={() => setShowReplaceDialog(false)}
        />
      )}

      <div className="max-w-lg mx-auto p-4 pt-8 space-y-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 pb-20">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">โรงงาน/สาขาที่สังกัด</Label>
              <Select onValueChange={(v) => setValue("factory", v as string)} value={watch("factory") || ""}>
                <SelectTrigger className="border-none bg-gray-50 h-14 rounded-2xl font-bold text-zinc-900">
                  <SelectValue placeholder="เลือกโรงงาน (ถ้ามี)" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl border-none bg-white z-[60]">
                  <SelectItem value="โรงงาน 1" className="font-bold">โรงงาน 1</SelectItem>
                  <SelectItem value="โรงงาน 2" className="font-bold">โรงงาน 2</SelectItem>
                  <SelectItem value="ทั้ง 2 โรงงาน" className="font-bold">ทั้ง 2 โรงงาน</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Code</Label>
                <Input {...register("assetCode")} className="border-none bg-gray-50 h-14 rounded-2xl text-lg font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">สถานะ</Label>
                <Select onValueChange={(v) => setValue("status", v as string)} value={watch("status") ?? "active"}>
                  <SelectTrigger className="border-none bg-gray-50 h-14 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl border-none bg-white z-[60]">
                    <SelectItem value="active">ใช้งานปกติ</SelectItem>
                    <SelectItem value="pending">รอลงทะเบียน</SelectItem>
                    <SelectItem value="broken">ชำรุด/เสียหาย</SelectItem>
                    <SelectItem value="lost">สูญหาย</SelectItem>
                    <SelectItem value="retired">เลิกใช้งาน</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              </div>

              <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ประเภทอุปกรณ์</Label>
              <Select onValueChange={(v) => setValue("category", v as string)} value={watch("category") || ""}>
                <SelectTrigger className="border-none bg-gray-50 h-14 rounded-2xl font-bold"><SelectValue placeholder="เลือกประเภท" /></SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl border-none bg-white z-[60]">
                  <SelectItem value="computer">คอมพิวเตอร์/โน้ตบุ๊ค</SelectItem>
                  <SelectItem value="printer">เครื่องพิมพ์</SelectItem>
                  <SelectItem value="network">อุปกรณ์เครือข่าย</SelectItem>
                  <SelectItem value="monitor">จอภาพ</SelectItem>
                  <SelectItem value="other">อื่นๆ</SelectItem>
                </SelectContent>
              </Select>
              </div>          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ยี่ห้อ</Label>
              <Input {...register("brand")} className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">รุ่น</Label>
              <Input {...register("model")} className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Serial Number</Label>
              <div className="relative group">
                <Input 
                  {...register("serialNumber")} 
                  className="border-none bg-gray-50 h-14 pr-14 rounded-2xl font-mono text-lg font-bold focus:ring-4 focus:ring-blue-500/5 transition-all" 
                  placeholder="สแกนหรือพิมพ์ S/N"
                />
                <button
                  type="button"
                  onClick={startScanning}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-zinc-900 text-white rounded-xl flex items-center justify-center hover:bg-black active:scale-90 transition-all shadow-lg shadow-zinc-900/20"
                >
                  <Scan size={18} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">สถานที่ติดตั้ง</Label>
              <Input {...register("location")} className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
            </div>
          </div>

          {(selectedCategory === "computer" || selectedCategory === "monitor" || selectedCategory === "network") && (
            <div className="bg-blue-50/50 p-6 rounded-[2rem] space-y-4">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">ข้อมูลเฉพาะของ {selectedCategory}</p>
              {selectedCategory === "computer" && <Input {...register("computerName")} placeholder="Computer Name" className="bg-white border-none h-12 rounded-xl font-bold" />}
              {selectedCategory === "monitor" && <Input {...register("monitorSize")} placeholder="Size (e.g. 24 inch)" className="bg-white border-none h-12 rounded-xl font-bold" />}
              {selectedCategory === "network" && <Input {...register("ipAddress")} placeholder="IP Address" className="bg-white border-none h-12 rounded-xl font-mono" />}
            </div>
          )}

          <div className="border-t border-gray-50 pt-8 space-y-6 pb-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">การส่งมอบ</p>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 ml-1">ผู้รับมอบ/ผู้ใช้งาน</Label>
              <Input {...register("receivedBy")} className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label className="text-xs text-gray-500 ml-1">วันที่ส่งมอบ</Label>
                <Input type="date" {...register("purchaseDate")} className="border-none bg-gray-50 h-12 rounded-xl font-bold uppercase text-[10px]" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 ml-1">วันหมดประกัน</Label>
                <Input type="date" {...register("warrantyExpire")} className="border-none bg-gray-50 h-12 rounded-xl font-bold uppercase text-[10px]" />
              </div>
            </div>
          </div>

          {/* Floating Save Button at the bottom */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 z-40 flex justify-center">
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="w-full max-w-lg h-14 bg-zinc-900 hover:bg-black text-white rounded-2xl font-[1000] text-lg uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all gap-3"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <Save className="h-6 w-6" />
                  <span>บันทึกการแก้ไข</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      {isScanning && (
        <div className="fixed inset-0 z-[2000] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-10 pt-safe">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
              <span className="text-white text-xs font-black uppercase tracking-widest">Scanning S/N</span>
            </div>
            <button onClick={stopScanning} className="text-white p-2 bg-white/10 backdrop-blur-md rounded-full active:scale-90 transition-all"><X size={24} /></button>
          </div>

          <div className="relative w-full aspect-[3/4] max-w-md overflow-hidden flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 border-2 border-white/20 rounded-3xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 border-t-2 border-b-2 border-indigo-50 rounded-3xl animate-pulse" />
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-72 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-bounce shadow-[0_0_15px_rgba(99,102,241,1)]" />
            </div>
          </div>

          <div className="p-10 flex flex-col items-center gap-6 w-full max-w-md">
            <div className="flex gap-4">
              <button type="button" onClick={toggleFlash} className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-all active:scale-90", isFlashOn ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20" : "bg-white/10 text-white")}>
                {isFlashOn ? <Zap size={24} /> : <ZapOff size={24} />}
              </button>
            </div>
            <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] text-center leading-relaxed">วางบาร์โค้ดให้อยู่ในกรอบสแกน<br />ระบบจะตรวจจับอัตโนมัติ</p>
          </div>
        </div>
      )}
    </div>
  );
}
