"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

interface CameraScannerProps {
  isFlashOn: boolean;
  onScanSuccess: (decodedText: string) => void;
}

interface TorchConstraint extends MediaTrackConstraintSet {
  torch?: boolean;
}

interface MediaTrackCapabilitiesWithTorch extends MediaTrackCapabilities {
  torch?: boolean;
}

interface WindowWithBarcodeDetector extends Window {
  BarcodeDetector?: new (options?: { formats: string[] }) => {
    detect: (image: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
  };
}

export function CameraScanner({ isFlashOn, onScanSuccess }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pathname = usePathname(); // ติดตามการเปลี่ยนหน้า
  const [hasCamera, setHasCamera] = useState(false);
  
  // Track Refs สำหรับการปิดที่แน่นอน
  const streamRef = useRef<MediaStream | null>(null);
  const lastCodeRef = useRef<string | null>(null);
  const matchCountRef = useRef(0);
  const scanningLoopRef = useRef<number | null>(null);

  // ฟังก์ชัน "ฆ่า" ทุกอย่างที่เกี่ยวกับกล้อง
  const killCamera = useCallback(async () => {
    // 1. ยกเลิก Loop การแสกน
    if (scanningLoopRef.current) {
        cancelAnimationFrame(scanningLoopRef.current);
        scanningLoopRef.current = null;
    }

    // 2. จัดการ Stream และ Flash
    const stream = streamRef.current || (videoRef.current?.srcObject as MediaStream);
    if (stream) {
      const tracks = stream.getTracks();
      for (const track of tracks) {
        if (track.kind === "video") {
           // พยายามดับไฟแบบ Force
           try {
             await track.applyConstraints({ 
               advanced: [{ torch: false } as TorchConstraint] 
             } as MediaTrackConstraints);
           } catch (e) {}
           track.enabled = false; // ปิด track ก่อน stop
        }
        track.stop(); // สั่งหยุด Hardware
      }
    }

    // 3. ล้างค่าใน Video Element
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Force reset element
    }
    streamRef.current = null;
  }, []);

  // ดักจับการเปลี่ยนหน้า (Aggressive Cleanup)
  useEffect(() => {
    return () => {
      killCamera();
    };
  }, [pathname, killCamera]);

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
        
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setHasCamera(true);
          
          videoRef.current.onloadedmetadata = () => {
            if (!("BarcodeDetector" in window)) return;

            const BarcodeDetectorClass = (window as WindowWithBarcodeDetector).BarcodeDetector;
            if (!BarcodeDetectorClass) return;
            const detector = new BarcodeDetectorClass({ formats: ["qr_code"] });

            const detectLoop = async () => {
              if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA || !streamRef.current) {
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
                      killCamera();
                      return;
                    }
                  } else {
                    lastCodeRef.current = decodedText;
                    matchCountRef.current = 1;
                  }
                }
              } catch (e) {}
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
    return () => { killCamera(); };
  }, [onScanSuccess, killCamera]);

  // ป้องกันกรณี Refresh หน้าจอหรือปิด Browser ทันที
  useEffect(() => {
    const handleUnload = () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  // ลอจิกสำหรับเปิด/ปิดไฟแฟลช (เพิ่มความทนทานและระบบ Retry)
  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    const tryApplyFlash = async () => {
      if (!videoRef.current?.srcObject) return;

      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];

      if (track && "applyConstraints" in track) {
        try {
          await new Promise(resolve => setTimeout(resolve, 150));
          const capabilities = track.getCapabilities?.() as MediaTrackCapabilitiesWithTorch | undefined;
          if (capabilities?.torch) {
            await track.applyConstraints({
              advanced: [{ torch: isFlashOn } as TorchConstraint]
            } as MediaTrackConstraints);
          } else if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(tryApplyFlash, 200);
          }
        } catch (e) {
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(tryApplyFlash, 200);
          }
        }
      }
    };

    tryApplyFlash();
  }, [isFlashOn]);

  return (
    <div className="relative w-full aspect-square bg-black overflow-hidden flex items-center justify-center group">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        className="w-full h-full object-cover"
      />
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
      {!hasCamera ? (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-zinc-900/90 backdrop-blur-md">
          <div className="text-center space-y-4 px-10">
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center mx-auto border border-white/10">
                <div className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
            </div>
            <p className="text-white text-xs font-black uppercase tracking-[0.2em] leading-relaxed">
                กรุณากด &quot;อนุญาต&quot; <br />เพื่อเข้าถึงกล้อง
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
