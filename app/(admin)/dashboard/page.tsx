import { db } from "@/db";
import { assets } from "@/db/schema";
import { sql } from "drizzle-orm";
import { 
  LayoutDashboard, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Monitor,
  Printer,
  Network,
  Laptop,
  MoreHorizontal,
  ArrowRight,
  Trash2,
  PackagePlus,
  Search,
  History
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [stats] = await db.select({ 
      total: sql<number>`count(*) filter (where ${assets.deletedAt} is null)::int`,
      active: sql<number>`count(*) filter (where ${assets.status} = 'active' and ${assets.deletedAt} is null)::int`,
      broken: sql<number>`count(*) filter (where ${assets.status} = 'broken' and ${assets.deletedAt} is null)::int`,
      pending: sql<number>`count(*) filter (where ${assets.status} = 'pending' and ${assets.deletedAt} is null)::int`,
      retired: sql<number>`count(*) filter (where ${assets.deletedAt} is not null)::int`,
      incomplete: sql<number>`count(*) filter (where ${assets.status} = 'active' and ${assets.deletedAt} is null and (${assets.serialNumber} is null or ${assets.serialNumber} = '' or ${assets.brand} is null or ${assets.brand} = '' or ${assets.location} is null or ${assets.location} = ''))::int`,
      lost: sql<number>`count(*) filter (where ${assets.status} = 'lost' and ${assets.deletedAt} is null)::int`,
      computer: sql<number>`count(*) filter (where ${assets.category} = 'computer' and ${assets.deletedAt} is null)::int`,
      printer: sql<number>`count(*) filter (where ${assets.category} = 'printer' and ${assets.deletedAt} is null)::int`,
      monitor: sql<number>`count(*) filter (where ${assets.category} = 'monitor' and ${assets.deletedAt} is null)::int`,
      network: sql<number>`count(*) filter (where ${assets.category} = 'network' and ${assets.deletedAt} is null)::int`,
      other: sql<number>`count(*) filter (where (${assets.category} = 'other' or ${assets.category} is null) and ${assets.deletedAt} is null)::int`,
    }).from(assets);

    return {
      total: stats?.total || 0,
      active: stats?.active || 0,
      broken: stats?.broken || 0,
      pending: stats?.pending || 0,
      retired: stats?.retired || 0,
      categories: {
        computer: stats?.computer || 0,
        printer: stats?.printer || 0,
        monitor: stats?.monitor || 0,
        network: stats?.network || 0,
        other: stats?.other || 0,
      },
      incomplete: stats?.incomplete || 0,
      lost: stats?.lost || 0,
    };
  } catch (error) {
    console.error("Database error:", error);
    return { 
      total: 0, active: 0, broken: 0, pending: 0, retired: 0, incomplete: 0, lost: 0,
      categories: { computer: 0, printer: 0, monitor: 0, network: 0, other: 0 }
    };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statusCards = [
    { title: "ใช้งานปกติ", value: stats.active, icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-50", href: "/dashboard/assets?status=active" },
    { title: "ชำรุด/ส่งซ่อม", value: stats.broken, icon: AlertTriangle, color: "text-rose-500", bgColor: "bg-rose-50", href: "/dashboard/assets/repairs" },
    { title: "รอลงทะเบียน", value: stats.pending, icon: Clock, color: "text-amber-500", bgColor: "bg-amber-50", href: "/dashboard/assets?status=pending" },
    { title: "จำหน่ายออก", value: stats.retired, icon: Trash2, color: "text-zinc-400", bgColor: "bg-zinc-100", href: "/dashboard/assets/retired" }
  ];

  const categoryItems = [
    { label: "Computer", value: stats.categories.computer, icon: Laptop, color: "bg-blue-500", textColor: "text-blue-600" },
    { label: "Monitor", value: stats.categories.monitor, icon: Monitor, color: "bg-purple-500", textColor: "text-purple-600" },
    { label: "Printer", value: stats.categories.printer, icon: Printer, color: "bg-orange-500", textColor: "text-orange-600" },
    { label: "Network", value: stats.categories.network, icon: Network, color: "bg-cyan-500", textColor: "text-cyan-600" },
    { label: "อื่นๆ", value: stats.categories.other, icon: MoreHorizontal, color: "bg-slate-400", textColor: "text-slate-600" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50/50 pb-10">
      <div className="max-w-lg mx-auto">
        
        {/* Header - Light IG Style */}
        <div className="bg-white px-6 py-8 border-b border-zinc-100 rounded-b-3xl shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-[1000] tracking-tighter text-zinc-900 leading-none uppercase">
                DASH<span className="text-indigo-600">BOARD</span>
              </h1>
              <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-[8px]">MIS Asset Management</p>
            </div>
            <LogoutButton />
          </div>

          <div className="flex justify-between items-end mb-6">
            <div className="flex flex-col">
               <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">อุปกรณ์ทั้งหมด</span>
               <span className="text-4xl font-[1000] text-zinc-900 leading-none tracking-tighter">{stats.total}</span>
            </div>
            <Link href="/dashboard/assets/new">
              <Button className="bg-zinc-900 text-white rounded-xl font-bold text-xs h-10 px-6 gap-2 shadow-lg shadow-zinc-200">
                <PackagePlus size={16} />
                เพิ่มอุปกรณ์
              </Button>
            </Link>
          </div>

          {/* Category Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {categoryItems.map((item) => (
              <Link 
                key={item.label}
                href={`/dashboard/assets?category=${item.label.toLowerCase()}`}
                className="flex-shrink-0 flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-4 py-2.5 rounded-xl active:scale-95 transition-all shadow-sm"
              >
                <div className={cn("p-1.5 rounded-lg bg-white shadow-sm", item.textColor)}>
                  <item.icon size={14} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-zinc-900 leading-none">{item.value}</span>
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="px-5 py-8 space-y-8">
          
          {/* Status Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statusCards.map((card) => (
              <Link key={card.title} href={card.href} className="group active:scale-95 transition-transform">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-white flex flex-col items-center text-center gap-3 h-full">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-inner", card.bgColor)}>
                    <card.icon className={card.color} size={24} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-2xl font-[1000] text-zinc-900 leading-none tracking-tighter">{card.value}</p>
                    <p className="text-[9px] font-black uppercase tracking-tighter text-zinc-400 leading-tight">{card.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Featured Sections */}
          <div className="grid grid-cols-1 gap-4">
            <Link href="/dashboard/assets?filter=incomplete">
              <div className="relative group active:scale-[0.98] transition-all overflow-hidden rounded-3xl bg-zinc-900 shadow-xl p-[1px]">
                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 opacity-20" />
                 <div className="relative bg-white rounded-[23px] p-6 flex items-center justify-between overflow-hidden">
                   <div className="relative z-10 flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                         <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                         <h3 className="text-xl font-[1000] text-zinc-900 tracking-tight uppercase">Incomplete Data</h3>
                      </div>
                      <p className="text-[10px] font-bold text-zinc-400 leading-relaxed uppercase tracking-tighter">พบอุปกรณ์ข้อมูลไม่สมบูรณ์ <span className="text-rose-600 font-black">{stats.incomplete}</span> รายการ</p>
                   </div>
                   <div className="relative z-10 bg-zinc-900 text-white p-4 rounded-xl shadow-lg group-hover:translate-x-1 transition-transform">
                      <ArrowRight size={20} strokeWidth={3} />
                   </div>
                 </div>
              </div>
            </Link>
          </div>

          {/* Status Distribution - Circular Chart (RESTORING AS REQUESTED) */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100 overflow-hidden">
            <h3 className="text-xs font-black text-zinc-900 mb-8 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
              ภาพรวมสถานะอุปกรณ์ (Status Overview)
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-12">
              <div className="relative w-44 h-44 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-zinc-50" strokeWidth="4" />
                  {(() => {
                    let offset = 0;
                    const statusConfig = [
                      { key: 'active', value: stats.active, color: '#10b981' }, // emerald-500
                      { key: 'broken', value: stats.broken, color: '#f43f5e' }, // rose-500
                      { key: 'pending', value: stats.pending, color: '#f59e0b' }, // amber-500
                      { key: 'lost', value: stats.lost, color: '#71717a' },   // zinc-500
                    ];
                    return statusConfig.map(s => {
                      if (s.value === 0 || stats.total === 0) return null;
                      const percentage = (s.value / stats.total) * 100;
                      const strokeDasharray = `${percentage} ${100 - percentage}`;
                      const currentOffset = offset;
                      offset += percentage;
                      return (
                        <circle key={s.key} cx="18" cy="18" r="16" fill="none" stroke={s.color} strokeWidth="4" strokeDasharray={strokeDasharray} strokeDashoffset={-currentOffset} className="transition-all duration-1000 ease-out" />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-[1000] text-zinc-900 leading-none">{stats.total}</span>
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter mt-1">รายการ</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-4">
                {[
                  { label: 'ใช้งานปกติ', value: stats.active, color: 'bg-emerald-500', sub: 'Healthy Assets' },
                  { label: 'ชำรุด/ส่งซ่อม', value: stats.broken, color: 'bg-rose-500', sub: 'Under Maintenance' },
                  { label: 'รอลงทะเบียน', value: stats.pending, color: 'bg-amber-500', sub: 'New Setup' },
                  { label: 'สูญหาย', value: stats.lost, color: 'bg-zinc-500', sub: 'Missing Items' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-2 h-2 rounded-full shadow-sm", item.color)} />
                      <div className="flex flex-col">
                        <span className="text-[13px] font-black text-zinc-700 leading-none">{item.label}</span>
                        <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-tight mt-1">{item.sub}</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-2">
                       <span className="text-sm font-black text-zinc-900">{item.value}</span>
                       <span className="text-[10px] font-bold text-zinc-200">({stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(0) : 0}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Insights Section */}
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-zinc-100">
            <h3 className="text-xs font-black text-zinc-900 mb-8 uppercase tracking-[0.3em] flex items-center gap-3">
              <div className="w-1.5 h-4 bg-purple-600 rounded-full" />
              แยกตามประเภทอุปกรณ์ (Category Distribution)
            </h3>
            <div className="space-y-6">
              {categoryItems.map((item) => (
                <div key={item.label} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl bg-opacity-10 shadow-sm bg-white border border-zinc-50", item.textColor)}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">{item.label}</span>
                    </div>
                    <span className="text-xs font-black text-zinc-900">{item.value} <span className="text-[10px] text-zinc-300 font-normal">เครื่อง</span></span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden border border-zinc-100/50">
                    <div className={cn("h-full transition-all duration-1000", item.color)} style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center px-10 pb-6 mt-10">
           <p className="text-[9px] font-black text-zinc-300 uppercase tracking-[0.5em]">MIS Enterprise Resource Planning v2.0</p>
        </div>
      </div>
    </div>
  );
}
