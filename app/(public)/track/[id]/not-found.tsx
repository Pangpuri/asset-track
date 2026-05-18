import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QrCode, AlertCircle } from "lucide-react";

export default function AssetNotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
        <AlertCircle className="h-10 w-10 text-red-500" />
      </div>
      
      <h1 className="text-xl font-bold text-black mb-2">ไม่พบข้อมูลอุปกรณ์</h1>
      <p className="text-sm text-gray-500 mb-8 max-w-[260px]">
        ขออภัย QR Code นี้อาจถูกลบออกจากระบบ หรือยังไม่ได้ถูกสร้างขึ้นในฐานข้อมูลหลัก
      </p>

      <div className="w-full max-w-[200px] space-y-3">
        <Link href="/scan" className="block">
          <Button className="w-full bg-black text-white hover:bg-gray-800 h-11 text-xs font-bold uppercase tracking-widest">
            สแกนใหม่อีกครั้ง
          </Button>
        </Link>
        <Link href="/" className="block py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          กลับหน้าหลัก
        </Link>
      </div>
    </div>
  );
}