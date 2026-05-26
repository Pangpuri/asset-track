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
    redirect(`/track/${id}/register`);
  }

  const statusColors: Record<string, string> = {
    active: "bg-green-500",
    broken: "bg-red-500",
    lost: "bg-gray-900",
    retired: "bg-gray-400",
  };

  const statusLabels: Record<string, string> = {
    active: "ใช้งานปกติ",
    broken: "ชำรุด",
    lost: "สูญหาย",
    retired: "เลิกใช้งาน",
    pending: "รอลงทะเบียน",
  };

  const specs = asset.specifications || {};

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-lg mx-auto bg-white min-h-screen shadow-sm">
        {/* Header - Modern Sticky */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <Link href="/scan" className="p-2 -ml-2 active:scale-90 transition-transform">
              <ArrowLeft className="h-6 w-6 text-black" />
            </Link>
            <div>
              <h1 className="text-sm font-black uppercase tracking-tight">ระบบติดตามอุปกรณ์</h1>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">ข้อมูลแบบเรียลไทม์</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full animate-pulse ${statusColors[asset.status] || "bg-gray-400"}`}></div>
            <span className="text-[10px] font-black uppercase tracking-tighter">{statusLabels[asset.status] || asset.status}</span>
          </div>
        </div>
        </div>


        <div className="p-4 space-y-6 pb-32">
          {/* Instagram Story Border Style Card */}
          <div className="p-[3px] rounded-[3rem] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-xl shadow-pink-500/10">
            <div className="relative overflow-hidden p-8 rounded-[2.9rem] bg-white border border-white shadow-inner">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-zinc-900">
                <QrCode size={150} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                   <span className="w-2 h-2 rounded-full bg-zinc-900"></span>
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Asset Information</p>
                </div>
                
                <h2 className="text-4xl font-black text-zinc-900 uppercase leading-none mb-2">
                  {asset.brand || "ทั่วไป"}
                </h2>
                <p className="text-xl font-bold text-zinc-500">{asset.model || "ไม่ระบุรุ่น"}</p>

                <div className="mt-10 flex items-center gap-2">
                  <div className="px-4 py-2 bg-zinc-100 rounded-2xl border border-zinc-200">
                    <p className="text-xs font-black text-zinc-900 tracking-tight uppercase">#{asset.assetCode || "---"}</p>
                  </div>
                  <div className="px-4 py-2 bg-zinc-900 rounded-2xl">
                    <p className="text-xs font-black text-white tracking-tight uppercase">{asset.category || "ทั่วไป"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-3">
            <Link href={`/track/${id}/register`} className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-indigo-50 border border-indigo-100 active:scale-95 transition-transform">
              <History className="text-indigo-500" size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">แก้ไขข้อมูล</span>
            </Link>
          </div>

          {/* Details List */}
          <div className="space-y-6">
            <section>
              <h3 className="px-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 flex items-center gap-2">
                <Info size={14} /> ข้อมูลทั่วไป
              </h3>
              <div className="bg-gray-50/50 rounded-3xl p-2 border border-gray-100">
                <InfoRow label="หมายเลขซีเรียล" value={asset.serialNumber} icon={Barcode} colorClass="text-blue-500" />
                <InfoRow label="สถานที่ติดตั้ง" value={asset.location} icon={MapPin} colorClass="text-rose-500" />
                <InfoRow label="ประเภทอุปกรณ์" value={asset.category} icon={Tag} colorClass="text-emerald-500" />
                <InfoRow 
                  label="วันหมดประกัน" 
                  value={asset.warrantyExpire ? format(new Date(asset.warrantyExpire), "d MMMM yyyy", { locale: th }) : null} 
                  icon={Calendar} 
                  colorClass="text-emerald-500" 
                />
                <InfoRow label="ผู้รับมอบ" value={asset.receivedBy} icon={User} colorClass="text-indigo-500" />
                <InfoRow label="ผู้ส่งมอบ" value={asset.deliveredBy} icon={User} colorClass="text-gray-400" />
              </div>
            </section>

            <section>
              <h3 className="px-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 flex items-center gap-2">
                <Activity size={14} /> สเปกเครื่อง
              </h3>
              <div className="bg-gray-50/50 rounded-3xl p-2 border border-gray-100">
                <InfoRow label="ชื่อเครื่อง (Host)" value={specs.computerName} icon={Monitor} colorClass="text-indigo-500" />
                <InfoRow label="เลขไอพี (IP)" value={specs.ipAddress} icon={Activity} colorClass="text-cyan-500" />
                <InfoRow label="ขนาดจอ" value={specs.monitorSize} icon={Monitor} colorClass="text-purple-500" />
                <InfoRow label="หน่วยความจำ (RAM)" value={specs.ram} icon={Cpu} colorClass="text-orange-500" />
                <InfoRow label="ความจุ (Storage)" value={specs.storage} icon={Package} colorClass="text-slate-500" />
              </div>
            </section>

            <section>
              <h3 className="px-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 flex items-center gap-2">
                <Calendar size={14} /> วันที่สำคัญ
              </h3>
              <div className="bg-gray-50/50 rounded-3xl p-2 border border-gray-100">
                <InfoRow 
                  label="วันที่ซื้อ" 
                  value={asset.purchaseDate ? format(new Date(asset.purchaseDate), "d MMMM yyyy", { locale: th }) : null} 
                  icon={Calendar} 
                  colorClass="text-gray-500" 
                />
                <InfoRow 
                  label="วันหมดประกัน" 
                  value={asset.warrantyExpire ? format(new Date(asset.warrantyExpire), "d MMMM yyyy", { locale: th }) : null} 
                  icon={ShieldCheck} 
                  colorClass={asset.warrantyExpire && new Date(asset.warrantyExpire) < new Date() ? "text-red-500" : "text-green-500"} 
                />
                <InfoRow 
                  label="แก้ไขล่าสุด" 
                  value={format(new Date(asset.updatedAt), "d MMM yyyy HH:mm", { locale: th })} 
                  icon={Clock} 
                  colorClass="text-gray-400" 
                />
              </div>
            </section>
          </div>
        </div>

    </div>
  );
}
