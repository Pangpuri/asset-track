"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { toast } from "sonner";

interface CameraScannerProps {
  isFlashOn: boolean;
  onScanSuccess: (decodedText: string) => void;
}

/** Interface สำหรับรองรับคุณสมบัติ Torch (ไฟแฟลช) ที่ยังไม่มีในมาตรฐาน TypeScript lib.dom */
interface TorchConstraint extends MediaTrackConstraintSet {
  torch?: boolean;
}

/**
 * คอมโพเนนต์สำหรับสแกน QR Code และจัดการกล้อง
 * แก้ไข Type Error และรองรับการเปิดไฟแฟลช (Torch)
 */
export function CameraScanner({ isFlashOn, onScanSuccess }: CameraScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [hasCamera, setHasCamera] = useState(false);
  
  // Target Lock Refs
  const lastCodeRef = useRef<string | null>(null);
  const matchCountRef = useRef(0);

  useEffect(() => {
    const scannerId = "reader";
    const scanner = new Html5Qrcode(scannerId, {
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
      verbose: false,
    });
    scannerRef.current = scanner;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        
        if (cameras && cameras.length > 0) {
          setHasCamera(true);
          
          await scanner.start(
            { facingMode: "environment" },
            {
              fps: 20, // เพิ่ม FPS เพื่อการตอบสนองที่ไวขึ้น
              qrbox: (viewWidth, viewHeight) => {
                const size = Math.min(viewWidth, viewHeight) * 0.7;
                return { width: size, height: size };
              }
            },
            (decodedText) => {
              if (decodedText) {
                // ระบบ Target Lock: ต้องเจอค่าเดิมซ้ำกัน 3 ครั้งติดต่อกัน
                if (decodedText === lastCodeRef.current) {
                  matchCountRef.current++;
                  
                  if (matchCountRef.current >= 3) {
                    // ล็อคเป้าสำเร็จ!
                    if (navigator.vibrate) navigator.vibrate(100);
                    onScanSuccess(decodedText);
                    if (scanner.isScanning) scanner.stop();
                  }
                } else {
                  // เปลี่ยนค่า หรือยังไม่นิ่ง: เริ่มนับใหม่
                  lastCodeRef.current = decodedText;
                  matchCountRef.current = 1;
                }
              }
            },
            () => {}
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
  }, [onScanSuccess]);

  // ลอจิกสำหรับเปิด/ปิดไฟแฟลช
  useEffect(() => {
    const handleFlash = async () => {
      if (!scannerRef.current?.isScanning) return;

      try {
        // ดึง Stream ปัจจุบันจาก Video Element โดยตรง
        const videoElement = document.querySelector("#reader video") as HTMLVideoElement;
        if (!videoElement?.srcObject) return;

        const stream = videoElement.srcObject as MediaStream;
        const tracks = stream.getVideoTracks();

        for (const track of tracks) {
          const capabilities = (track as any).getCapabilities?.() || {};
          
          // ตรวจสอบว่า track นี้รองรับ torch (ไฟแฟลช) หรือไม่
          if (capabilities.torch) {
            await track.applyConstraints({
              advanced: [{ torch: isFlashOn } as TorchConstraint]
            } as MediaTrackConstraints);
            // ถ้าเจอตัวที่มีไฟแล้วและตั้งค่าสำเร็จ ก็จบ loop
            break;
          }
        }
      } catch (err) {
        console.error("QR Flash error:", err);
      }
    };
    handleFlash();
  }, [isFlashOn]);

  return (
    <div className="relative w-full aspect-square bg-black overflow-hidden flex items-center justify-center group">
      {/* 1. Base Reader Element */}
      <div id="reader" className="w-full h-full object-cover"></div>

      {/* 2. Custom High-Tech Overlay (Always visible on top of reader) */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Darkened Mask with Square Hole */}
        <div className="absolute inset-0 bg-black/40 shadow-[inner_0_0_100px_rgba(0,0,0,0.5)]" />

        {/* Square Target Frame */}
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[70%] aspect-square relative">
                {/* 4 Corners with Glow */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />

                {/* Pulsating Laser Line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-scan-line opacity-50" />

                {/* Target Information */}
                <div className="absolute -top-10 left-0 right-0 text-center">
                    <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.3em]">Aim at QR Code</span>
                </div>
            </div>
        </div>
      </div>

      {/* 3. Status Badge */}
      {!hasCamera ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-900/90 backdrop-blur-md">
          <div className="text-center space-y-4 px-10">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
                <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
            </div>
            <p className="text-white text-xs font-black uppercase tracking-[0.2em] leading-relaxed">
                กรุณากด 'อนุญาต'<br />เพื่อเข้าถึงกล้อง
            </p>
          </div>
        </div>
      ) : (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-white font-black text-[9px] uppercase tracking-widest whitespace-nowrap">Scanner Ready & Locking</span>
            </div>
        </div>
      )}

      {/* Inline styles for the scan animation */}
      <style jsx global>{`
        @keyframes scan-line {
          0% { top: 0; opacity: 0.2; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0.2; }
        }
        .animate-scan-line {
          animation: scan-line 2.5s infinite ease-in-out;
        }
        #reader video {
            object-fit: cover !important;
            width: 100% !important;
            height: 100% !important;
        }
        /* ซ่อนกรอบสีขาวและพื้นที่ซ้อนทับดั้งเดิมของ Library */
        #reader__scan_region {
            display: none !important;
        }
        #reader {
            border: none !important;
        }
      `}</style>
    </div>
  );
  }