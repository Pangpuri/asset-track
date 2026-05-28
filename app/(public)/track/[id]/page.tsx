import { db } from "@/db";
import { assets } from "@/db/schema";
import { eq, desc, and, isNull } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Package, 
  Tag, 
  MapPin, 
  Cpu, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  Info,
  User, 
  Barcode, 
  Activity, 
  History, 
  Monitor,
  QrCode,
  LucideIcon 
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const InfoRow = ({ label, value, icon: Icon, colorClass = "text-gray-400" }: { label: string, value: string | null | undefined, icon: LucideIcon, colorClass?: string }) => {
  const isEmpty = !value || value.trim() === "";
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-gray-50 last:border-0 active:bg-gray-50/50 transition-colors">
      <div className={`w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center ${colorClass} flex-shrink-0 border border-gray-100 ${isEmpty ? "opacity-40 grayscale" : ""}`}>
        <Icon size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase font-black tracking-[0.1em] text-gray-400 mb-0.5">{label}</p>
        <p className={`text-[15px] font-semibold truncate ${isEmpty ? "text-gray-300 italic font-normal" : "text-gray-900"}`}>
          {isEmpty ? "ไม่ได้ระบุ" : value}
        </p>
      </div>
    </div>
  );
};

export default async function TrackAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ตรวจสอบว่า ID เป็นรูปแบบ UUID ที่ถูกต้องหรือไม่ (ป้องกันการสแกน QR มั่ว)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  let asset;
  try {
    // ดึงข้อมูล Asset และ Log ล่าสุด พร้อมพนักงานที่ได้รับมอบหมาย
    asset = await db.query.assets.findFirst({ // เพิ่มเงื่อนไข deletedAt
      where: and(eq(assets.id, id), isNull(assets.deletedAt))
    });
  } catch (error) {
    console.error("Fetch error:", error);
    notFound();
  }

  if (!asset) {
    notFound();
  }

  if (asset.status === "pending") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Luxury Background Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 space-y-12">
          <div className="relative inline-block group">
            <div className="absolute -inset-6 bg-amber-500/20 rounded-[3rem] blur-2xl group-hover:bg-amber-500/30 transition duration-1000" />
            <div className="w-28 h-28 bg-zinc-900 border border-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent" />
              <QrCode size={54} className="text-amber-500 relative z-10" strokeWidth={1} />
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-[1000] tracking-tighter uppercase leading-[0.9]">
              Wait for<br/>
              <span className="text-amber-500">Config</span>
            </h1>
            <div className="h-[1px] w-12 bg-white/20 mx-auto" />
            <p className="text-white/50 text-sm font-medium leading-relaxed max-w-[280px] mx-auto uppercase tracking-widest">
              พบรหัสอุปกรณ์ในระบบแล้ว<br/>แต่ยังไม่ได้เปิดการใช้งาน
            </p>
          </div>

          <div className="p-6 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 backdrop-blur-sm">
             <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-2">Requirement</p>
             <p className="text-sm font-bold text-white/80">โปรดแจ้งฝ่าย MIS เพื่อลงทะเบียนอุปกรณ์</p>
          </div>

          <div className="pt-4">
            <Link href="/">
              <Button className="h-14 bg-white text-black hover:bg-zinc-200 rounded-2xl font-[1000] text-xs uppercase tracking-[0.3em] transition-all active:scale-[0.98] px-12">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: "bg-emerald-500",
    broken: "bg-rose-500",
    lost: "bg-zinc-900",
    retired: "bg-zinc-400",
  };

  const statusLabels: Record<string, string> = {
    active: "Operating Normally",
    broken: "Needs Service",
    lost: "Unit Missing",
    retired: "Decommissioned",
  };

  const statusSub: Record<string, string> = {
    active: "Everything looks good",
    broken: "Repairs in progress",
    lost: "Last seen recently",
    retired: "Out of inventory",
  };

  const specs = asset.specifications || {};

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-indigo-500/30">
      <div className="max-w-lg mx-auto bg-black min-h-screen relative shadow-2xl">
        {/* Story-like Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent pointer-events-none" />

        {/* Top Navigation - IG Minimal */}
        <div className="flex items-center justify-between px-6 h-16 sticky top-0 bg-black/60 backdrop-blur-xl z-50 border-b border-white/5">
          <div className="flex items-center gap-4">
            <Link href="/" className="active:scale-90 transition-transform">
              <ArrowLeft className="h-6 w-6 text-white" />
            </Link>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40 leading-none mb-1">Asset Profile</span>
              <span className="text-sm font-bold tracking-tight text-white">ID: {asset.assetCode || "---"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <div className={`w-2 h-2 rounded-full animate-pulse ${statusColors[asset.status] || "bg-zinc-400"}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{statusLabels[asset.status] || asset.status}</span>
          </div>
        </div>

        <div className="px-6 py-8 space-y-10 pb-40">
          {/* Hero Visual Card - High-End Product Style */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 rounded-[3rem] blur opacity-30 group-hover:opacity-50 transition duration-1000"></div>
            <div className="relative bg-[#121212] rounded-[2.8rem] overflow-hidden border border-white/10 shadow-2xl">
              {/* Product Header Photo Area */}
              <div className="h-48 bg-zinc-900 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-50"></div>
                <div className="absolute top-0 right-0 p-8 text-white/5 rotate-12">
                   <Package size={200} strokeWidth={0.5} />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                   <div className="w-20 h-20 bg-black/40 backdrop-blur-2xl rounded-3xl border border-white/10 flex items-center justify-center mb-4 shadow-2xl">
                      <Cpu size={40} className="text-indigo-400" />
                   </div>
                   <div className="px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 backdrop-blur-md">
                      <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.3em]">{asset.category || "Hardware"}</p>
                   </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-8 space-y-6">
                <div>
                  <h2 className="text-5xl font-[1000] tracking-tighter uppercase leading-none mb-2 bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                    {asset.brand || "SYSTEM"}
                  </h2>
                  <p className="text-xl font-bold text-white/40 tracking-tight">{asset.model || "Universal Unit"}</p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                   <div className="flex-1">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Serial Number</p>
                      <p className="text-sm font-bold text-white tracking-wide font-mono">{asset.serialNumber || "---"}</p>
                   </div>
                   <div className="h-10 w-[1px] bg-white/5"></div>
                   <div className="flex-1">
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Location</p>
                      <p className="text-sm font-bold text-white tracking-tight truncate">{asset.location || "Office"}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* MIS Help Section - Modern Alert Style */}
          <div className="relative overflow-hidden p-6 rounded-[2.5rem] bg-indigo-600/10 border border-indigo-500/20 group">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Info size={100} />
             </div>
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                   <div className="w-8 h-8 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40">
                      <Activity size={16} className="text-white" />
                   </div>
                   <span className="text-xs font-black text-indigo-300 uppercase tracking-[0.2em]">MIS Support Center</span>
                </div>
                <h3 className="text-lg font-black text-white mb-1">มีปัญหาเกี่ยวกับการใช้งาน?</h3>
                <p className="text-sm font-medium text-white/60 leading-relaxed">
                  หากอุปกรณ์ชำรุด ต้องการความช่วยเหลือ หรือแจ้งปัญหา
                  <span className="block mt-2 font-black text-indigo-400 uppercase tracking-widest">โปรดแจ้ง MIS ทันที (โทร. 1234)</span>
                </p>
             </div>
          </div>

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
             <StatCard label="Current User" value={asset.receivedBy || "None"} icon={User} color="text-indigo-400" />
             <StatCard label="Department" value={asset.department || "General"} icon={Tag} color="text-purple-400" />
             <StatCard label="IP Address" value={specs.ipAddress || "---"} icon={Activity} color="text-emerald-400" />
             <StatCard label="Warranty" value={asset.warrantyExpire ? format(new Date(asset.warrantyExpire), "d MMM yy") : "No Data"} icon={ShieldCheck} color="text-rose-400" />
          </div>

          {/* Technical Specs - Sleek List */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-4">
               <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] whitespace-nowrap">Technical Matrix</span>
               <div className="h-[1px] w-full bg-white/5" />
            </div>
            
            <div className="space-y-2">
               <SpecRow label="Processor" value={specs.cpu} />
               <SpecRow label="Memory" value={specs.ram} />
               <SpecRow label="Storage" value={specs.storage} />
               <SpecRow label="Hostname" value={specs.computerName} />
            </div>
          </div>

          {/* Footer Branding */}
          <div className="pt-20 pb-10 flex flex-col items-center gap-4 text-center">
             <div className="flex items-center gap-3 opacity-20">
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
                <div className="w-1 h-1 rounded-full bg-white" />
             </div>
             <div>
                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mb-1">MIS Infrastructure</p>
                <p className="text-[8px] font-bold text-white/10 uppercase tracking-widest">Asset Tracking Protocol v2.0</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-[#121212] p-6 rounded-[2.2rem] border border-white/5 shadow-xl relative overflow-hidden group">
       <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500 ${color}`}>
          <Icon size={40} />
       </div>
       <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-1 relative z-10">{label}</p>
       <p className="text-sm font-bold text-white tracking-tight truncate relative z-10">{value}</p>
    </div>
  );
}

function SpecRow({ label, value }: { label: string, value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-4 border-b border-white/5 group active:bg-white/5 px-2 rounded-xl transition-colors">
       <span className="text-xs font-bold text-white/40 uppercase tracking-widest">{label}</span>
       <span className="text-sm font-black text-white tracking-tight">{value}</span>
    </div>
  );
}


