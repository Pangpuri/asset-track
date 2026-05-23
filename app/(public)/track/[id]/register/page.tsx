"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, MoreHorizontal, Info, ShieldCheck, Camera, X, Scan } from "lucide-react";
import Link from "next/link";

const registerSchema = z.object({
  assetCode: z.string().min(2, "กรุณาระบุรหัสทรัพย์สิน").optional().or(z.literal("")),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  assignedTo: z.string().min(2, "โปรดระบุชื่อผู้ใช้งานหรือผู้รับผิดชอบ"),
  department: z.string().min(1, "กรุณาระบุแผนก"),
  location: z.string().min(1, "กรุณาระบุสถานที่ใช้งาน/จุดติดตั้ง"),
  assignedBy: z.string().optional(),
  notes: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface Asset {
  id: string;
  assetCode: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  serialNumber: string | null;
  location: string | null;
  status: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;

  // ย้าย useForm ขึ้นมาประกาศก่อนการเรียกใช้ใน useEffect
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const scanningLoopRef = useRef<number | null>(null);
  const lastScanTimeRef = useRef<number>(0);

  // Scanner States
  const [isScannerOpen, setScannerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ดึงค่า category จาก form เพื่อให้ Select แสดงผลถูกต้อง
  const categoryValue = watch("category");

  useEffect(() => {
    const fetchAsset = async () => {
      try {
        const res = await fetch(`/api/assets?id=${assetId}`);
        if (res.ok) {
          const data = await res.json();
          setAsset(data);
          if (data.assetCode) setValue("assetCode", data.assetCode);
          if (data.category) setValue("category", data.category);
          if (data.brand) setValue("brand", data.brand);
          if (data.model) setValue("model", data.model);
          if (data.serialNumber) setValue("serialNumber", data.serialNumber);
          if (data.location) setValue("location", data.location);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [assetId]);

  // Improved Camera Stream Logic
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startBarcodeDetection = async (videoElement: HTMLVideoElement) => {
      if (!('BarcodeDetector' in window)) return;

      const startTime = Date.now();

      // Regex for common serial number patterns (alphanumeric, hyphens, min 5 chars)
      const serialNumberRegex = /^[a-zA-Z0-9-]{5,}$/;

      // @ts-expect-error: BarcodeDetector API is not yet part of the standard TypeScript DOM library types.
      // This is necessary because BarcodeDetector is a relatively new Web API and its types might not be
      // fully integrated into the default 'dom' lib for all TypeScript versions.
      const barcodeDetector = new window.BarcodeDetector({
        formats: ['code_128', 'code_39', 'qr_code', 'ean_13']
      });

      const detect = async (time: number) => {
        if (videoElement && isScannerOpen) {
          const now = Date.now();
          
          if (now - startTime > 1500 && now - lastScanTimeRef.current > 500) {
            lastScanTimeRef.current = now;
            
          try {
            const barcodes = await barcodeDetector.detect(videoElement);
            if (barcodes.length > 0) {
              const scannedValue = barcodes[0].rawValue.trim(); // Get the raw value and trim whitespace

              if (serialNumberRegex.test(scannedValue)) {
                setValue("serialNumber", scannedValue);
                toast.success(`สแกนสำเร็จ: ${scannedValue}`);
                setScannerOpen(false); // Close scanner on successful and valid scan
                return; // Stop scanning loop
              } else {
                toast.error("ไม่พบ Serial Number ที่ถูกต้อง กรุณาลองใหม่");
                // Continue scanning if the detected barcode is not a valid serial number
              }
            }
          } catch (e) {
              console.error("Detection error:", e);
          }
          }

          scanningLoopRef.current = requestAnimationFrame(detect);
        }
      };
      scanningLoopRef.current = requestAnimationFrame(detect);
    };

    const startCamera = async () => {
      if (isScannerOpen && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } } 
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            startBarcodeDetection(videoRef.current);
          }
        } catch (err) {
          console.error("Camera access error:", err);
          toast.error("ไม่สามารถเข้าถึงกล้องได้");
          setScannerOpen(false);
        }
      }
    };

    startCamera();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
      if (scanningLoopRef.current) cancelAnimationFrame(scanningLoopRef.current);
    };
  }, [isScannerOpen]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      if (asset?.status === "pending") {
        if (!data.assetCode || !data.category) {
          toast.error("กรุณาระบุรหัสทรัพย์สินและประเภทอุปกรณ์");
          return;
        }

        const assetUpdate = await fetch("/api/assets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: assetId,
            assetCode: data.assetCode,
            category: data.category,
            brand: data.brand,
            model: data.model,
            serialNumber: data.serialNumber,
            status: "active",
          }),
        });

        if (!assetUpdate.ok) throw new Error("อัปเดตข้อมูลล้มเหลว");
      }

      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          action: "assign",
          assignedTo: data.assignedTo,
          department: data.department,
          location: data.location,
          assignedBy: data.assignedBy,
          notes: data.notes,
          deliveryDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("บันทึกประวัติล้มเหลว");

      toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
      router.push(`/track/${assetId}`);
    } catch (error) {
      toast.error("ไม่สามารถบันทึกได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-black" />
    </div>
  );

  const isPending = asset?.status === "pending";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-lg">
        {/* Header - IG Style */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <Link href={`/track/${assetId}`} className="active:opacity-50">
              <ArrowLeft className="h-6 w-6 text-black" />
            </Link>
            <h1 className="text-base font-bold text-black">
              {isPending ? "ลงทะเบียนอุปกรณ์ใหม่" : "บันทึกการส่งมอบอุปกรณ์"}
            </h1>
          </div>
          <button className="active:opacity-50">
            <MoreHorizontal className="h-6 w-6 text-black" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8 pb-20">
          <div className="flex flex-col items-center gap-2 py-4">
             <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center text-black border border-gray-100">
                <ShieldCheck size={32} />
             </div>
             <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-2">ลงทะเบียนข้อมูลที่ปลอดภัย</p>
          </div>

          {/* ส่วนที่ 1: รายละเอียดอุปกรณ์ - แสดงเสมอเพื่อให้แก้ไขข้อมูลได้ */}
          <div className="space-y-6">
               <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                  <span className="text-xs font-bold uppercase tracking-widest">{isPending ? "1. รายละเอียดอุปกรณ์" : "แก้ไขรายละเอียดอุปกรณ์"}</span>
               </div>
               
               <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="assetCode" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">รหัสทรัพย์สิน *</Label>
                    <Input id="assetCode" {...register("assetCode")} placeholder="เช่น IT-001" className="h-11 border-gray-200" />
                    {errors.assetCode && <p className="text-[10px] text-red-500 font-bold">{errors.assetCode.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-gray-400">ประเภทอุปกรณ์ *</Label>
                    <Select value={categoryValue} onValueChange={(v) => setValue("category", v as string)}>
                      <SelectTrigger className="h-11 border-gray-200"><SelectValue placeholder="เลือกประเภท" /></SelectTrigger>
                      <SelectContent className="bg-white z-[60] border-gray-100 rounded-xl shadow-xl">
                        <SelectItem value="computer">คอมพิวเตอร์ / โน้ตบุ๊ค</SelectItem>
                        <SelectItem value="printer">เครื่องพิมพ์</SelectItem>
                        <SelectItem value="monitor">หน้าจอ</SelectItem>
                        <SelectItem value="network">อุปกรณ์เครือข่าย</SelectItem>
                        <SelectItem value="other">อื่นๆ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="brand" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">ยี่ห้อ</Label>
                      <Input id="brand" {...register("brand")} placeholder="เช่น HP, Dell" className="h-11 border-gray-200" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="model" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">รุ่น</Label>
                      <Input id="model" {...register("model")} placeholder="เช่น ProBook" className="h-11 border-gray-200" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="serialNumber" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Serial Number (พิมพ์หรือแสกน)</Label>
                    <div className="flex items-center gap-2">
                      <Input id="serialNumber" {...register("serialNumber")} placeholder="ระบุหรือสแกนรหัส S/N" className="h-11 border-gray-200 flex-1" />
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="h-11 px-4 border-indigo-100 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 flex items-center gap-2 shrink-0"
                        onClick={() => setScannerOpen(true)}
                      >
                        <Scan size={18} />
                        <span className="text-sm font-bold">สแกน</span>
                      </Button>
                    </div>
                  </div>
               </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-widest">
                  {isPending ? "2. ข้อมูลการส่งมอบ" : "ข้อมูลการส่งมอบอุปกรณ์"}
                </span>
             </div>

             <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="assignedTo" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">ชื่อผู้รับผิดชอบ / ผู้ใช้งาน *</Label>
                  <Input id="assignedTo" placeholder="ชื่อ-นามสกุล" {...register("assignedTo")} className="h-11 border-gray-200" />
                  {errors.assignedTo && <p className="text-[10px] text-red-500 font-bold">{errors.assignedTo.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">แผนก *</Label>
                    <Input id="department" {...register("department")} placeholder="เช่น บัญชี, ไอที" className="h-11 border-gray-200" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="location" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">สถานที่ติดตั้ง *</Label>
                    <Input id="location" {...register("location")} placeholder="เช่น ชั้น 3 ห้อง 302" className="h-11 border-gray-200" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-[10px] uppercase font-bold tracking-widest text-gray-400">หมายเหตุเพิ่มเติม</Label>
                  <Textarea id="notes" {...register("notes")} rows={3} placeholder="ระบุข้อมูลอื่นๆ..." className="border-gray-200 resize-none" />
                </div>
             </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-100 flex gap-2 max-w-lg mx-auto z-20">
            <Link href={`/track/${assetId}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full h-11 border-gray-200 text-black font-bold">ยกเลิก</Button>
            </Link>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] h-11 bg-black text-white font-bold"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : "บันทึกข้อมูล"}
            </Button>
          </div>
        </form>

        {/* OCR Scanner Overlay */}
        {isScannerOpen && (
          <div className="fixed inset-0 z-[100] bg-black flex flex-col">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            
            <div className="absolute top-0 left-0 right-0 bg-black/70 backdrop-blur-sm h-[calc(50%-60px)] flex flex-col items-center justify-end pb-6 px-10 text-center">
               <h2 className="text-white text-lg font-bold mb-1">สแกนรหัสอุปกรณ์</h2>
               <p className="text-white/60 text-xs">เล็งเส้นสีแดงให้ตรงกับบาร์โค้ด Serial Number</p>
            </div>

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[85%] h-32 border-2 border-white/20 rounded-2xl relative overflow-hidden shadow-[0_0_0_1000px_rgba(0,0,0,0.7)]">
                <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
                
                {/* Visual Corners for scan frame */}
                <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-white rounded-br-lg" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-black/70 backdrop-blur-sm h-[calc(50%-60px)] pt-12 flex flex-col items-center">
              <Button type="button" variant="ghost" className="text-white h-12 w-12 rounded-full bg-white/10" onClick={() => setScannerOpen(false)}>
                <X size={24} />
              </Button>
              <p className="text-white/40 text-[10px] mt-10">Asset Tracking System v1.0</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
