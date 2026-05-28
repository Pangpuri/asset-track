import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background Aesthetic */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 space-y-8">
        <div className="w-20 h-20 bg-zinc-900 border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl mx-auto">
          <ShieldAlert size={40} className="text-white/20" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tighter uppercase">ไม่พบข้อมูลอุปกรณ์</h1>
          <p className="text-white/40 text-sm font-medium leading-relaxed max-w-[240px] mx-auto">
            รหัส QR Code นี้ไม่มีอยู่ในระบบ หรืออาจถูกลบข้อมูลออกแล้ว
          </p>
        </div>

        <div className="pt-4">
           <Link href="/">
             <Button variant="outline" className="rounded-2xl border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-all px-8">
               <ArrowLeft size={16} className="mr-2" />
               กลับหน้าหลัก
             </Button>
           </Link>
        </div>
      </div>
    </div>
  );
}
