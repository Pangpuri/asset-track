import { db } from "@/db";
import { assets } from "@/db/schema/assets";
import { services } from "@/db/schema/services";
import { sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Monitor, 
  Printer, 
  Network, 
  Laptop, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench,
  Package,
  Plus,
  QrCode,
  ArrowRight,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [stats] = await db.select({
      total: sql<string>`count(*)`,
      active: sql<string>`count(*) filter (where ${assets.status} = 'active')`,
      maintenance: sql<string>`count(*) filter (where ${assets.status} = 'maintenance')`,
      broken: sql<string>`count(*) filter (where ${assets.status} = 'broken')`,
      pending: sql<string>`count(*) filter (where ${assets.status} = 'pending')`,
      incomplete: sql<string>`count(*) filter (where ${assets.status} = 'active' and (${assets.serialNumber} is null or ${assets.brand} is null or ${assets.location} is null))`,
      computer: sql<string>`count(*) filter (where ${assets.category} = 'computer')`,
      printer: sql<string>`count(*) filter (where ${assets.category} = 'printer')`,
      monitor: sql<string>`count(*) filter (where ${assets.category} = 'monitor')`,
      network: sql<string>`count(*) filter (where ${assets.category} = 'network')`,
    }).from(assets);

    const [serviceStats] = await db.select({
      pending: sql<string>`count(*) filter (where ${services.status} = 'pending')`,
    }).from(services);

    return {
      total: Number(stats?.total || 0),
      active: Number(stats?.active || 0),
      maintenance: Number(stats?.maintenance || 0),
      broken: Number(stats?.broken || 0),
      pending: Number(stats?.pending || 0),
      incomplete: Number(stats?.incomplete || 0),
      categories: {
        computer: Number(stats?.computer || 0),
        printer: Number(stats?.printer || 0),
        monitor: Number(stats?.monitor || 0),
        network: Number(stats?.network || 0),
      },
      services: {
        pending: Number(serviceStats?.pending || 0),
      }
    };
  } catch (error) {
    console.error("Database connection error in getStats:", error);
    return {
      total: 0, active: 0, maintenance: 0, broken: 0, pending: 0, incomplete: 0,
      categories: { computer: 0, printer: 0, monitor: 0, network: 0 },
      services: { pending: 0 }
    };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-lg mx-auto w-full pb-20">
        {/* Header - IG Style */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h1 className="text-xl font-bold tracking-tight text-black">Dashboard</h1>
        </div>

        {/* Notifications / Alerts - IG Post Style */}
        <div className="space-y-1">
          {stats.services.pending > 0 && (
            <Link href="/dashboard/services" className="block border-b border-gray-100 bg-gray-50/50 p-4 active:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center text-white">
                  <Wrench size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">รายการ แจ้งซ่อม และเปลี่ยนอุปกรณ์</p>
                  <p className="text-xs text-gray-500">{stats.services.pending} รายการ</p>
                </div>
                <ArrowRight size={16} className="text-gray-300" />
              </div>
            </Link>
          )}

          {stats.pending > 0 && (
            <Link href="/dashboard/assets?status=pending" className="block border-b border-gray-100 p-4 active:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-black">
                  <QrCode size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">QR CODE ที่ยังไม่ได้ลงทะเบียน</p>
                  <p className="text-xs text-gray-500">{stats.pending} รายการ</p>
                </div>
                <ArrowRight size={16} className="text-gray-300" />
              </div>
            </Link>
          )}
        </div>

        {/* Stats Grid - Simple 2x2 */}
        <div className="p-4 grid grid-cols-2 gap-4">
           <div className="p-4 border border-gray-100 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">รายการทั้งหมด</span>
              <span className="text-2xl font-black">{stats.total}</span>
           </div>
           <div className="p-4 border border-gray-100 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">อุปกรณ์ที่ใช้งาน</span>
              <span className="text-2xl font-black text-black">{stats.active}</span>
           </div>
           <div className="p-4 border border-gray-100 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">อุปกรณ์ซ่อมแซม</span>
              <span className="text-2xl font-black text-black">{stats.maintenance}</span>
           </div>
           <div className="p-4 border border-gray-100 flex flex-col gap-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">อุปกรณ์เสีย</span>
              <span className="text-2xl font-black text-black">{stats.broken}</span>
           </div>
        </div>

        {/* Categories Section */}
        <div className="mt-4 border-t border-gray-100">
           <div className="px-4 py-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-widest">ประเภทอุปกรณ์</h2>
           </div>
           
           <div className="grid grid-cols-2 gap-[1px] bg-gray-100 border-b border-gray-100">
              <Link href="/dashboard/assets?category=computer" className="aspect-square bg-white flex flex-col items-center justify-center gap-2 active:bg-gray-50">
                 <Laptop size={24} strokeWidth={1.5} />
                 <span className="text-[10px] font-bold">{stats.categories.computer}</span>
              </Link>
              <Link href="/dashboard/assets?category=printer" className="aspect-square bg-white flex flex-col items-center justify-center gap-2 active:bg-gray-50">
                 <Printer size={24} strokeWidth={1.5} />
                 <span className="text-[10px] font-bold">{stats.categories.printer}</span>
              </Link>
              <Link href="/dashboard/assets?category=monitor" className="aspect-square bg-white flex flex-col items-center justify-center gap-2 active:bg-gray-50">
                 <Monitor size={24} strokeWidth={1.5} />
                 <span className="text-[10px] font-bold">{stats.categories.monitor}</span>
              </Link>
              <Link href="/dashboard/assets?category=network" className="aspect-square bg-white flex flex-col items-center justify-center gap-2 active:bg-gray-50">
                 <Network size={24} strokeWidth={1.5} />
                 <span className="text-[10px] font-bold">{stats.categories.network}</span>
              </Link>             
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 space-y-3">
          <Link href="/dashboard/assets/print-qr" className="block">
             <Button variant="outline" className="w-full h-11 border-black text-black font-bold text-xs uppercase tracking-widest">
                Print QR Batch
             </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
