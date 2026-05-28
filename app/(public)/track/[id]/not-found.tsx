import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldAlert, QrCode, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] bg-black text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background Aesthetic Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="relative z-10 space-y-10 max-w-sm">
        {/* Animated Icon Container */}
        <div className="relative mx-auto w-24 h-24">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-3xl blur-2xl animate-pulse" />
            <div className="relative bg-zinc-900 border border-white/10 rounded-3xl w-24 h-24 flex items-center justify-center shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-rose-500/10" />
                <ShieldAlert size={48} className="text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]" strokeWidth={1.5} />
            </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-[1000] tracking-tighter uppercase italic bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
            Invalid Asset
          </h1>
          <div className="flex flex-col gap-2">
            <p className="text-indigo-300/80 text-[10px] font-black uppercase tracking-[0.4em]">
                ไม่พบข้อมูลอุปกรณ์
            </p>
            <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                รหัส QR Code นี้ไม่มีอยู่ในระบบ <br/>
                หรืออาจถูกจำหน่ายออกจากคลังแล้ว
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4">
           {/* Scan Again Button - High Priority */}
           <Link href="/scan">
             <Button className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest gap-3 shadow-xl shadow-indigo-600/20 group active:scale-95 transition-all border border-indigo-400/20">
               <QrCode size={20} className="group-hover:rotate-12 transition-transform" />
               ไปหน้าแสกนใหม่
             </Button>
           </Link>

           {/* Back Home Button */}
           <Link href="/">
             <Button variant="ghost" className="w-full h-12 rounded-2xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all font-bold text-xs uppercase tracking-widest gap-2">
               <Home size={16} />
               กลับหน้าหลัก
             </Button>
           </Link>
        </div>
      </div>

      {/* Footer Branding */}
      <div className="absolute bottom-10 left-0 right-0 opacity-20">
         <p className="text-[9px] font-black uppercase tracking-[0.6em]">Asset Track Core</p>
      </div>
    </div>
  );
}
