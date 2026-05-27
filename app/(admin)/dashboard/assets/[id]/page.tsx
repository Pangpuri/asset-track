"use client";

import { generateAssetQRCode } from "@/lib/qr";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
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
  // ข้อมูลการจำหน่ายออก
  disposalReason: z.string().optional(),
  disposalMethod: z.string().optional(),
  disposalValue: z.string().optional(),
  disposalAuthorizedBy: z.string().optional(),
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
  disposalReason?: string | null;
  disposalMethod?: string | null;
  disposalValue?: string | null;
  disposalAuthorizedBy?: string | null;
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
  const [countdown, setCountdown] = useState(0); 
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanningLoopRef = useRef<number | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting, errors } } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
  });

  const selectedCategory = watch("category");
  const assetCodeValue = watch("assetCode");
  const [isCodeTaken, setIsCodeTaken] = useState(false);

  useEffect(() => {
    if (!assetCodeValue || assetCodeValue.length < 3) return;
    
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/assets/bulk?checkCode=${encodeURIComponent(assetCodeValue)}&excludeId=${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setIsCodeTaken(data.exists);
        }
      } catch (e) {
        console.error(e);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [assetCodeValue, params.id]);

  const stopScanning = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    if (scanningLoopRef.current) cancelAnimationFrame(scanningLoopRef.current);
    setIsScanning(false);
    setCountdown(0);
  }, []);

  const startScanning = async () => {
    setIsScanning(true);
    setCountdown(2);
    const startTime = Date.now();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = () => {
          if (!("BarcodeDetector" in window)) {
            toast.error("เบราว์เซอร์ไม่รองรับการสแกนบาร์โค้ด");
            return;
          }

          interface DetectedBarcode {
            rawValue: string;
            boundingBox: DOMRectReadOnly;
          }
          interface BarcodeDetectorOptions {
            formats?: string[];
          }
          interface BarcodeDetector {
            detect(source: HTMLVideoElement): Promise<DetectedBarcode[]>;
          }

          const BarcodeDetectorClass = (window as unknown as { 
            BarcodeDetector: new (options?: BarcodeDetectorOptions) => BarcodeDetector 
          }).BarcodeDetector;

          const detector = new BarcodeDetectorClass({
            formats: ["code_128", "code_39", "ean_13", "qr_code", "upc_a", "upc_e"]
          });

          const detectLoop = async () => {
            if (!videoRef.current) return;

            const now = Date.now();
            const elapsed = now - startTime;

            // Visual Countdown logic
            if (elapsed < 1000) setCountdown(2);
            else if (elapsed < 2000) setCountdown(1);
            else setCountdown(0);

            // Start actual detection after 2 seconds
            if (elapsed >= 2000 && now - lastScanTimeRef.current > 300) {
              lastScanTimeRef.current = now;
              try {
                if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                  const barcodes = await detector.detect(videoRef.current);
                  
                  const centerY = videoRef.current.videoHeight / 2;
                  const targetBarcode = barcodes
                    .filter(b => /^[a-zA-Z0-9-_.]{3,}$/.test(b.rawValue.trim()))
                    .sort((a, b) => {
                      const distA = Math.abs((a.boundingBox.top + a.boundingBox.bottom) / 2 - centerY);
                      const distB = Math.abs((b.boundingBox.top + b.boundingBox.bottom) / 2 - centerY);
                      return distA - distB;
                    })[0];

                  if (targetBarcode) {
                    const sn = targetBarcode.rawValue.trim();
                    setValue("serialNumber", sn);
                    toast.success(`พบ S/N: ${sn}`);
                    stopScanning();
                    return;
                  }
                }
              } catch (e) {
                console.error("Detection error:", e);
              }
            }
            scanningLoopRef.current = requestAnimationFrame(detectLoop);
          };
          
          scanningLoopRef.current = requestAnimationFrame(detectLoop);
        };
      }
    } catch (err) {
      console.error(err);
      toast.error("ไม่สามารถเข้าถึงกล้องได้");
      setIsScanning(false);
    }
  };

  const toggleFlash = async () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    const track = stream?.getVideoTracks()[0];

    interface TorchConstraint extends MediaTrackConstraintSet {
      torch?: boolean;
    }

    if (track && "applyConstraints" in track) {
      try {
        const newFlash = !isFlashOn;
        await track.applyConstraints({
          advanced: [{ torch: newFlash } as TorchConstraint]
        } as MediaTrackConstraints);
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
    return () => {
      if (scanningLoopRef.current) cancelAnimationFrame(scanningLoopRef.current);
    };
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

          {watch("status") === "retired" && (
            <div className="border-t-4 border-rose-100 bg-rose-50/30 p-6 rounded-[2rem] space-y-6 animate-in slide-in-from-top-4 duration-500">
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                ข้อมูลการจำหน่ายออก (Disposal Information)
              </p>
              
              <div className="space-y-2">
                <Label className="text-xs text-rose-700 font-bold ml-1">สาเหตุการจำหน่าย</Label>
                <Input {...register("disposalReason")} placeholder="เช่น ชำรุดซ่อมไม่คุ้ม, ตกรุ่น, สูญหาย" className="bg-white border-rose-100 h-12 rounded-xl font-bold focus:ring-rose-200" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-rose-700 font-bold ml-1">วิธีการจำหน่าย</Label>
                  <Input {...register("disposalMethod")} placeholder="ขาย, บริจาค, ทิ้ง" className="bg-white border-rose-100 h-12 rounded-xl font-bold" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-rose-700 font-bold ml-1">มูลค่าจำหน่าย (บาท)</Label>
                  <Input {...register("disposalValue")} type="number" step="0.01" placeholder="0.00" className="bg-white border-rose-100 h-12 rounded-xl font-bold" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-rose-700 font-bold ml-1">ผู้อนุมัติการจำหน่าย</Label>
                <Input {...register("disposalAuthorizedBy")} className="bg-white border-rose-100 h-12 rounded-xl font-bold" />
              </div>
            </div>
          )}

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
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-72 h-20 border-2 border-white/40 rounded-2xl relative overflow-hidden bg-white/5">
                {countdown > 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-indigo-600/20 backdrop-blur-[2px]">
                     <span className="text-6xl font-black text-white drop-shadow-2xl animate-bounce">{countdown}</span>
                     <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] mt-2">เตรียมเล็ง...</span>
                  </div>
                ) : (
                  <>
                    <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,1)] animate-pulse" />
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl" />
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl" />
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl" />
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl" />
                  </>
                )}
              </div>
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
