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
    <div className="flex items-center gap-4 py-4 border-b border-zinc-100 last:border-0 active:bg-zinc-50 transition-colors">
      <div className={`w-10 h-10 rounded-2xl bg-zinc-50 flex items-center justify-center ${colorClass} flex-shrink-0 border border-zinc-100 ${isEmpty ? "opacity-40 grayscale" : ""}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase font-black tracking-widest text-zinc-400 mb-0.5">{label}</p>
        <p className={`text-base font-bold truncate ${isEmpty ? "text-zinc-300 italic font-normal" : "text-zinc-900"}`}>
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

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  // Note: some formats might differ, but we expect UUID
  
  let asset;
  try {
    asset = await db.query.assets.findFirst({
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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 space-y-8">
          <div className="w-24 h-24 bg-white border border-zinc-100 rounded-[2.5rem] flex items-center justify-center shadow-2xl mx-auto">
            <QrCode size={48} className="text-amber-500" strokeWidth={1.5} />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-[1000] tracking-tighter uppercase italic text-zinc-900 leading-none">
              WAIT FOR<br/>
              <span className="text-amber-500 text-5xl">CONFIG</span>
            </h1>
            <p className="text-zinc-400 text-sm font-bold leading-relaxed max-w-[260px] mx-auto uppercase tracking-widest">
              พบรหัสในระบบแต่ยังไม่มีข้อมูลอุปกรณ์<br/>โปรดแจ้งฝ่าย MIS เพื่อเปิดใช้งาน
            </p>
          </div>

          <div className="pt-6">
            <Link href="/">
              <Button className="h-14 bg-zinc-900 text-white hover:bg-black rounded-2xl font-[1000] text-xs uppercase tracking-[0.3em] transition-all active:scale-[0.98] px-10 shadow-xl shadow-zinc-200">
                RETURN TO HOME
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
    active: "ใช้งานปกติ",
    broken: "ชำรุด/ส่งซ่อม",
    lost: "สูญหาย",
    retired: "เลิกใช้งาน",
  };

  const specs = asset.specifications || {};

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-900 selection:bg-indigo-500/10">
      <div className="max-w-lg mx-auto bg-white min-h-screen relative shadow-2xl shadow-zinc-200/50">
        
        {/* IG Header Style */}
        <div className="flex items-center justify-between px-6 h-16 sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-zinc-100">
          <div className="flex items-center gap-4">
            <Link href="/" className="active:scale-90 transition-transform">
              <ArrowLeft className="h-6 w-6 text-zinc-900" />
            </Link>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none mb-1">Asset Profile</span>
              <span className="text-sm font-bold tracking-tight text-zinc-900 uppercase italic">ID: {asset.assetCode || "---"}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-50 border border-zinc-100">
            <div className={`w-2 h-2 rounded-full animate-pulse ${statusColors[asset.status] || "bg-zinc-400"}`}></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{statusLabels[asset.status] || asset.status}</span>
          </div>
        </div>

        <div className="px-6 py-8 space-y-10 pb-40">
          {/* Main Visual Card - Product Style */}
          <div className="relative group">
            <div className="luxury-glow opacity-30" />
            <div className="relative bg-white rounded-[2.8rem] overflow-hidden border border-zinc-100 shadow-2xl">
              <div className="h-44 bg-zinc-50 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_var(--tw-gradient-stops))] from-white to-transparent opacity-80"></div>
                <div className="absolute top-0 right-0 p-8 text-zinc-100 rotate-12">
                   <Package size={200} strokeWidth={0.5} />
                </div>
                <div className="relative z-10 flex flex-col items-center">
                   <div className="w-20 h-20 bg-white rounded-3xl border border-zinc-100 flex items-center justify-center mb-4 shadow-xl">
                      <Cpu size={40} className="text-indigo-600" />
                   </div>
                   <div className="px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100">
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{asset.category || "Hardware"}</p>
                   </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div>
                  <h2 className="text-5xl font-[1000] tracking-tighter uppercase leading-none mb-2 text-zinc-900 italic">
                    {asset.brand || "SYSTEM"}
                  </h2>
                  <p className="text-xl font-bold text-zinc-400 tracking-tight">{asset.model || "Universal Unit"}</p>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-zinc-100">
                   <div className="flex-1">
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Serial Number</p>
                      <p className="text-sm font-bold text-zinc-900 tracking-wide font-mono">{asset.serialNumber || "---"}</p>
                   </div>
                   <div className="h-10 w-[1px] bg-zinc-100"></div>
                   <div className="flex-1">
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Location</p>
                      <p className="text-sm font-bold text-zinc-900 tracking-tight truncate">{asset.location || "Office"}</p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* MIS Help Alert */}
          <div className="relative overflow-hidden p-6 rounded-[2.5rem] bg-indigo-50 border border-indigo-100 group">
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform duration-700 text-indigo-600">
                <Info size={100} />
             </div>
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                   <div className="w-8 h-8 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                      <Activity size={16} className="text-white" />
                   </div>
                   <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">MIS Support Center</span>
                </div>
                <h3 className="text-lg font-black text-zinc-900 mb-1 italic">มีปัญหาเกี่ยวกับการใช้งาน?</h3>
                <p className="text-sm font-bold text-zinc-600 leading-relaxed">
                  หากอุปกรณ์ชำรุด ต้องการความช่วยเหลือ หรือแจ้งปัญหา
                  <span className="block mt-2 font-black text-indigo-600 uppercase tracking-widest underline decoration-2 underline-offset-4">โปรดแจ้ง MIS ทันที (โทร. 1234)</span>
                </p>
             </div>
          </div>

          {/* Core Info List */}
          <div className="space-y-2">
             <div className="flex items-center gap-4 mb-4">
                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em] whitespace-nowrap">Core Information</span>
                <div className="h-[1px] w-full bg-zinc-100" />
             </div>
             <InfoRow label="Current User" value={asset.receivedBy} icon={User} colorClass="text-indigo-600" />
             <InfoRow label="Department" value={asset.department} icon={Tag} colorClass="text-purple-600" />
             <InfoRow label="Warranty Status" value={asset.warrantyExpire ? format(new Date(asset.warrantyExpire), "d MMMM yyyy", { locale: th }) : "ไม่มีข้อมูล"} icon={ShieldCheck} colorClass="text-emerald-600" />
          </div>

          {/* Technical List */}
          <div className="space-y-2 pt-4">
            <div className="flex items-center gap-4 mb-4">
               <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.4em] whitespace-nowrap">Technical Matrix</span>
               <div className="h-[1px] w-full bg-zinc-100" />
            </div>
            <InfoRow label="Host Name" value={specs.computerName} icon={Monitor} colorClass="text-zinc-600" />
            <InfoRow label="IP Address" value={specs.ipAddress} icon={Activity} colorClass="text-zinc-600" />
            <InfoRow label="Processor" value={specs.cpu} icon={Cpu} colorClass="text-zinc-600" />
            <InfoRow label="Memory" value={specs.ram} icon={Activity} colorClass="text-zinc-600" />
            <InfoRow label="Storage" value={specs.storage} icon={Package} colorClass="text-zinc-600" />
          </div>

          <div className="pt-20 pb-10 flex flex-col items-center gap-4 text-center">
             <div className="flex items-center gap-3 opacity-20">
                <div className="w-1 h-1 rounded-full bg-zinc-900" />
                <div className="w-1 h-1 rounded-full bg-zinc-900" />
                <div className="w-1 h-1 rounded-full bg-zinc-900" />
             </div>
             <div>
                <p className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.5em] mb-1">MIS Infrastructure</p>
                <p className="text-[8px] font-bold text-zinc-200 uppercase tracking-widest">Asset Tracking Protocol v2.0</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }: { label: string, value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-100 group active:bg-zinc-50 px-2 rounded-xl transition-colors">
       <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{label}</span>
       <span className="text-sm font-black text-zinc-900 tracking-tight">{value}</span>
    </div>
  );
}
