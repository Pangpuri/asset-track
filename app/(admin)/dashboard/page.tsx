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
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getStats() {
  try {
    const [stats] = await db.select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where ${assets.status} = 'active')::int`,
      broken: sql<number>`count(*) filter (where ${assets.status} = 'broken')::int`,
      pending: sql<number>`count(*) filter (where ${assets.status} = 'pending')::int`,
      // แยกตามประเภท
      computer: sql<number>`count(*) filter (where ${assets.category} = 'computer')::int`,
      printer: sql<number>`count(*) filter (where ${assets.category} = 'printer')::int`,
      monitor: sql<number>`count(*) filter (where ${assets.category} = 'monitor')::int`,
      network: sql<number>`count(*) filter (where ${assets.category} = 'network')::int`,
      other: sql<number>`count(*) filter (where ${assets.category} = 'other' or ${assets.category} is null)::int`,
      // แยกตามโรงงาน
      f1: sql<number>`count(*) filter (where ${assets.factory} ilike '%โรงงาน 1%' or ${assets.factory} ilike '%Factory 1%')::int`,
      f2: sql<number>`count(*) filter (where ${assets.factory} ilike '%โรงงาน 2%' or ${assets.factory} ilike '%Factory 2%')::int`,
      both: sql<number>`count(*) filter (where ${assets.factory} ilike '%ทั้ง 2 โรงงาน%' or ${assets.factory} ilike '%both%')::int`,
    }).from(assets);

    return {
      total: stats?.total || 0,
      active: stats?.active || 0,
      broken: stats?.broken || 0,
      pending: stats?.pending || 0,
      categories: {
        computer: stats?.computer || 0,
        printer: stats?.printer || 0,
        monitor: stats?.monitor || 0,
        network: stats?.network || 0,
        other: stats?.other || 0,
      },
      factories: {
        f1: stats?.f1 || 0,
        f2: stats?.f2 || 0,
        both: stats?.both || 0,
      }
    };
  } catch (error) {
    console.error("Database error:", error);
    return { 
      total: 0, 
      active: 0, 
      broken: 0, 
      pending: 0, 
      categories: { computer: 0, printer: 0, monitor: 0, network: 0, other: 0 },
      factories: { f1: 0, f2: 0, both: 0 }
    };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statusCards = [
    {
      title: "ใช้งานปกติ",
      value: stats.active,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-50",
      href: "/dashboard/assets?status=active"
    },
    {
      title: "ชำรุด",
      value: stats.broken,
      icon: AlertTriangle,
      color: "text-rose-500",
      bgColor: "bg-rose-50",
      href: "/dashboard/assets?status=broken"
    },
    {
      title: "รอลงทะเบียน",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-500",
      bgColor: "bg-amber-50",
      href: "/dashboard/assets?status=pending"
    }
  ];

  const categoryItems = [
    { label: "Computer", value: stats.categories.computer, icon: Laptop, color: "bg-blue-500", textColor: "text-blue-600" },
    { label: "Monitor", value: stats.categories.monitor, icon: Monitor, color: "bg-purple-500", textColor: "text-purple-600" },
    { label: "Printer", value: stats.categories.printer, icon: Printer, color: "bg-orange-500", textColor: "text-orange-600" },
    { label: "Network", value: stats.categories.network, icon: Network, color: "bg-cyan-500", textColor: "text-cyan-600" },
    { label: "อื่นๆ", value: stats.categories.other, icon: MoreHorizontal, color: "bg-slate-400", textColor: "text-slate-600" },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-10">
      <div className="max-w-lg mx-auto">
        
        {/* Header - Compact */}
        <div className="bg-white px-6 py-8 border-b border-zinc-100 rounded-b-[2.5rem] shadow-sm">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
              <h1 className="text-3xl font-[1000] tracking-tighter text-zinc-900 leading-none uppercase">
                DASH<span className="text-indigo-600">BOARD</span>
              </h1>
              <p className="text-zinc-400 font-black uppercase tracking-[0.3em] text-[8px]">MIS Asset Overview</p>
            </div>
            <div className="flex flex-col items-end">
               <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Total Assets</span>
               <span className="text-3xl font-[1000] text-zinc-900 leading-none tracking-tighter">{stats.total}</span>
            </div>
          </div>

          {/* Quick Actions / Categories Horizontal Scroll */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
            {categoryItems.map((item) => (
              <Link 
                key={item.label}
                href={`/dashboard/assets?category=${item.label.toLowerCase().includes('computer') ? 'computer' : item.label.toLowerCase()}`}
                className="flex-shrink-0 flex items-center gap-2 bg-zinc-50 border border-zinc-100 px-4 py-2.5 rounded-2xl active:scale-95 transition-all shadow-sm"
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

        <div className="px-5 py-6 space-y-6">
          
          {/* Status Grid - 3 Columns (Fits on one row) */}
          <div className="grid grid-cols-3 gap-3">
            {statusCards.map((card) => (
              <Link key={card.title} href={card.href} className="group active:scale-95 transition-transform">
                <div className="bg-white p-4 rounded-[1.8rem] shadow-sm border border-white flex flex-col items-center text-center gap-2 h-full">
                  <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner", card.bgColor)}>
                    <card.icon className={card.color} size={20} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-2xl font-[1000] text-zinc-900 leading-none tracking-tighter">{card.value}</p>
                    <p className="text-[8px] font-black uppercase tracking-tighter text-zinc-400 leading-tight">{card.title}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Featured Action Card - Compact */}
          <Link href="/dashboard/assets?filter=incomplete">
            <div className="relative group active:scale-[0.98] transition-all overflow-hidden rounded-[2.2rem] bg-zinc-900 shadow-xl p-[2px]">
               <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 opacity-80" />
               <div className="relative bg-white/95 rounded-[2.1rem] p-6 flex items-center justify-between overflow-hidden">
                 <Package className="absolute -right-6 -bottom-6 w-32 h-32 text-zinc-100/50 -rotate-12" />
                 <div className="relative z-10 flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                       <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                       <h3 className="text-lg font-[1000] text-zinc-900 tracking-tight">DATA INTEGRITY</h3>
                    </div>
                    <p className="text-[10px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tighter">ตรวจสอบและเติมข้อมูลเครื่องที่ยังไม่สมบูรณ์</p>
                 </div>
                 <div className="relative z-10 bg-zinc-900 text-white p-3 rounded-2xl shadow-lg">
                    <ArrowRight size={18} strokeWidth={3} />
                 </div>
               </div>
            </div>
          </Link>

          {/* Category Progress - Density Refinement */}
          <div className="bg-white rounded-[2.2rem] p-7 shadow-sm border border-zinc-100">
            <h3 className="text-xs font-black text-zinc-900 mb-6 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
              Category Insights
            </h3>
            <div className="space-y-5">
              {categoryItems.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-xl bg-opacity-10 shadow-sm bg-white border border-zinc-50", item.textColor)}>
                        <item.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-[11px] font-black text-zinc-700 uppercase tracking-tight">{item.label}</span>
                    </div>
                    <span className="text-xs font-[1000] text-zinc-900">{item.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-50 rounded-full overflow-hidden border border-zinc-100/50">
                    <div 
                      className={cn("h-full transition-all duration-1000", item.color)} 
                      style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* New: Visual Status Distribution (Donut Chart) */}
          <div className="bg-white rounded-[2.2rem] p-8 shadow-sm border border-zinc-100 overflow-hidden">
            <h3 className="text-xs font-black text-zinc-900 mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
              Status Overview
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center gap-10">
              {/* SVG Donut Chart */}
              <div className="relative w-36 h-36 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="16" fill="none" className="stroke-zinc-50" strokeWidth="4" />
                  {(() => {
                    let offset = 0;
                    const statusConfig = [
                      { key: 'active', value: stats.active, color: '#10b981' }, // emerald-500
                      { key: 'broken', value: stats.broken, color: '#f43f5e' }, // rose-500
                      { key: 'pending', value: stats.pending, color: '#f59e0b' }, // amber-500
                      { key: 'retired', value: 0, color: '#71717a' }, // Placeholder for retired if needed
                    ];
                    
                    return statusConfig.map(s => {
                      if (s.value === 0 || stats.total === 0) return null;
                      const percentage = (s.value / stats.total) * 100;
                      const strokeDasharray = `${percentage} ${100 - percentage}`;
                      const currentOffset = offset;
                      offset += percentage;
                      
                      return (
                        <circle 
                          key={s.key}
                          cx="18" cy="18" r="16" fill="none" 
                          stroke={s.color} strokeWidth="4" 
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={-currentOffset}
                          className="transition-all duration-1000 ease-out"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-[1000] text-zinc-900 leading-none">{stats.total}</span>
                  <span className="text-[8px] font-black text-zinc-400 uppercase tracking-tighter mt-1">Items</span>
                </div>
              </div>

              {/* Legend */}
              <div className="flex-1 w-full space-y-3">
                {[
                  { label: 'ใช้งานปกติ', value: stats.active, color: 'bg-emerald-500', sub: 'Healthy' },
                  { label: 'ชำรุด/เสียหาย', value: stats.broken, color: 'bg-rose-500', sub: 'Needs Repair' },
                  { label: 'รอลงทะเบียน', value: stats.pending, color: 'bg-amber-500', sub: 'Processing' }
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full shadow-sm", item.color)} />
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-zinc-700 leading-none">{item.label}</span>
                        <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tight mt-0.5">{item.sub}</span>
                      </div>
                    </div>
                    <div className="flex items-baseline gap-1">
                       <span className="text-xs font-black text-zinc-900">{item.value}</span>
                       <span className="text-[9px] font-bold text-zinc-300">({stats.total > 0 ? ((item.value / stats.total) * 100).toFixed(0) : 0}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* New: Factory Distribution Progress Bars */}
          <div className="bg-white rounded-[2.2rem] p-8 shadow-sm border border-zinc-100">
            <h3 className="text-xs font-black text-zinc-900 mb-8 uppercase tracking-[0.2em] flex items-center gap-2">
              <div className="w-1.5 h-4 bg-purple-500 rounded-full" />
              Factory Distribution
            </h3>
            
            <div className="space-y-6">
              {[
                { label: 'โรงงาน 1', value: stats.factories.f1, color: 'from-blue-500 to-indigo-600' },
                { label: 'โรงงาน 2', value: stats.factories.f2, color: 'from-purple-500 to-pink-600' },
                { label: 'ทั้ง 2 โรงงาน', value: stats.factories.both, color: 'from-amber-400 to-orange-500' }
              ].map((f) => {
                if (f.value === 0 && stats.total > 0) return null;
                const percentage = stats.total > 0 ? (f.value / stats.total) * 100 : 0;
                return (
                  <div key={f.label} className="space-y-2">
                    <div className="flex justify-between items-end px-1">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{f.label}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-black text-zinc-900">{f.value}</span>
                        <span className="text-[9px] font-bold text-zinc-300">({percentage.toFixed(0)}%)</span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-zinc-50 rounded-full overflow-hidden border border-zinc-100/50 p-[1px]">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r shadow-sm", f.color)} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center px-10 pb-4">
           <p className="text-[8px] font-black text-zinc-300 uppercase tracking-[0.4em]">MIS Management Portal v1.0</p>
        </div>
      </div>
    </div>
  );
}
