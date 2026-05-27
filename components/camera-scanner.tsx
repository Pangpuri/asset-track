"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";

interface CameraScannerProps {
  isFlashOn: boolean;
  onScanSuccess: (decodedText: string) => void;
}

interface TorchConstraint extends MediaTrackConstraintSet {
  torch?: boolean;
}

export function CameraScanner({ isFlashOn, onScanSuccess }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  
  // Target Lock Refs
  const lastCodeRef = useRef<string | null>(null);
  const matchCountRef = useRef(0);
  const scanningLoopRef = useRef<number | null>(null);

  const stopScanning = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    if (scanningLoopRef.current) cancelAnimationFrame(scanningLoopRef.current);
  }, []);

  useEffect(() => {
    const startScanner = async () => {
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
          setHasCamera(true);
          
          videoRef.current.onloadedmetadata = () => {
            if (!("BarcodeDetector" in window)) {
              // Fallback หรือแจ้งเตือน (แต่ส่วนใหญ่เบราว์เซอร์ใหม่ๆ รองรับแล้ว)
              return;
            }

            const BarcodeDetectorClass = (window as any).BarcodeDetector;
            const detector = new BarcodeDetectorClass({ formats: ["qr_code"] });

            const detectLoop = async () => {
              if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
                scanningLoopRef.current = requestAnimationFrame(detectLoop);
                return;
              }

              try {
                const barcodes = await detector.detect(videoRef.current);
                if (barcodes.length > 0) {
                  const decodedText = barcodes[0].rawValue;
                  
                  if (decodedText === lastCodeRef.current) {
                    matchCountRef.current++;
                    if (matchCountRef.current >= 3) {
                      if (navigator.vibrate) navigator.vibrate(100);
                      onScanSuccess(decodedText);
                      stopScanning();
                      return;
                    }
                  } else {
                    lastCodeRef.current = decodedText;
                    matchCountRef.current = 1;
                  }
                }
              } catch (e) {
                console.error("QR Detect Error:", e);
              }
              scanningLoopRef.current = requestAnimationFrame(detectLoop);
            };
            
            scanningLoopRef.current = requestAnimationFrame(detectLoop);
          };
        }
      } catch (err) {
        console.error("Camera Access Error:", err);
        toast.error("ไม่สามารถเข้าถึงกล้องได้");
      }
    };

    startScanner();
    return () => stopScanning();
  }, [onScanSuccess, stopScanning]);

  // ลอจิกสำหรับเปิด/ปิดไฟแฟลช (ใช้ลอจิกเดียวกับ S/N ที่เวิร์กแล้ว)
  useEffect(() => {
    const handleFlash = async () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        const track = stream.getVideoTracks()[0];
        
        if (track && "applyConstraints" in track) {
          try {
            const capabilities = (track as any).getCapabilities?.() || {};
            if (capabilities.torch) {
              await track.applyConstraints({
                advanced: [{ torch: isFlashOn } as TorchConstraint]
              } as MediaTrackConstraints);
            }
          } catch (e) {
            console.warn("Flash constraint error:", e);
          }
        }
      }
    };
    handleFlash();
  }, [isFlashOn]);

  return (
    <div className="relative w-full aspect-square bg-black overflow-hidden flex items-center justify-center group">
      {/* 1. Base Reader Element */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover"
      />

      {/* 2. Custom High-Tech Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute inset-0 bg-black/40 shadow-[inner_0_0_100px_rgba(0,0,0,0.5)]" />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[70%] aspect-square relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-2xl shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
                <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-scan-line opacity-50" />
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

      <style jsx global>{`
        @keyframes scan-line {
          0% { top: 0; opacity: 0.2; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0.2; }
        }
        .animate-scan-line {
          animation: scan-line 2.5s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
