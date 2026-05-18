import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode, LayoutDashboard, Package, ShieldCheck, PlusSquare, ArrowRight, MoreHorizontal, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-lg mx-auto w-full">             
        {/* IG Post Style Main Action */}
        <div className="border-b border-gray-100">          
          <Link href="/scan">
            <div className="aspect-square bg-gray-50 flex flex-col items-center justify-center gap-4 group active:opacity-90 transition-opacity relative overflow-hidden border-y border-gray-100">
              <QrCode size={80} strokeWidth={1} className="text-black/10 absolute scale-150 rotate-12" />
              <div className="w-24 h-24 border border-black/20 flex items-center justify-center relative z-10 bg-white">
                <QrCode size={48} className="text-black" />
              </div>
              <p className="text-black font-bold text-lg tracking-tight relative z-10">เริ่มการสแกน</p>
            </div>
          </Link>

          <div className="p-4 flex justify-between items-center">
            <div className="flex gap-4">
              <Link href="/scan" className="text-black active:opacity-50"><QrCode size={26} /></Link>
              <Link href="/dashboard" className="text-black active:opacity-50"><LayoutDashboard size={26} /></Link>
              <Link href="/dashboard/assets/new" className="text-black active:opacity-50"><PlusSquare size={26} /></Link>
            </div>
            <Bookmark size={26} className="text-black active:opacity-50" />
          </div>
          
          <div className="px-4 pb-4">
            <p className="text-sm font-bold mb-1">การบริหารจัดการอุปกรณ์ไอทีผ่าน QR Code</p>
            <p className="text-sm text-gray-800 leading-snug">
              <span className="font-bold mr-2">ASSET-TRACK</span>
              พัฒนาระบบโดยฝ่าย MIS
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
