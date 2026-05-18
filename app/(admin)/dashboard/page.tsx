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
  QrCode
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function getStats() {
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

  // ดึงสถิติจากตารางแจ้งซ่อม (Service Tickets)
  const [serviceStats] = await db.select({
    pending: sql<string>`count(*) filter (where ${services.status} = 'pending')`,
  }).from(services);

  return {
    total: Number(stats.total),
    active: Number(stats.active),
    maintenance: Number(stats.maintenance),
    broken: Number(stats.broken),
    pending: Number(stats.pending),
    incomplete: Number(stats.incomplete),
    categories: {
      computer: Number(stats.computer),
      printer: Number(stats.printer),
      monitor: Number(stats.monitor),
      network: Number(stats.network),
    },
    services: {
      pending: Number(serviceStats.pending),
    }
  };
}

export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div className="container mx-auto p-6 space-y-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-indigo-950 flex items-center gap-3">
            Dashboard
            <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
          </h1>
          <p className="text-indigo-600/60 font-medium">ภาพรวมระบบบริหารจัดการสินทรัพย์ MIS</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/assets/print-qr">
            <Button variant="outline" className="h-11 gap-2 border-indigo-200 text-indigo-700 bg-white/50 hover:bg-indigo-50 neo-button rounded-xl">
              <QrCode className="h-4 w-4" /> พิมพ์ QR ชุดใหญ่
            </Button>
          </Link>
          <Link href="/dashboard/assets/new">
            <Button className="h-11 gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 neo-button rounded-xl">
              <Plus className="h-4 w-4" /> เพิ่มอุปกรณ์ใหม่
            </Button>
          </Link>
        </div>
      </div>

      {/* แจ้งเตือนงานที่ต้องจัดการ */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.services.pending > 0 && (
          <Link href="/dashboard/services">
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-[1px] rounded-[1.5rem] shadow-xl shadow-orange-100 hover:scale-[1.02] transition-transform">
              <div className="bg-white/95 backdrop-blur-sm p-5 rounded-[1.45rem] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-lg shadow-orange-200">
                    <Wrench className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black text-orange-950">แจ้งซ่อมใหม่</p>
                    <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">{stats.services.pending} รายการรอดำเนินการ</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {stats.pending > 0 && (
          <Link href="/dashboard/assets?status=pending">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-[1px] rounded-[1.5rem] shadow-xl shadow-amber-100 hover:scale-[1.02] transition-transform">
              <div className="bg-white/95 backdrop-blur-sm p-5 rounded-[1.45rem] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-500 p-3 rounded-2xl text-white shadow-lg shadow-amber-200">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black text-amber-950">รอลงทะเบียน</p>
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">{stats.pending} QR รอกรอบข้อมูล</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {stats.incomplete > 0 && (
          <Link href="/dashboard/assets?filter=incomplete">
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-[1px] rounded-[1.5rem] shadow-xl shadow-rose-100 hover:scale-[1.02] transition-transform">
              <div className="bg-white/95 backdrop-blur-sm p-5 rounded-[1.45rem] flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-rose-500 p-3 rounded-2xl text-white shadow-lg shadow-rose-200">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-black text-rose-950">ข้อมูลไม่ครบ</p>
                    <p className="text-xs font-bold text-rose-600 uppercase tracking-wider">{stats.incomplete} รายการต้องการข้อมูลเพิ่ม</p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* สรุปสถานะหลัก */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-none shadow-xl rounded-3xl overflow-hidden group hover:bg-white transition-colors duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-indigo-900/60 uppercase tracking-widest">อุปกรณ์ทั้งหมด</CardTitle>
            <div className="bg-indigo-100 p-2 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-indigo-950">{stats.total}</div>
            <p className="text-xs font-medium text-indigo-400 mt-1">รายการในระบบ MIS</p>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-none shadow-xl rounded-3xl overflow-hidden group hover:bg-white transition-colors duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-emerald-900/60 uppercase tracking-widest">พร้อมใช้งาน</CardTitle>
            <div className="bg-emerald-100 p-2 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500 text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-emerald-600">{stats.active}</div>
            <p className="text-xs font-medium text-emerald-400 mt-1">สถานะปกติ</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-xl rounded-3xl overflow-hidden group hover:bg-white transition-colors duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-amber-900/60 uppercase tracking-widest">ส่งซ่อม</CardTitle>
            <div className="bg-amber-100 p-2 rounded-xl group-hover:bg-amber-600 group-hover:text-white transition-colors duration-500 text-amber-600">
              <Wrench className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-amber-600">{stats.maintenance}</div>
            <p className="text-xs font-medium text-amber-400 mt-1">กำลังดำเนินการ</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-none shadow-xl rounded-3xl overflow-hidden group hover:bg-white transition-colors duration-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-rose-900/60 uppercase tracking-widest">ชำรุด/เสีย</CardTitle>
            <div className="bg-rose-100 p-2 rounded-xl group-hover:bg-rose-600 group-hover:text-white transition-colors duration-500 text-rose-600">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-rose-600">{stats.broken}</div>
            <p className="text-xs font-medium text-rose-400 mt-1">ต้องจัดการเร่งด่วน</p>
          </CardContent>
        </Card>
      </div>

      {/* แยกตามประเภท */}
      <div className="space-y-6">
        <h2 className="text-2xl font-black text-indigo-950 tracking-tight">แยกตามประเภทอุปกรณ์</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/assets?category=computer" className="hover:scale-[1.02] transition-transform duration-300">
            <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 border-none shadow-xl shadow-blue-100 rounded-3xl overflow-hidden">
              <CardContent className="pt-6 relative">
                <Laptop className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-white/10 -rotate-12" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Laptop className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/80 uppercase tracking-widest">Computers</p>
                    <p className="text-3xl font-black text-white">{stats.categories.computer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/dashboard/assets?category=printer" className="hover:scale-[1.02] transition-transform duration-300">
            <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 border-none shadow-xl shadow-purple-100 rounded-3xl overflow-hidden">
              <CardContent className="pt-6 relative">
                <Printer className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-white/10 -rotate-12" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Printer className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/80 uppercase tracking-widest">Printers</p>
                    <p className="text-3xl font-black text-white">{stats.categories.printer}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/assets?category=monitor" className="hover:scale-[1.02] transition-transform duration-300">
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 border-none shadow-xl shadow-emerald-100 rounded-3xl overflow-hidden">
              <CardContent className="pt-6 relative">
                <Monitor className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-white/10 -rotate-12" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Monitor className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/80 uppercase tracking-widest">Monitors</p>
                    <p className="text-3xl font-black text-white">{stats.categories.monitor}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/assets?category=network" className="hover:scale-[1.02] transition-transform duration-300">
            <Card className="bg-gradient-to-br from-orange-500 to-amber-600 border-none shadow-xl shadow-orange-100 rounded-3xl overflow-hidden">
              <CardContent className="pt-6 relative">
                <Network className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-white/10 -rotate-12" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Network className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white/80 uppercase tracking-widest">Network</p>
                    <p className="text-3xl font-black text-white">{stats.categories.network}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      <div className="text-center pt-12 pb-8">
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-indigo-200 to-transparent mx-auto mb-4" />
        <p className="text-[11px] text-indigo-400 font-black uppercase tracking-[0.4em]">
          AssetTrack System • พัฒนาโดยฝ่าย MIS
        </p>
      </div>
    </div>
  );
}
