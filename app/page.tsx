import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode, LayoutDashboard, Package, ShieldCheck, PlusSquare, ArrowRight, MoreHorizontal, Heart, MessageCircle, Send, Bookmark } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      <main className="max-w-lg mx-auto w-full">
        {/* Story-like Header Icons */}
        <div className="flex gap-4 p-4 overflow-x-auto border-b border-gray-100 no-scrollbar">
          <div className="flex flex-col items-center gap-1 min-w-[75px]">
            <div className="w-[66px] h-[66px] rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-white p-[2px]">
                <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-black">
                  <Package size={28} />
                </div>
              </div>
            </div>
            <span className="text-[11px] font-medium text-black truncate w-full text-center">MIS Dept</span>
          </div>
          {/* Mock Stories */}
          {["Inventory", "Services", "Logs", "Reports"].map((name) => (
            <div key={name} className="flex flex-col items-center gap-1 min-w-[75px]">
              <div className="w-[66px] h-[66px] rounded-full border border-gray-200 p-[2px]">
                <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
                  <Package size={28} />
                </div>
              </div>
              <span className="text-[11px] font-medium text-gray-400 truncate w-full text-center">{name}</span>
            </div>
          ))}
        </div>

        {/* IG Post Style Main Action */}
        <div className="border-b border-gray-100">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white">
                <QrCode size={16} />
              </div>
              <span className="text-sm font-bold">Asset Scanner</span>
            </div>
            <MoreHorizontal size={20} className="text-gray-400" />
          </div>
          
          <Link href="/scan">
            <div className="aspect-square bg-gray-50 flex flex-col items-center justify-center gap-4 group active:opacity-90 transition-opacity relative overflow-hidden border-y border-gray-100">
              <QrCode size={80} strokeWidth={1} className="text-black/10 absolute scale-150 rotate-12" />
              <div className="w-24 h-24 border border-black/20 flex items-center justify-center relative z-10 bg-white">
                <QrCode size={48} className="text-black" />
              </div>
              <p className="text-black font-bold text-lg tracking-tight relative z-10">Tab to Scan</p>
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
            <p className="text-sm font-bold mb-1">MIS Management</p>
            <p className="text-sm text-gray-800 leading-snug">
              <span className="font-bold mr-2">asset_track</span>
              ระบบบริหารจัดการและติดตามอุปกรณ์ไอทีผ่าน QR Code ใช้งานง่าย รวดเร็ว และเป็นระบบ สำหรับแผนก MIS
            </p>
            <p className="text-xs text-gray-400 mt-2 uppercase font-medium tracking-tight">January 18 • See Translation</p>
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
