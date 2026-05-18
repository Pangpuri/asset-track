"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export function CameraScanner() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // สร้าง scanner instance 
    // ต้องทำใน useEffect เพื่อให้มั่นใจว่ารันเฉพาะฝั่ง Client (Browser)
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        showTorchButtonIfSupported: true,
      },
      /* verbose= */ false
    );

    scannerRef.current = scanner;

    const onScanSuccess = async (decodedText: string) => {
      if (isProcessing) return;
      
      try {
        // ตรวจสอบข้อมูลที่สแกนได้ว่าเป็น URL ของระบบเราหรือไม่
        const url = new URL(decodedText);
        const pathParts = url.pathname.split("/");
        // หาตำแหน่งของ 'track' ใน path เพื่อเอา ID ที่อยู่ถัดไป
        const trackIndex = pathParts.indexOf("track");
        const assetId = trackIndex !== -1 ? pathParts[trackIndex + 1] : null;

        if (assetId) {
          setIsProcessing(true);
          // หยุดการสแกนและล้างทรัพยากรกล้องทันทีเมื่อพบข้อมูล
          await scanner.clear();
          router.push(`/track/${assetId}`);
        }
      } catch (error) {
        console.warn("สแกนพบข้อมูลที่ไม่ใช่ลิงก์อุปกรณ์:", decodedText);
      }
    };

    const onScanFailure = (error: string) => {
      // ปล่อยผ่านไปเพื่อให้ระบบสแกนเฟรมถัดไปเรื่อยๆ
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Error clearing scanner", err));
      }
    };
  }, [router, isProcessing]);

  return (
    <Card className="overflow-hidden border-2 bg-black relative aspect-square shadow-2xl">
      <CardContent className="p-0 h-full w-full">
        <div id="qr-reader" className="w-full h-full border-none"></div>
        {isProcessing && (
          <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            <p className="font-bold text-slate-900 text-lg">กำลังตรวจสอบข้อมูล...</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}