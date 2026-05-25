"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save, PackagePlus, Scan, X } from "lucide-react";
import Link from "next/link";

const assetSchema = z.object({
  assetCode: z.string().min(2, "รหัสทรัพย์สินต้องมีอย่างน้อย 2 ตัวอักษร"),
  assetName: z.string().min(2, "ชื่ออุปกรณ์ต้องมีอย่างน้อย 2 ตัวอักษร"),
  category: z.string().min(1, "โปรดระบุประเภทอุปกรณ์"),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  vendor: z.string().optional(),
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

export default function AssetEntryPage() {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      status: "active",
      category: "",
      factory: "",
    }
  });

  const selectedCategory = watch("category");
  const statusValue = watch("status");
  const factoryValue = watch("factory");

  // State สำหรับ OCR Scanner
  const [isScannerOpen, setScannerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const scanningLoopRef = useRef<number | null>(null); // For requestAnimationFrame ID
  const lastScanTimeRef = useRef<number>(0);

  // Camera Logic
  useEffect(() => {
    let stream: MediaStream | null = null;

    const startBarcodeDetection = async (videoElement: HTMLVideoElement) => {
      // ตรวจสอบว่า Browser รองรับ BarcodeDetector หรือไม่
      if (!('BarcodeDetector' in window)) {
        toast.error("เบราว์เซอร์ของคุณไม่รองรับการสแกนบาร์โค้ด");
        return;
      }

      // ให้เวลาผู้ใช้เล็ง 1.5 วินาทีก่อนเริ่มสแกนครั้งแรก
      const startTime = Date.now();

      // ปรับ Regex ให้รองรับ S/N ได้หลากหลายขึ้น
      const serialNumberRegex = /^[a-zA-Z0-9-_.]{3,}$/;

      // BarcodeDetector API is not yet part of the standard TypeScript DOM library types.
      const barcodeDetector = new (window as any).BarcodeDetector({
        formats: ['code_128', 'code_39', 'qr_code', 'ean_13']
      });

      const detect = async (time: number) => {
        if (videoElement && isScannerOpen) {
          const now = Date.now();
          
          // หน่วงเวลา: เริ่มสแกนหลังจากผ่านไป 1.5 วินาที และสแกนทุกๆ 500ms
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
              // Non-blocking error logging
              console.error("Detection attempt failed:", e);
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
          console.error("Camera access error:", err); // Added console.error for camera access issues
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

  const onSubmit = async (data: AssetFormValues) => {
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "เกิดข้อผิดพลาดในการบันทึก");
      }

      toast.success("บันทึกข้อมูลอุปกรณ์เรียบร้อยแล้ว");
      router.push("/dashboard/assets");
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "ไม่สามารถบันทึกได้ กรุณาลองใหม่อีกครั้ง";
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header - IG Style Sticky Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="active:opacity-50">
            <ArrowLeft className="h-6 w-6 text-black" />
          </button>
          <h1 className="text-lg font-black tracking-tight text-black">ลงทะเบียนอุปกรณ์</h1>
        </div>
        <Button 
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          variant="ghost"
          className="text-blue-600 font-bold hover:bg-transparent p-0"
        >
          {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "บันทึก"}
        </Button>
      </div>

      <div className="max-w-lg mx-auto p-4 pt-8 space-y-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          {/* Section 1: Core Info */}
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="factory" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">โรงงาน / สาขาที่สังกัด *</Label>
              <Select value={factoryValue} onValueChange={(value) => setValue("factory", value as string)}>
                <SelectTrigger className="border-none bg-indigo-50/50 h-14 rounded-2xl text-base font-bold text-indigo-900 ring-2 ring-indigo-500/10">
                  <SelectValue placeholder="ระบุโรงงานก่อนเริ่มกรอกข้อมูล" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-2xl bg-white z-[60]">
                  <SelectItem value="Factory 1" className="font-bold">โรงงาน 1 (Factory 1)</SelectItem>
                  <SelectItem value="Factory 2" className="font-bold">โรงงาน 2 (Factory 2)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetCode" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">รหัสอุปกรณ์ (Asset Code) *</Label>
              <Input id="assetCode" {...register("assetCode")} placeholder="ระบุรหัสทรัพย์สิน" className="border-none bg-gray-50 h-14 rounded-2xl text-lg font-bold" />
              {errors.assetCode && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.assetCode.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetName" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ชื่ออุปกรณ์ (Asset Name) *</Label>
              <Input id="assetName" {...register("assetName")} placeholder="ระบุชื่ออุปกรณ์" className="border-none bg-gray-50 h-14 rounded-2xl text-lg font-bold" />
              {errors.assetName && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.assetName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ประเภทอุปกรณ์ *</Label>
              <Select value={selectedCategory} onValueChange={(value) => setValue("category", value as string)}>
                <SelectTrigger className="border-none bg-gray-50 h-14 rounded-2xl text-base font-bold">
                  <SelectValue placeholder="ระบุประเภท" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-2xl bg-white z-[60]">
                  <SelectItem value="computer">คอมพิวเตอร์ / โน้ตบุ๊ค</SelectItem>
                  <SelectItem value="printer">เครื่องพิมพ์</SelectItem>
                  <SelectItem value="network">อุปกรณ์เครือข่าย</SelectItem>
                  <SelectItem value="monitor">จอภาพ (Monitor)</SelectItem>
                  <SelectItem value="other">อื่นๆ</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.category.message}</p>}
            </div>
          </div>

          {/* Section: Status & Condition - สำคัญมากสำหรับการติดตามทรัพย์สิน */}
          <div className="space-y-2">
            <Label htmlFor="status" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">สถานะอุปกรณ์</Label>
            <Select value={statusValue} onValueChange={(value) => setValue("status", value ?? undefined)}>
              <SelectTrigger className="border-none bg-gray-50 h-14 rounded-2xl text-base font-bold">
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-gray-100 shadow-2xl bg-white z-[60]">
                <SelectItem value="active">🟢 ใช้งานปกติ (Active)</SelectItem>
                <SelectItem value="broken">🔴 ชำรุด (Broken)</SelectItem>
                <SelectItem value="lost">⚪ หาย (Lost)</SelectItem>
                <SelectItem value="retired">✖️ ตัดจำหน่าย (Retired)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Section 2: Specs */}
          <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-8">
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ยี่ห้อ</Label>
              <Input id="brand" {...register("brand")} placeholder="เช่น HP" className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">รุ่น</Label>
              <Input id="model" {...register("model")} placeholder="เช่น Victus" className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">หมายเลขซีเรียล (Serial Number)</Label>
            <div className="flex gap-2">
              <Input id="serialNumber" {...register("serialNumber")} placeholder="ระบุ S/N" className="border-none bg-gray-50 h-12 rounded-xl font-mono flex-1" />
              <Button 
                type="button" 
                variant="outline" 
                className="h-12 px-4 border-none bg-gray-50 rounded-xl text-indigo-600 flex items-center gap-2 shrink-0 hover:bg-gray-100"
                onClick={() => setScannerOpen(true)}
              >
                <Scan size={18} />
                <span className="text-sm font-bold">สแกน</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">สถานที่ใช้งาน / จุดติดตั้ง</Label>
            <Input id="location" {...register("location")} placeholder="ระบุแผนก หรือ ชั้น" className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
          </div>

          {/* Section 3: Dynamic Category Fields */}
          {(selectedCategory === "computer" || selectedCategory === "monitor" || selectedCategory === "network") && (
            <div className="bg-blue-50/50 p-6 rounded-[2rem] space-y-4">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">ข้อมูลเฉพาะทาง</p>
              {selectedCategory === "computer" && (
                <Input id="computerName" {...register("computerName")} placeholder="ชื่อเครื่องคอมพิวเตอร์ (Computer Name)" className="bg-white border-none h-12 rounded-xl font-bold" />
              )}
              {selectedCategory === "monitor" && (
                <Input id="monitorSize" {...register("monitorSize")} placeholder="ขนาดหน้าจอ (นิ้ว)" className="bg-white border-none h-12 rounded-xl font-bold" />
              )}
              {selectedCategory === "network" && (
                <Input id="ipAddress" {...register("ipAddress")} placeholder="หมายเลขไอพี (IP Address)" className="bg-white border-none h-12 rounded-xl font-mono" />
              )}
            </div>
          )}

          {/* Section 4: Delivery */}
          <div className="border-t border-gray-50 pt-8 space-y-6 pb-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">การส่งมอบ</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 ml-1">ผู้รับมอบ/ผู้ใช้งาน</Label>
                <Input id="receivedBy" {...register("receivedBy")} placeholder="ชื่อพนักงาน" className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 ml-1">ผู้ส่งมอบ</Label>
                <Input id="deliveredBy" {...register("deliveredBy")} placeholder="ชื่อ IT" className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label className="text-xs text-gray-500 ml-1">ผู้จัดจำหน่าย (Vendor)</Label>
                <Input id="vendor" {...register("vendor")} placeholder="เช่น Advice, JIB" className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label className="text-xs text-gray-500 ml-1">วันที่ส่งมอบ</Label>
                <Input id="purchaseDate" type="date" {...register("purchaseDate")} className="border-none bg-gray-50 h-12 rounded-xl font-bold uppercase text-[10px]" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 ml-1">วันหมดประกัน</Label>
                <Input id="warrantyExpire" type="date" {...register("warrantyExpire")} className="border-none bg-gray-50 h-12 rounded-xl font-bold uppercase text-[10px]" />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* OCR Scanner Overlay */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          
          {/* Overlay Mask - Top Area */}
          <div className="absolute top-0 left-0 right-0 bg-black/60 backdrop-blur-[2px] h-[calc(50%-80px)] flex flex-col items-center justify-end pb-8 px-6 text-center">
             <div className="w-12 h-1 bg-white/30 rounded-full mb-6" />
             <h2 className="text-white text-lg font-black mb-2">สแกนบาร์โค้ด S/N</h2>
             <p className="text-white/70 text-sm">จัดวางบาร์โค้ดให้อยู่ในกรอบสี่เหลี่ยมด้านล่าง</p>
          </div>

          {/* Scanning Frame Area */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[85%] h-40 border-2 border-white/20 rounded-3xl relative overflow-hidden shadow-[0_0_0_1000px_rgba(0,0,0,0.6)]">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
              
              {/* Visual Corners for scan frame */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-white rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-white rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-white rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-white rounded-br-xl" />
            </div>
          </div>

          {/* Overlay Mask - Bottom Area */}
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-[2px] h-[calc(50%-80px)] pt-10 flex flex-col items-center">
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 max-w-[80%] mb-10">
              <p className="text-white/60 text-[10px] leading-relaxed">
                เคล็ดลับ: หากสแกนไม่ติด ให้ลองขยับกล้องเข้า-ออกช้าๆ หรือเปิดไฟให้สว่างเพียงพอ
              </p>
            </div>
            <Button type="button" variant="ghost" className="text-white h-12 w-12 rounded-full bg-white/10" onClick={() => setScannerOpen(false)}>
              <X size={24} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
