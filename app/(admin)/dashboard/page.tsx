import { db } from "@/db";
import { assets } from "@/db/schema";
import { sql } from "drizzle-orm";
import { 
  LayoutDashboard, 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  Clock
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
    }).from(assets);

    return {
      total: stats?.total || 0,
      active: stats?.active || 0,
      broken: stats?.broken || 0,
      pending: stats?.pending || 0,
    };
  } catch (error) {
    console.error("Database error:", error);
    return { total: 0, active: 0, broken: 0, pending: 0 };
  }
}

export default async function DashboardPage() {
  const stats = await getStats();

  const cards = [
    {
      title: "อุปกรณ์ทั้งหมด",
      value: stats.total,
      icon: Package,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      href: "/dashboard/assets"
    },
    {
      title: "ใช้งานปกติ",
      value: stats.active,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      href: "/dashboard/assets?status=active"
    },
    {
      title: "ชำรุด/เสียหาย",
      value: stats.broken,
      icon: AlertTriangle,
      color: "text-rose-600",
      bg: "bg-rose-50",
      href: "/dashboard/assets?status=broken"
    },
    {
      title: "รอลงทะเบียน",
      value: stats.pending,
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/dashboard/assets?status=pending"
    }
  ];

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="space-y-1">
        <h1 className="text-3xl font-black tracking-tight text-black flex items-center gap-3">
          <LayoutDashboard className="h-8 w-8" />
          Dashboard
        </h1>
        <p className="text-gray-500 font-medium">ภาพรวมระบบจัดการทรัพย์สินและอุปกรณ์</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <div className="p-6 bg-white border border-gray-100 rounded-[2rem] hover:shadow-xl hover:shadow-indigo-500/5 transition-all group">
              <div className={`w-12 h-12 ${card.bg} ${card.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <card.icon size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{card.title}</p>
              <h2 className="text-3xl font-black text-black">{card.value}</h2>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}