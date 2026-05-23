import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode, LayoutDashboard, Package, ShieldCheck, PlusSquare, ArrowRight, MoreHorizontal, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-lg mx-auto w-full">             
        {/* Minimalist IG Feed Style */}
        <div className="border-b border-zinc-100">          
          <div className="p-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                <ShieldCheck size={14} className="text-zinc-900" />
              </div>
            </div>
            <span className="text-sm font-bold text-zinc-900">ASSET-TRACK SYSTEM</span>
          </div>

          <Link href="/scan">
            <div className="aspect-square bg-zinc-50 flex flex-col items-center justify-center gap-6 group active:opacity-95 transition-all relative overflow-hidden border-y border-zinc-200">
              {/* IG Story Style Border for Scan Button */}
              <div className="p-[3px] rounded-[2.5rem] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-xl shadow-pink-500/20 group-hover:scale-105 transition-transform">
                <div className="w-32 h-32 rounded-[2.4rem] bg-white flex flex-col items-center justify-center gap-2">
                  <QrCode size={48} strokeWidth={1.5} className="text-zinc-900" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-zinc-900 font-black text-xl tracking-tight">TAP TO SCAN</p>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">เริ่มการสแกนอุปกรณ์</p>
              </div>
            </div>
          </Link>

          <div className="px-4 pb-4">
            <p className="text-sm font-bold text-zinc-900 mb-1">การบริหารจัดการอุปกรณ์ไอที</p>
            <p className="text-sm text-zinc-600 leading-snug">
              <span className="font-bold mr-2 text-zinc-900">#MIS_AssetManagement</span>
              สแกน ตรวจสอบ และติดตามสถานะทรัพย์สินได้ทันที
            </p>
          </div>
        </div>

        {/* Dashboard Link Area */}
        <div className="p-4">
          <Link href="/dashboard">
            <Button className="w-full h-11 bg-black text-white font-bold flex justify-center items-center gap-2 hover:bg-black/90 active:scale-[0.98] transition-all">
              <span>Go to Admin Dashboard</span>
              <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
