"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, ArrowRight, ShieldCheck, Package } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/simple");
        const data = await res.json();
        setIsAuthenticated(data.authenticated);
      } catch (err) {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white selection:bg-indigo-500/30">
      <main className="max-w-lg mx-auto w-full relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent pointer-events-none" />

        <div className="relative z-10">
          {/* Header Area */}
          <div className="p-10 flex flex-col items-center justify-center text-center gap-6">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 rounded-[2.2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
              <div className="relative flex items-center justify-center w-24 h-24 bg-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in duration-500">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 opacity-90" />
                <Package size={48} className="text-white relative z-10" strokeWidth={1.5} />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <h1 className="text-5xl font-[1000] tracking-tighter text-white leading-none text-glow uppercase">
                ASSET<span className="text-indigo-400">TRACK</span>
              </h1>
              <p className="text-[10px] font-black text-white/30 tracking-[0.5em] uppercase mt-2">
                MIS DIVISION SYSTEM
              </p>
            </div>
          </div>

          {/* Main Action Area (Scan) */}
          <Link href="/scan">
            <div className="aspect-square bg-white/[0.02] flex flex-col items-center justify-center gap-10 group active:opacity-90 transition-all relative overflow-hidden border-y border-white/5 backdrop-blur-sm">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] group-hover:opacity-100 transition-opacity" />
              
              <div className="relative p-[2px] rounded-[3.5rem] bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 shadow-2xl shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-700">
                <div className="w-48 h-44 rounded-[3.4rem] bg-[#0A0A0A] flex flex-col items-center justify-center gap-2 border-[2px] border-white/10 overflow-hidden relative">
                   <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-50" />
                   <QrCode size={80} strokeWidth={1} className="text-white relative z-10 group-hover:scale-110 transition-transform duration-700" />
                </div>
              </div>
              
              <div className="text-center relative z-10 space-y-2">
                <p className="text-white font-[1000] text-3xl tracking-tighter text-glow">TAP TO SCAN</p>
                <div className="flex items-center justify-center gap-3">
                   <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                   <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Ready for protocol</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Info Section */}
          <div className="p-8 space-y-6">
            <div className="luxury-card p-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 text-white/5 -rotate-12">
                  <ShieldCheck size={120} />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                      <ShieldCheck size={16} className="text-indigo-400" />
                    </div>
                    <p className="text-xs font-black text-white/80 uppercase tracking-widest leading-none">Secured Infrastructure</p>
                  </div>
                  <p className="text-sm text-white/40 leading-relaxed font-medium max-w-[280px]">
                    ระบบบริหารจัดการและติดตามสถานะอุปกรณ์ไอทีอัจฉริยะ 
                    <span className="text-indigo-400 font-bold ml-1">#SmartMIS</span> ภายใต้มาตรฐานความปลอดภัยสูงสุดขององค์กร
                  </p>
               </div>
            </div>

            {isAuthenticated && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <Link href="/dashboard">
                  <Button className="w-full h-16 bg-white text-black rounded-3xl font-[1000] text-sm uppercase tracking-[0.2em] flex justify-center items-center gap-3 hover:bg-zinc-200 shadow-2xl active:scale-[0.98] transition-all">
                    <span>Access Dashboard</span>
                    <ArrowRight size={20} strokeWidth={3} />
                  </Button>
                </Link>
              </div>
            )}
            
            {!isAuthenticated && (
              <div className="pt-10 flex flex-col items-center gap-4 text-center">
                 <div className="flex gap-1.5 opacity-20">
                    <div className="w-1 h-1 rounded-full bg-white" />
                    <div className="w-1 h-1 rounded-full bg-white" />
                    <div className="w-1 h-1 rounded-full bg-white" />
                 </div>
                 <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.5em] leading-relaxed">
                   Management Portal • Internal Use Only
                 </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
