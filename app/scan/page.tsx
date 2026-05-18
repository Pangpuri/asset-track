import { CameraScanner } from "@/components/camera-scanner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera } from "lucide-react";
import Link from "next/link";

export default function ScanPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-md space-y-8">
        {/* ส่วนหัวหน้าสแกน */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon-sm" className="rounded-full bg-white/10 text-white border-white/20 hover:bg-white/20 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">สแกน QR Code</h1>
          </div>
        </div>

        {/* ส่วนของกล้องสแกน */}
        <div className="relative">
          <CameraScanner />
        </div>

        {/* การ์ดแนะนำการใช้งาน */}
        <div className="bg-white/5 rounded-2xl p-6 border border-white/10 shadow-inner">
          <h3 className="text-blue-400 font-bold flex items-center gap-2 mb-4">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            วิธีใช้งาน
          </h3>
          <ul className="space-y-4 text-sm text-slate-300">
            <li className="flex gap-3 items-start">
              <span className="flex-none w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black border border-blue-500/30">1</span>
              <span>อนุญาตให้เว็บเข้าถึง <b>กล้องถ่ายรูป</b> เมื่อระบบถาม</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-none w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black border border-blue-500/30">2</span>
              <span>นำสติกเกอร์ QR Code ของอุปกรณ์มาวางในกรอบสแกนให้ชัดเจน</span>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex-none w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-black border border-blue-500/30">3</span>
              <span>ระบบจะทำการสแกนและพาไปยังหน้าข้อมูลอุปกรณ์โดยอัตโนมัติ</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}