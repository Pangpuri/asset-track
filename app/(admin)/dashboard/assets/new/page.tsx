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
import Tesseract from 'tesseract.js';

const assetSchema = z.object({
  assetCode: z.string().min(2, "รหัสอุปกรณ์ต้องมีอย่างน้อย 2 ตัวอักษร"),
  category: z.string().min(1, "กรุณาเลือกประเภทอุปกรณ์"),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  computerName: z.string().optional(),
  monitorSize: z.string().optional(),
  warrantyUntil: z.string().optional(),
  deliveryDate: z.string().optional(),
  receivedBy: z.string().optional(),
  deliveredBy: z.string().optional(),
  ipAddress: z.string().optional(),
  status: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

export default function AssetEntryPage() {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      status: "active",
      category: "",
    }
  });

  const selectedCategory = watch("category");

  // State สำหรับ OCR Scanner
  const [isScannerOpen, setScannerOpen] = useState(false);
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Camera Logic
  useEffect(() => {
    let stream: MediaStream | null = null;
    const startCamera = async () => {
      if (isScannerOpen && videoRef.current) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } } 
          });
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
          toast.error("ไม่สามารถเข้าถึงกล้องได้");
          setScannerOpen(false);
        }
      }
    };
    startCamera();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, [isScannerOpen]);

  const handleCaptureOCR = async () => {
    if (!videoRef.current || isProcessingOCR) return;
    try {
      setIsProcessingOCR(true);
      const video = videoRef.current;
      const canvas = document.createElement("canvas");
      const cropW = video.videoWidth * 0.8;
      const cropH = video.videoHeight * 0.2;
      const startX = (video.videoWidth - cropW) / 2;
      const startY = (video.videoHeight - cropH) / 2;
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas error");
      ctx.drawImage(video, startX, startY, cropW, cropH, 0, 0, cropW, cropH);
      const result = await Tesseract.recognize(canvas, 'eng');
      const cleanText = result.data.text.replace(/[^a-zA-Z0-9-]/g, '').trim();
      if (cleanText.length > 3) {
        setValue("serialNumber", cleanText);
        toast.success("อ่านรหัสสำเร็จ: " + cleanText);
        setScannerOpen(false);
      } else {
        toast.error("อ่านรหัสไม่ชัดเจน กรุณาลองใหม่");
      }
    } finally { setIsProcessingOCR(false); }
  };

  const onSubmit = async (data: AssetFormValues) => {
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการบันทึก");

      toast.success("บันทึกข้อมูลอุปกรณ์เรียบร้อยแล้ว");
      router.push("/dashboard/assets");
      router.refresh();
    } catch (error) {
      toast.error("ไม่สามารถบันทึกได้ กรุณาลองใหม่อีกครั้ง");
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
              <Label htmlFor="assetCode" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Code *</Label>
              <Input id="assetCode" {...register("assetCode")} placeholder="รหัสอุปกรณ์" className="border-none bg-gray-50 h-14 rounded-2xl text-lg font-bold" />
              {errors.assetCode && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.assetCode.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ประเภทอุปกรณ์ *</Label>
              <Select onValueChange={(value) => setValue("category", value as string)}>
                <SelectTrigger className="border-none bg-gray-50 h-14 rounded-2xl text-base font-bold">
                  <SelectValue placeholder="ระบุประเภท" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 shadow-2xl">
                  <SelectItem value="computer">Computer / Laptop</SelectItem>
                  <SelectItem value="printer">Printer</SelectItem>
                  <SelectItem value="network">Network Device</SelectItem>
                  <SelectItem value="monitor">Monitor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.category.message}</p>}
            </div>
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
            <Label htmlFor="serialNumber" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Serial Number</Label>
            <div className="flex gap-2">
              <Input id="serialNumber" {...register("serialNumber")} placeholder="S/N" className="border-none bg-gray-50 h-12 rounded-xl font-mono flex-1" />
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
            <Label htmlFor="location" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">สถานที่ติดตั้ง</Label>
            <Input id="location" {...register("location")} placeholder="แผนก / ชั้น" className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
          </div>

          {/* Section 3: Dynamic Category Fields */}
          {(selectedCategory === "computer" || selectedCategory === "monitor" || selectedCategory === "network") && (
            <div className="bg-blue-50/50 p-6 rounded-[2rem] space-y-4">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">ข้อมูลเฉพาะทาง</p>
              {selectedCategory === "computer" && (
                <Input id="computerName" {...register("computerName")} placeholder="Computer Name" className="bg-white border-none h-12 rounded-xl font-bold" />
              )}
              {selectedCategory === "monitor" && (
                <Input id="monitorSize" {...register("monitorSize")} placeholder="Screen Size" className="bg-white border-none h-12 rounded-xl font-bold" />
              )}
              {selectedCategory === "network" && (
                <Input id="ipAddress" {...register("ipAddress")} placeholder="IP Address" className="bg-white border-none h-12 rounded-xl font-mono" />
              )}
            </div>
          )}

          {/* Section 4: Delivery */}
          <div className="border-t border-gray-50 pt-8 space-y-6 pb-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">การส่งมอบ</p>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 ml-1">ผู้รับมอบ/ผู้ใช้งาน</Label>
              <Input id="receivedBy" {...register("receivedBy")} placeholder="ชื่อพนักงาน" className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label className="text-xs text-gray-500 ml-1">วันที่ส่งมอบ</Label>
                <Input id="deliveryDate" type="date" {...register("deliveryDate")} className="border-none bg-gray-50 h-12 rounded-xl font-bold uppercase text-[10px]" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 ml-1">วันหมดประกัน</Label>
                <Input id="warrantyUntil" type="date" {...register("warrantyUntil")} className="border-none bg-gray-50 h-12 rounded-xl font-bold uppercase text-[10px]" />
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* OCR Scanner Overlay */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[85%] h-32 border-2 border-white/50 rounded-xl relative overflow-hidden shadow-[0_0_0_1000px_rgba(0,0,0,0.6)]">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse" />
            </div>
          </div>
          <div className="absolute bottom-10 left-0 right-0 flex justify-center items-center gap-10 px-6">
            <Button type="button" variant="ghost" className="text-white h-12 w-12 rounded-full bg-white/10" onClick={() => setScannerOpen(false)}>
              <X size={24} />
            </Button>
            <Button 
              type="button" 
              className="h-20 w-20 rounded-full bg-white text-black shadow-xl scale-110"
              onClick={handleCaptureOCR}
              disabled={isProcessingOCR}
            >
              {isProcessingOCR ? <Loader2 className="animate-spin" size={32} /> : <Scan size={32} />}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
