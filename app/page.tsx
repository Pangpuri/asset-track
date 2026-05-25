import { Button } from "@/components/ui/button";
import { QrCode, ArrowRight, ShieldCheck, Package } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-lg mx-auto w-full">             
        {/* Main Logo Header Area */}
        <div className="border-b border-zinc-100 bg-zinc-50/30">          
          <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
            {/* New Modern IT Icon Badge */}
            <div className="relative flex items-center justify-center w-20 h-20 bg-zinc-900 rounded-[2rem] overflow-hidden shadow-2xl animate-in zoom-in duration-500">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 opacity-90" />
              <Package size={40} className="text-white relative z-10" strokeWidth={2} />
            </div>
            
            <div className="flex flex-col">
              <h1 className="text-4xl font-[1000] tracking-tighter text-zinc-900 leading-none">
                ASSET<span className="text-indigo-600">TRACK</span>
              </h1>
              <div className="flex items-center justify-center gap-2 mt-2">
                <div className="h-[1px] w-4 bg-zinc-300" />
                <span className="text-[10px] font-black text-zinc-400 tracking-[0.4em] uppercase">
                  MIS DIVISION
                </span>
                <div className="h-[1px] w-4 bg-zinc-300" />
              </div>
            </div>
          </div>

          {/* Main Action Area (Scan) */}
          <Link href="/scan">
            <div className="aspect-square bg-white flex flex-col items-center justify-center gap-8 group active:opacity-95 transition-all relative overflow-hidden border-y border-zinc-100">
              {/* Animated Background Decoration */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity" />
              
              {/* Scan Button - Tech Style */}
              <div className="relative p-[4px] rounded-[3.5rem] bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 shadow-2xl shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-500">
                <div className="w-44 h-44 rounded-[3.2rem] bg-white flex flex-col items-center justify-center gap-2 border-[4px] border-white overflow-hidden">
                  <div className="absolute inset-0 bg-zinc-50/50 group-hover:bg-transparent transition-colors" />
                  <QrCode size={80} strokeWidth={1} className="text-zinc-900 relative z-10 group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
              
              <div className="text-center relative z-10">
                <p className="text-zinc-900 font-[1000] text-2xl tracking-tighter">TAP TO SCAN</p>
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1.5 flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
                  Ready to scan asset
                </p>
              </div>
            </div>
          </Link>

          {/* Footer Info Area */}
          <div className="p-6 bg-zinc-50/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center shadow-lg">
                <ShieldCheck size={14} className="text-white" />
              </div>
              <p className="text-xs font-black text-zinc-900 uppercase tracking-widest">System Integrated</p>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed font-medium">
              ระบบบริหารจัดการและติดตามสถานะทรัพย์สินไอที 
              <span className="text-indigo-600 font-bold ml-1">#SmartMIS</span>
            </p>
          </div>
        </div>

        {/* Navigation Action */}
        <div className="p-6">
          <Link href="/dashboard">
            <Button className="w-full h-14 bg-zinc-900 text-white rounded-2xl font-[1000] text-sm uppercase tracking-widest flex justify-center items-center gap-3 hover:bg-black shadow-xl active:scale-[0.98] transition-all">
              <span>Go to Admin Dashboard</span>
              <ArrowRight size={20} />
            </Button>
          </Link>
          <p className="text-center text-[10px] text-zinc-400 font-bold mt-4 uppercase tracking-[0.2em]">
            Internal Use Only • MIS Department
          </p>
        </div>
      </main>
    </div>
  );
}
