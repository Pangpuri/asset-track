"use client";

import { useState, useRef } from "react";
import { CameraScanner } from "@/components/camera-scanner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, ZapOff, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ScanPage() {
  const router = useRouter();
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ฟังก์ชันกลางสำหรับจัดการผลลัพธ์การสแกน
  const handleScanSuccess = (decodedText: string) => {
    let assetId = decodedText;
    
    // ตรวจสอบว่าเป็น URL หรือไม่ (เช่น https://domain.com/track/UUID)
    if (decodedText.startsWith('http')) {
      try {
        const url = new URL(decodedText);
        // แยก Path และกรองเอาเฉพาะส่วนที่มีข้อมูล (ป้องกันเรื่อง trailing slash)
        const parts = url.pathname.split('/').filter(Boolean);
        assetId = parts[parts.length - 1] || decodedText;
      } catch (e) {
        assetId = decodedText;
      }
    }
    
    toast.success("ดึงข้อมูลอุปกรณ์เรียบร้อย");
    router.push(`/dashboard/assets/${assetId}`);
  };

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    // สร้าง instance ชั่วคราวสำหรับการประมวลผลไฟล์ (ต้องมี element ใน DOM)
    const html5QrCode = new Html5Qrcode("qr-file-processor");
    
    try {
      const decodedText = await html5QrCode.scanFile(file, true);
      if (decodedText) handleScanSuccess(decodedText);
    } catch (err) {
      toast.error("ไม่พบ QR Code ในรูปภาพ หรือภาพไม่ชัดเจนพอ");
      console.error("Scanning error:", err);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Clear input
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Hidden element required for Html5Qrcode processing */}
      <div id="qr-file-processor" className="hidden" />
      
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileScan}
      />

      <div className="w-full max-w-lg">
        {/* Header - IG Style */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <Link href="/" className="active:opacity-50">
              <ArrowLeft className="h-6 w-6 text-black" />
            </Link>
            <h1 className="text-base font-bold text-black">สแกน QR Code</h1>
          </div>
          <button 
            onClick={() => setIsFlashOn(!isFlashOn)} 
            className="active:opacity-50 p-2 transition-colors"
          >
            {isFlashOn ? <ZapOff className="h-6 w-6 text-amber-500 fill-amber-500" /> : <Zap className="h-6 w-6 text-black" />}
          </button>
        </div>

        {/* Camera Scanner Container */}
        <div className="w-full">
          {/* ส่ง callback ให้ CameraScanner เพื่อให้ใช้ logic เดียวกัน */}
          <CameraScanner isFlashOn={isFlashOn} onScanSuccess={handleScanSuccess} />
        </div>

        {/* Gallery Action - Styled with Theme */}
        <div className="px-6 mt-6">
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={isProcessing}
            className="w-full h-14 rounded-2xl border-2 border-indigo-50 bg-white text-indigo-600 font-black hover:bg-indigo-50 hover:border-indigo-100 transition-all gap-3 shadow-sm disabled:opacity-50"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">กำลังประมวลผล...</span>
            ) : (
              <>
                <ImageIcon className="h-5 w-5" />
                เลือกรูปภาพจากอัลบั้ม
              </>
            )}
          </Button>
        </div>

        {/* Instructions - Simplified/Flat */}
        <div className="p-6 space-y-4 border-t border-gray-100 mt-8">
          <h3 className="text-black font-black text-sm uppercase tracking-wider">
            วิธีใช้งาน
          </h3>
          <ul className="space-y-4 text-sm text-gray-600">
            <li className="flex gap-3 items-center">
              <span className="w-1.5 h-1.5 bg-black" />
              <span>หากมีข้อความขออนุญาตใช้กล้อง ให้กด <b> อนุญาต (Allow)</b></span>
            </li>
            <li className="flex gap-3 items-center">
              <span className="w-1.5 h-1.5 bg-black" />
              <span>วาง QR Code ให้ตรงกับกรอบสี่เหลี่ยมบนหน้าจอ</span>
            </li>
            <li className="flex gap-3 items-center">
              <span className="w-1.5 h-1.5 bg-black" />
              <span>ระบบจะนำคุณไปยังหน้าจัดการและแก้ไขข้อมูลอุปกรณ์โดยอัตโนมัติ</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}