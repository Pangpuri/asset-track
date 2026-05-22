import { db } from "@/db";
import { assets } from "@/db/schema/assets";
import { logs } from "@/db/schema/logs";
import { eq, desc } from "drizzle-orm";
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
  Wrench,
  User,
  Hash,
  Monitor,
  Laptop,
  Barcode,
  Activity,
  CalendarDays,
  History,
  AlertCircle
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const InfoRow = ({ label, value, icon: Icon, colorClass = "text-gray-400" }: { label: string, value: string | null | undefined, icon: any, colorClass?: string }) => {
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
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    notFound();
  }

  let asset;
  try {
    // ดึงข้อมูล Asset และ Log ล่าสุด
    asset = await db
      .select()
      .from(assets)
      .where(eq(assets.id, id))
      .limit(1)
      .then((res) => res[0]);
  } catch (error) {
    notFound();
  }

  if (!asset) {
    notFound();
  }

  if (asset.status === "pending") {
    redirect(`/track/${id}/register`);
  }

  const latestLog = await db
    .select()
    .from(logs)
    .where(eq(logs.assetId, id))
    .orderBy(desc(logs.createdAt))
    .limit(1)
    .then((res) => res[0]);

  const statusColors: Record<string, string> = {
    active: "bg-green-500",
    maintenance: "bg-amber-500",
    broken: "bg-red-500",
    lost: "bg-gray-900",
    retired: "bg-gray-400",
  };

  const statusLabels: Record<string, string> = {
    active: "ใช้งานปกติ",
    maintenance: "กำลังซ่อม",
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

        <div className="p-4 space-y-6 pb-32">
          {/* Main Card - High Impact */}
          <div className="relative overflow-hidden p-6 rounded-[2.5rem] bg-black text-white shadow-2xl shadow-black/10">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <QrCodeIcon size={120} />
            </div>
            
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-1">ยี่ห้อและรุ่น</p>
              <h2 className="text-3xl font-black uppercase leading-none mb-1">
                {asset.brand || "ทั่วไป"}
              </h2>
              <p className="text-lg font-medium text-white/80">{asset.model || "ไม่ระบุรุ่น"}</p>
              
              <div className="mt-8 flex items-center gap-2">
                <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
                  <p className="text-[10px] font-bold tracking-tight uppercase">รหัส: {asset.assetCode || "---"}</p>
                </div>
                <div className="px-3 py-1 bg-white/10 rounded-full border border-white/10 backdrop-blur-sm">
                  <p className="text-[10px] font-bold tracking-tight uppercase">{asset.category || "ทั่วไป"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link href={`/track/${id}/services`} className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-red-50 border border-red-100 active:scale-95 transition-transform">
              <Wrench className="text-red-500" size={24} />
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600">แจ้งซ่อม / ปัญหา</span>
            </Link>
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
              </div>
            </section>

            <section>
              <h3 className="px-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 flex items-center gap-2">
                <Cpu size={14} /> สเปกเครื่อง
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
                <User size={14} /> ผู้ใช้งานปัจจุบัน
              </h3>
              <div className="bg-gray-50/50 rounded-3xl p-4 border border-gray-100">
                {latestLog ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black font-bold">
                        {latestLog.assignedTo?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{latestLog.assignedTo || "ไม่ได้ระบุชื่อ"}</p>
                        <p className="text-[10px] text-gray-500 font-medium">{latestLog.department || "ไม่ระบุแผนก"}</p>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase text-gray-400">เริ่มใช้งานเมื่อ</span>
                      <span className="text-[10px] font-black uppercase">
                        {latestLog.deliveryDate ? format(new Date(latestLog.deliveryDate), "d MMM yyyy", { locale: th }) : "---"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-2 space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full inline-block border border-amber-100">ไม่มีข้อมูลผู้ใช้</p>
                    <p className="text-xs text-gray-400 font-medium italic">กรุณาอัปเดตข้อมูลเพื่อระบุตัวตนผู้ใช้</p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="px-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2 flex items-center gap-2">
                <CalendarDays size={14} /> วันที่สำคัญ
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

        {/* Floating Action Button for Mobile */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-6 z-30">
          <Link href={`/track/${id}/services`}>
            <Button className="w-full h-14 bg-black text-white rounded-2xl shadow-2xl shadow-black/20 font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all">
              <Wrench size={20} />
              แจ้งปัญหา / แจ้งซ่อม
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function QrCodeIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <path d="M7 7h.01" />
      <path d="M17 7h.01" />
      <path d="M17 17h.01" />
      <path d="M7 17h.01" />
    </svg>
  );
}