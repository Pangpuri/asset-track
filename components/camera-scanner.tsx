"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CameraScannerProps {
  isFlashOn: boolean;
}

/**
 * คอมโพเนนต์สำหรับสแกน QR Code และจัดการกล้อง
 * แก้ไข Type Error และรองรับการเปิดไฟแฟลช (Torch)
 */
export function CameraScanner({ isFlashOn }: CameraScannerProps) {
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [hasCamera, setHasCamera] = useState(false);

  useEffect(() => {
    const scannerId = "reader";
    const scanner = new Html5Qrcode(scannerId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        // ขั้นตอนที่ 1: ตรวจสอบการเชื่อมต่อกับกล้องและขออนุญาตเข้าถึงกล้อง
        const cameras = await Html5Qrcode.getCameras();
        
        if (cameras && cameras.length > 0) {
          setHasCamera(true);
          
          // ขั้นตอนที่ 2: เริ่มการสแกนโดยใช้กล้องหลัง (Environment)
          await scanner.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              // เมื่อสแกนสำเร็จ: ดึง ID จาก URL หรือข้อความ
              const id = decodedText.split("/").pop();
              if (id) {
                router.push(`/track/${id}`);
                scanner.stop();
              }
            },
            () => {
              // กำลังสแกน...
            }
          );
        } else {
          toast.error("ไม่พบกล้องสำหรับใช้งาน");
        }
      } catch (err) {
        console.error("Camera access error:", err);
        toast.error("กรุณาอนุญาตสิทธิ์เข้าถึงกล้องเพื่อทำการสแกน");
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [router]);

  // ลอจิกสำหรับเปิด/ปิดไฟแฟลช
  useEffect(() => {
    const handleFlash = async () => {
      if (scannerRef.current?.isScanning) {
        try {
          await scannerRef.current.applyVideoConstraints({
            // ใช้ 'as any' เพื่อหลีกเลี่ยง Type Error เนื่องจาก torch เป็นคุณสมบัติที่ยังไม่มีในมาตรฐาน TypeScript หลัก
            advanced: [{ torch: isFlashOn } as any]
          } as any);
        } catch (err) {
          console.warn("อุปกรณ์หรือเบราว์เซอร์นี้ไม่รองรับการเปิดไฟแฟลชผ่านหน้าเว็บ");
        }
      }
    };
    handleFlash();
  }, [isFlashOn]);

  return (
    <div className="relative w-full aspect-square bg-black overflow-hidden flex items-center justify-center">
      <div id="reader" className="w-full h-full object-cover"></div>
      {!hasCamera && (
        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-[10px] uppercase font-bold tracking-widest text-center px-10">
          กรุณากด อนุญาต เพื่อเข้าถึงกล้อง
        </div>
      )}
      {/* UI สำหรับกรอบสแกน */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] border-2 border-white rounded-[2rem] shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 border border-indigo-500 rounded-[2rem] animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}