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
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";

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
      }
    };
  } catch (error) {
    console.error("Database error:", error);
    return { 
      total: 0, 
      active: 0, 
      broken: 0, 
      pending: 0, 
      categories: { computer: 0, printer: 0, monitor: 0, network: 0, other: 0 } 
    };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  const statusCards = [
    {
      title: "ใช้งานปกติ (Active)",
      value: stats.active,
      icon: CheckCircle2,
      color: "text-emerald-600",
      borderColor: "border-zinc-200",
      gradient: "from-white to-white",
      href: "/dashboard/assets?status=active"
    },
    {
      title: "ชำรุด/เสียหาย",
      value: stats.broken,
      icon: AlertTriangle,
      color: "text-rose-600",
      borderColor: "border-zinc-200",
      gradient: "from-white to-white",
      href: "/dashboard/assets?status=broken"
    },
    {
      title: "รอลงทะเบียน",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-600",
      borderColor: "border-zinc-200",
      gradient: "from-white to-white",
      href: "/dashboard/assets?status=pending"
    }
  ];

  const categoryItems = [
    { label: "Computer / Laptop", value: stats.categories.computer, icon: Laptop, color: "bg-blue-500" },
    { label: "Monitor", value: stats.categories.monitor, icon: Monitor, color: "bg-purple-500" },
    { label: "Printer", value: stats.categories.printer, icon: Printer, color: "bg-orange-500" },
    { label: "Network", value: stats.categories.network, icon: Network, color: "bg-cyan-500" },
    { label: "อื่นๆ", value: stats.categories.other, icon: MoreHorizontal, color: "bg-slate-400" },
  ];

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-black rounded-xl">
                <LayoutDashboard className="h-7 w-7 text-white" />
              </div>
              Dashboard
            </h1>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] ml-1">IT Asset Management System</p>
          </div>
          
          <div className="bg-white px-6 py-3 rounded-2xl border border-zinc-200 shadow-sm flex items-center gap-4">
            <div className="p-2 bg-zinc-100 rounded-lg">
              <Package className="h-5 w-5 text-zinc-900" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-none">ทั้งหมด</p>
              <p className="text-xl font-black text-zinc-900 leading-tight">{stats.total} <span className="text-xs font-bold text-zinc-300">รายการ</span></p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Status Column (Left/Top) */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            {statusCards.map((card) => (
              <Link key={card.title} href={card.href} className="group">
                <div className={`h-full p-6 bg-white border border-zinc-200 rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300`}>
                  <div className={`w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <card.icon className={`${card.color}`} size={24} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{card.title}</p>
                  <h2 className="text-4xl font-black text-slate-900">{card.value}</h2>
                </div>
              </Link>
            ))}

            {/* Summary Statistics Card with IG Border */}
            <div className="md:col-span-3 p-[2px] rounded-[2.5rem] bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-lg shadow-pink-500/10">
              <div className="p-8 bg-white rounded-[2.4rem] overflow-hidden relative group">
                <Package className="absolute -right-8 -bottom-8 w-64 h-64 text-zinc-100 rotate-12" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-zinc-900">ความสมบูรณ์ของข้อมูล</h3>
                    <p className="text-zinc-500 text-sm max-w-md">ตรวจสอบข้อมูลทรัพย์สินเพื่อให้ระบบรายงานผลได้อย่างแม่นยำ</p>
                  </div>
                  <Link href="/dashboard/assets?filter=incomplete">
                    <button className="px-8 h-12 bg-zinc-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-black transition-colors">
                      ตรวจสอบข้อมูล
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Category Distribution (Right) */}
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
              แยกตามหมวดหมู่
            </h3>
            <div className="space-y-6">
              {categoryItems.map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${item.color} bg-opacity-10 rounded-lg`}>
                        <item.icon className="h-4 w-4" style={{ color: item.color.replace('bg-', '') }} />
                      </div>
                      <span className="text-sm font-bold text-slate-700">{item.label}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{item.value}</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${item.color} transition-all duration-1000`} 
                      style={{ width: `${stats.total > 0 ? (item.value / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}