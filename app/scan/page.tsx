"use client";

import { useState } from "react";
import { CameraScanner } from "@/components/camera-scanner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap, ZapOff } from "lucide-react";
import Link from "next/link";

export default function ScanPage() {
  const [isFlashOn, setIsFlashOn] = useState(false);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
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
          <CameraScanner isFlashOn={isFlashOn} />
        </div>

        {/* Instructions - Simplified/Flat */}
        <div className="p-6 space-y-4 border-t border-gray-100 mt-6">
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
              <span>ระบบจะตรวจจับและนำคุณไปยังหน้าข้อมูลโดยอัตโนมัติ</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}