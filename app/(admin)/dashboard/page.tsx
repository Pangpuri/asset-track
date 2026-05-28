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
  User,
  PackagePlus
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
    { title: "Active", value: stats.active, icon: CheckCircle2, color: "text-emerald-400", bgColor: "bg-emerald-500/10", href: "/dashboard/assets?status=active" },
    { title: "Repairs", value: stats.broken, icon: AlertTriangle, color: "text-rose-400", bgColor: "bg-rose-500/10", href: "/dashboard/assets/repairs" },
    { title: "Pending", value: stats.pending, icon: Clock, color: "text-amber-400", bgColor: "bg-amber-500/10", href: "/dashboard/assets?status=pending" },
    { title: "Retired", value: stats.retired, icon: Trash2, color: "text-zinc-400", bgColor: "bg-zinc-500/10", href: "/dashboard/assets/retired" }
  ];

  const categoryItems = [
    { label: "Computer", value: stats.categories.computer, icon: Laptop, color: "bg-blue-500", textColor: "text-blue-400" },
    { label: "Monitor", value: stats.categories.monitor, icon: Monitor, color: "bg-purple-500", textColor: "text-purple-400" },
    { label: "Printer", value: stats.categories.printer, icon: Printer, color: "bg-orange-500", textColor: "text-orange-400" },
    { label: "Network", value: stats.categories.network, icon: Network, color: "bg-cyan-500", textColor: "text-cyan-400" },
    { label: "Other", value: stats.categories.other, icon: MoreHorizontal, color: "bg-zinc-500", textColor: "text-zinc-400" },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pb-20">
      <div className="max-w-lg mx-auto relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none" />

        {/* Header - Luxury Dark */}
        <div className="relative z-10 px-6 py-10">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1">
              <h1 className="text-4xl font-[1000] tracking-tighter text-white uppercase leading-none text-glow">
                DASH<span className="text-indigo-500">BOARD</span>
              </h1>
              <p className="text-white/20 font-black uppercase tracking-[0.4em] text-[8px]">Intelligence Unit</p>
            </div>
            <LogoutButton />
          </div>

          <div className="flex justify-between items-end mb-10">
            <div className="flex flex-col">
               <span className="text-[10px] font-black text-white/30 uppercase tracking-widest leading-none mb-1">Fleet Assets</span>
               <span className="text-5xl font-[1000] text-white leading-none tracking-tighter text-glow">{stats.total}</span>
            </div>
            <Link href="/dashboard/assets/new">
              <Button className="bg-white text-black hover:bg-zinc-200 rounded-2xl font-[1000] text-[10px] uppercase tracking-widest h-10 px-6 gap-2 transition-all active:scale-95">
                <PackagePlus size={14} strokeWidth={3} />
                New Entry
              </Button>
            </Link>
          </div>

          {/* Quick Stats Scroll */}
          <div className="flex gap-3 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
            {categoryItems.map((item) => (
              <Link 
                key={item.label}
                href={`/dashboard/assets?category=${item.label.toLowerCase()}`}
                className="flex-shrink-0 flex items-center gap-3 bg-white/5 border border-white/5 px-5 py-3 rounded-2xl active:scale-95 transition-all"
              >
                <div className={cn("p-1.5 rounded-lg bg-white/5", item.textColor)}>
                  <item.icon size={16} />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white leading-none">{item.value}</span>
                  <span className="text-[8px] font-bold text-white/30 uppercase tracking-tighter">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="px-6 space-y-8 relative z-10">
          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            {statusCards.map((card) => (
              <Link key={card.title} href={card.href} className="active:scale-95 transition-transform group">
                <div className="bg-white/5 backdrop-blur-xl p-6 rounded-[2.2rem] border border-white/5 flex flex-col gap-4 relative overflow-hidden">
                  <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center relative z-10", card.bgColor)}>
                    <card.icon className={card.color} size={20} />
                  </div>
                  <div className="relative z-10 space-y-0.5">
                    <p className="text-3xl font-[1000] text-white leading-none tracking-tighter">{card.value}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">{card.title}</p>
                  </div>
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500 text-white">
                    <card.icon size={64} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Featured Insights */}
          <Link href="/dashboard/assets?filter=incomplete">
            <div className="luxury-card p-8 relative overflow-hidden group active:scale-[0.98] transition-all">
               <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/10 via-transparent to-transparent opacity-50" />
               <div className="relative z-10 flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                       <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
                       <h3 className="text-xl font-[1000] text-white tracking-tight uppercase">Incomplete</h3>
                    </div>
                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                       พบ <span className="text-rose-400 font-black">{stats.incomplete}</span> อุปกรณ์ที่ข้อมูลไม่ครบถ้วน
                    </p>
                  </div>
                  <div className="bg-white text-black p-4 rounded-[1.5rem] shadow-2xl group-hover:translate-x-1 transition-transform">
                     <ArrowRight size={20} strokeWidth={3} />
                  </div>
               </div>
            </div>
          </Link>

          {/* Detailed Distribution */}
          <div className="luxury-card p-8 space-y-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 text-white/5 -rotate-12">
                <LayoutDashboard size={150} />
             </div>
             
             <h3 className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] flex items-center gap-3">
               <div className="h-[1px] w-4 bg-indigo-500" />
               Category Metrics
             </h3>
             
             <div className="space-y-6">
                {categoryItems.map((item) => (
                  <div key={item.label} className="space-y-3">
                    <div className="flex justify-between items-end px-1">
                       <div className="flex items-center gap-3">
                         <div className={cn("w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center", item.textColor)}>
                           <item.icon size={12} />
                         </div>
                         <span className="text-xs font-black text-white/70 uppercase tracking-widest">{item.label}</span>
                       </div>
                       <span className="text-sm font-black text-white">{item.value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                       <div 
                         className={cn("h-full transition-all duration-1000 rounded-full", item.color)} 
                         style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` }} 
                       />
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        <div className="pt-20 pb-10 text-center relative z-10">
           <p className="text-[8px] font-black text-white/10 uppercase tracking-[0.6em]">MIS Enterprise • Protocol v2.0</p>
        </div>
      </div>
    </div>
  );
}
