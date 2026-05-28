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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center">
        <div className="w-24 h-24 bg-zinc-50 rounded-[2.5rem] flex items-center justify-center mb-6 border border-zinc-100 shadow-sm">
          <QrCode size={48} className="text-zinc-300" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tighter mb-2">อุปกรณ์นี้ยังไม่ลงทะเบียน</h1>
        <p className="text-zinc-500 text-sm leading-relaxed max-w-[280px]">
          พบรหัส QR Code ในระบบแต่ยังไม่มีการผูกข้อมูลอุปกรณ์ 
          <span className="block mt-4 font-bold text-indigo-600 uppercase tracking-widest text-[10px]">โปรดแจ้งฝ่าย MIS เพื่อเปิดใช้งาน</span>
        </p>
        <Link href="/" className="mt-10">
          <Button variant="outline" className="rounded-2xl px-8 h-12 font-bold border-zinc-200">กลับหน้าหลัก</Button>
        </Link>
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
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="max-w-lg mx-auto bg-white min-h-screen shadow-[0_0_50px_rgba(0,0,0,0.02)]">
        {/* Header - IG Style */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-100 sticky top-0 bg-white/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <Link href="/" className="active:opacity-50 transition-opacity">
              <ArrowLeft className="h-6 w-6 text-zinc-900" />
            </Link>
            <span className="text-base font-bold tracking-tight text-zinc-900">Asset Details</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-100">
            <div className={`w-1.5 h-1.5 rounded-full ${statusColors[asset.status] || "bg-zinc-400"}`}></div>
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-600">{statusLabels[asset.status] || asset.status}</span>
          </div>
        </div>

        <div className="p-5 space-y-8 pb-32">
          {/* Main Visual Card - Professional IG Style */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] rounded-[2.5rem] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative bg-white rounded-[2.2rem] overflow-hidden border border-zinc-100 shadow-xl">
              {/* Card Header Pattern */}
              <div className="h-24 bg-zinc-900 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-100 via-transparent to-transparent"></div>
                <div className="absolute top-6 right-6 text-white/10">
                  <Package size={80} strokeWidth={1} />
                </div>
                <div className="absolute bottom-4 left-6">
                  <div className="px-3 py-1 rounded-lg bg-white/10 backdrop-blur-md border border-white/10">
                    <p className="text-[9px] font-black text-white/80 uppercase tracking-[0.2em]">Hardware Asset</p>
                  </div>
                </div>
              </div>

              <div className="p-8 pt-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-4xl font-[1000] text-zinc-900 uppercase tracking-tighter leading-none mb-1">
                      {asset.brand || "UNBRANDED"}
                    </h2>
                    <p className="text-lg font-bold text-zinc-400 tracking-tight">{asset.model || "Standard Model"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Code</p>
                    <p className="text-xl font-black text-indigo-600 tracking-tighter leading-none">#{asset.assetCode || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Category</p>
                    <p className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                      <Tag size={14} className="text-indigo-500" />
                      {asset.category || "General"}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Location</p>
                    <p className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                      <MapPin size={14} className="text-rose-500" />
                      <span className="truncate">{asset.location || "Office"}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* MIS Alert Message - High Visibility */}
          <div className="p-6 rounded-[2rem] bg-indigo-50 border-2 border-indigo-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-indigo-200/50 group-hover:scale-110 transition-transform duration-500">
              <Info size={64} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                  <Activity size={12} className="text-white" />
                </div>
                <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">MIS Help Desk</span>
              </div>
              <p className="text-sm font-bold text-indigo-900/80 leading-relaxed">
                หากอุปกรณ์มีปัญหา ชำรุด หรือต้องการความช่วยเหลือ 
                <span className="block text-indigo-600 font-black mt-1">กรุณาแจ้งฝ่าย MIS ทันที (โทร. 1234)</span>
              </p>
            </div>
          </div>

          {/* Details Sections */}
          <div className="space-y-10 px-1">
            {/* General Info */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[1px] flex-1 bg-zinc-100"></div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">General Information</h3>
                <div className="h-[1px] flex-1 bg-zinc-100"></div>
              </div>
              <div className="grid grid-cols-1 gap-1">
                <InfoRow label="Serial Number" value={asset.serialNumber} icon={Barcode} colorClass="text-zinc-900" />
                <InfoRow label="Employee Name" value={asset.receivedBy} icon={User} colorClass="text-zinc-900" />
                <InfoRow label="Department" value={asset.department} icon={Package} colorClass="text-zinc-900" />
                <InfoRow 
                  label="Warranty Status" 
                  value={asset.warrantyExpire ? format(new Date(asset.warrantyExpire), "d MMMM yyyy", { locale: th }) : "No Warranty"} 
                  icon={ShieldCheck} 
                  colorClass={asset.warrantyExpire && new Date(asset.warrantyExpire) < new Date() ? "text-rose-500" : "text-emerald-500"} 
                />
              </div>
            </section>

            {/* Technical Specs */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-[1px] flex-1 bg-zinc-100"></div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Technical Specs</h3>
                <div className="h-[1px] flex-1 bg-zinc-100"></div>
              </div>
              <div className="grid grid-cols-1 gap-1">
                <InfoRow label="Host Name" value={specs.computerName} icon={Monitor} colorClass="text-zinc-900" />
                <InfoRow label="IP Address" value={specs.ipAddress} icon={Activity} colorClass="text-zinc-900" />
                <InfoRow label="CPU / Processor" value={specs.cpu} icon={Cpu} colorClass="text-zinc-900" />
                <InfoRow label="Memory (RAM)" value={specs.ram} icon={Activity} colorClass="text-zinc-900" />
                <InfoRow label="Storage" value={specs.storage} icon={Package} colorClass="text-zinc-900" />
              </div>
            </section>
          </div>
          
          <div className="pt-10 flex flex-col items-center justify-center gap-4 border-t border-zinc-100">
             <div className="flex items-center gap-2 opacity-20">
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-900"></div>
             </div>
             <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.4em]">Asset Tracking System</p>
          </div>
        </div>
      </div>
    </div>
  );
}

