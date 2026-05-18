"use client";

import { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useRouter } from "next/navigation";
import { Loader2, Camera, Image as ImageIcon, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";

export function CameraScanner() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const startScanner = () => {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 15, 
          qrbox: (viewWidth, viewHeight) => {
            const size = Math.min(viewWidth, viewHeight) * 0.8;
            return { width: size, height: size };
          },
          aspectRatio: 1.0,
          showTorchButtonIfSupported: true,
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
            console.warn("QR Data:", decodedText);
          }
        },
        () => {}
      );
    };

    if (typeof window !== "undefined") {
      startScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(() => {});
      }
    };
  }, [router, isProcessing]);

  return (
    <div className="w-full">
      {/* IG Post Style Scanner Viewport */}
      <div className="w-full aspect-square bg-black relative overflow-hidden">
        <div id="qr-reader" className="w-full h-full [&_video]:object-cover [&_video]:h-full [&_video]:w-full border-none"></div>

        {isProcessing && (
          <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-black" />
            <p className="font-bold text-black text-xs uppercase tracking-widest">Processing</p>
          </div>
        )}
        
        {/* Simplified Overlay Frame */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="w-2/3 h-2/3 border-2 border-white/40 border-dashed" />
        </div>
      </div>

      {/* Control Buttons - Clearly Outside */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="h-14 border-gray-200 text-black font-bold flex flex-col items-center justify-center gap-1 active:bg-gray-50 border-0 shadow-none bg-gray-50"
        >
          <Camera size={20} />
          <span className="text-[10px] uppercase tracking-tighter">Open Camera</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-14 border-gray-200 text-black font-bold flex flex-col items-center justify-center gap-1 active:bg-gray-50 border-0 shadow-none bg-gray-50"
        >
          <ImageIcon size={20} />
          <span className="text-[10px] uppercase tracking-tighter">From Album</span>
        </Button>
      </div>

      {/* Scan Status / Actions */}
      <div className="px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Live Scanner</span>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="p-2 text-gray-400 active:text-black transition-colors"
        >
          <RefreshCcw size={16} />
        </button>
      </div>
    </div>
  );
}
