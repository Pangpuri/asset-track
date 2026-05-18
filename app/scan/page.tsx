import { CameraScanner } from "@/components/camera-scanner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-lg">
        {/* Header - IG Style */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <Link href="/" className="active:opacity-50">
              <ArrowLeft className="h-6 w-6 text-black" />
            </Link>
            <h1 className="text-base font-bold text-black">Scan QR Code</h1>
          </div>
          <button className="active:opacity-50">
            <MoreHorizontal className="h-6 w-6 text-black" />
          </button>
        </div>

        {/* Camera Scanner Container */}
        <div className="w-full">
          <CameraScanner />
        </div>

        {/* Instructions - Simplified/Flat */}
        <div className="p-6 space-y-4 border-t border-gray-100 mt-6">
          <h3 className="text-black font-bold text-sm uppercase tracking-wider">
            How to use
          </h3>
          <ul className="space-y-4 text-sm text-gray-600">
            <li className="flex gap-3 items-center">
              <span className="w-1.5 h-1.5 bg-black" />
              <span>Allow camera access when prompted</span>
            </li>
            <li className="flex gap-3 items-center">
              <span className="w-1.5 h-1.5 bg-black" />
              <span>Align the QR Code within the square frame</span>
            </li>
            <li className="flex gap-3 items-center">
              <span className="w-1.5 h-1.5 bg-black" />
              <span>System will automatically detect and redirect</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}