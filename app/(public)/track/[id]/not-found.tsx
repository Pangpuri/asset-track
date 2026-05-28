import Link from "next/link";
import { Button } from "@/components/ui/button";
import { QrCode, ArrowLeft, ShieldAlert, WifiOff } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
      {/* Background Aesthetic */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 space-y-10">
        <div className="relative inline-block">
          <div className="absolute -inset-4 bg-rose-500/20 rounded-[2.5rem] blur-xl animate-pulse" />
          <div className="w-24 h-24 bg-zinc-900 border border-white/10 rounded-[2.2rem] flex items-center justify-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent" />
            <ShieldAlert size={48} className="text-rose-500 relative z-10" strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-[1000] tracking-tighter uppercase leading-none italic">
            Invalid<br/>
            <span className="text-rose-500">Access</span>
          </h1>
          <div className="h-[1px] w-12 bg-white/20 mx-auto" />
          <p className="text-white/40 text-sm font-medium leading-relaxed max-w-[260px] mx-auto uppercase tracking-widest">
            ไม่พบข้อมูลอุปกรณ์ในระบบ หรือ QR Code นี้อาจถูกยกเลิกการใช้งานแล้ว
          </p>
        </div>

        <div className="pt-6 space-y-4">
           <Link href="/">
             <Button className="w-full h-14 bg-white text-black hover:bg-zinc-200 rounded-2xl font-[1000] text-xs uppercase tracking-[0.3em] transition-all active:scale-[0.98] px-10">
               <ArrowLeft size={16} className="mr-2" />
               Return to Base
             </Button>
           </Link>
           
           <div className="pt-4 flex flex-col items-center gap-2">
              <div className="flex gap-1.5 opacity-30">
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>
              <p className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em]">Protocol 404 • MIS Secure</p>
           </div>
        </div>
      </div>
    </div>
  );
}
