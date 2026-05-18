"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CameraOff, AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

export function CameraScanner() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // ฟังก์ชันเริ่มการทำงานของ Scanner
    const startScanner = () => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 15, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
          rememberLastUsedCamera: true,
        },
        false
      );

      scannerRef.current = scanner;

      scanner.render(
        async (decodedText) => {
          if (isProcessing) return;
          
          try {
            const url = new URL(decodedText);
            const pathParts = url.pathname.split("/");
            const trackIndex = pathParts.indexOf("track");
            const assetId = trackIndex !== -1 ? pathParts[trackIndex + 1] : null;

            if (assetId) {
              setIsProcessing(true);
              await scanner.clear();
              router.push(`/track/${assetId}`);
            }
          } catch (error) {
            console.warn("QR Code Data:", decodedText);
          }
        },
        (errorMessage) => {
          // ปล่อยผ่านเพื่อให้สแกนต่อ
        }
      );
    };

    // ตรวจสอบเบื้องต้นว่า Browser รองรับกล้องไหม
    if (typeof window !== "undefined") {
      startScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Scanner clear error", err));
      }
    };
  }, [router, isProcessing]);

  return (
    <Card className="overflow-hidden border-none glass-card relative aspect-square shadow-2xl rounded-[2.5rem]">
      <CardContent className="p-0 h-full w-full bg-slate-950 flex flex-col items-center justify-center">
        {/* Container สำหรับ Library แสดงภาพจากกล้อง */}
        <div id="qr-reader" className="w-full h-full border-none"></div>

        {/* Overlay เมื่อกำลังโหลดหน้าถัดไป */}
        {isProcessing && (
          <div className="absolute inset-0 bg-indigo-950/90 z-50 flex flex-col items-center justify-center gap-4 backdrop-blur-sm">
            <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
            <p className="font-black text-white text-xl tracking-tight uppercase">Verifying Data...</p>
          </div>
        )}

        {/* ตกแต่ง UI ของ Scanner */}
        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none opacity-50">
          <div className="w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-xl" />
          <div className="w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-xl" />
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between pointer-events-none opacity-50">
          <div className="w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-xl" />
          <div className="w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-xl" />
        </div>
      </CardContent>
    </Card>
  );
}