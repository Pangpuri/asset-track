"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, ArrowRight, ShieldCheck, Package, Activity, Zap } from "lucide-react";
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
    <div className="bg-white min-h-screen text-zinc-900 selection:bg-indigo-500/10 relative overflow-hidden">
      {/* Light Gamer Setup Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <main className="max-w-lg mx-auto w-full relative z-10">             
        {/* Header Area - Bright Gamer Style */}
        <div className="p-10 flex flex-col items-center justify-center text-center gap-6">
          
          <div className="flex flex-col gap-1">
            <h1 className="text-5xl font-[1000] tracking-tighter text-zinc-900 leading-none uppercase italic">
              Asset<span className="text-indigo-600">Track</span>
            </h1>
            <div className="flex items-center justify-center gap-3 mt-2">
               <div className="h-[1px] w-4 bg-zinc-200" />
               <p className="text-[10px] font-black text-zinc-400 tracking-[0.4em] uppercase">
                 บริหารจัดการอุปกรณ์ ฝ่าย MIS
               </p>
               <div className="h-[1px] w-4 bg-zinc-200" />
            </div>
          </div>
        </div>

        {/* Main Action Area (Scan) - Brighter with Neon Accents */}
        <Link href="/scan">
          <div className="aspect-square bg-white flex flex-col items-center justify-center gap-10 group active:scale-[0.98] transition-all relative overflow-hidden border-y border-zinc-100 shadow-[inset_0_0_40px_rgba(0,0,0,0.02)]">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/[0.03] rounded-full blur-[80px]" />
            
            {/* High-Tech Scan Button */}
            <div className="relative p-[2px] rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 shadow-2xl shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-700">
              <div className="w-48 h-44 rounded-2xl bg-white flex flex-col items-center justify-center gap-2 border-[2px] border-white overflow-hidden relative">
                 <div className="absolute inset-0 bg-gradient-to-b from-zinc-50/50 to-transparent opacity-80" />
                 <QrCode size={80} strokeWidth={1} className="text-zinc-900 relative z-10 group-hover:scale-110 transition-transform duration-700" />
              </div>
            </div>
            
            <div className="text-center relative z-10 space-y-2">
              <p className="text-zinc-900 font-[1000] text-3xl tracking-tighter italic">กดเพื่อแสกน QR</p>
              <div className="flex items-center justify-center gap-3">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                 <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em]">ระบบแสกน QR พร้อมทำงาน</p>
              </div>
            </div>
          </div>
        </Link>

        {/* Admin Access - Floating Action */}
          {isAuthenticated ? (
            <div className="flex justify-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Link href="/dashboard">
                <Button className="w-64 h-16 bg-zinc-900 text-white rounded-xl font-[1000] text-sm uppercase tracking-[0.2em] flex justify-center items-center gap-3 hover:bg-black shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all">
                  <span>เข้าสู่ Dashboard</span>
                  <Zap size={18} fill="currentColor" />
                </Button>
              </Link>
            </div>
          ) : (
            <div className="pt-6 flex flex-col items-center gap-4 text-center">
            </div>
          )}
      </main>
    </div>
  );
}
