import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background Aesthetic */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 space-y-8">
        <div className="w-20 h-20 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center justify-center shadow-sm mx-auto">
          <ShieldAlert size={40} className="text-zinc-300" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">ไม่พบข้อมูลอุปกรณ์</h1>
          <p className="text-zinc-400 text-sm font-bold leading-relaxed max-w-[240px] mx-auto uppercase tracking-widest">
            รหัส QR Code นี้ไม่มีอยู่ในระบบ หรืออาจถูกลบข้อมูลออกแล้ว
          </p>
        </div>

        <div className="pt-4">
           <Link href="/">
             <Button variant="outline" className="rounded-xl border-zinc-200 text-black hover:bg-zinc-50 transition-all px-10 font-black text-xs uppercase tracking-widest">
               <ArrowLeft size={16} className="mr-2" />
               กลับหน้าหลัก
             </Button>
           </Link>
        </div>
      </div>
    </div>
  );
}
