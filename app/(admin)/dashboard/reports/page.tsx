import { db } from "@/db";
import { assets } from "@/db/schema/assets";
import { services } from "@/db/schema/services";
import { sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileBarChart, PieChart, BarChart3, Package, Wrench, FileText, FileCode, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

async function getReportData() {
  try {
    const categoryStats = await db.select({
      category: assets.category,
      count: sql<number>`count(*)`,
    }).from(assets).groupBy(assets.category);

    const statusStats = await db.select({
      status: assets.status,
      count: sql<number>`count(*)`,
    }).from(assets).groupBy(assets.status);

    const serviceStats = await db.select({
      status: services.status,
      count: sql<number>`count(*)`,
    }).from(services).groupBy(services.status);

    return { categoryStats, statusStats, serviceStats };
  } catch (error) {
    console.error("Error in getReportData:", error);
    return { categoryStats: [], statusStats: [], serviceStats: [] };
  }
}

export default async function ReportsPage() {
  const { categoryStats, statusStats, serviceStats } = await getReportData();

  return (
    <div className="container mx-auto p-6 space-y-8 relative">
      {(categoryStats.length === 0 && statusStats.length === 0) && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3 mb-4">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm font-bold">ไม่สามารถโหลดข้อมูลรายงานได้ กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูล</p>
        </div>
      )}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileBarChart className="h-8 w-8 text-blue-600" />
            รายงานสรุปผล (Reports)
          </h1>
          <p className="text-muted-foreground">สรุปข้อมูลสถิติและส่งออกข้อมูลเพื่อนำไปใช้งานต่อ</p>
        </div>
        <div className="flex gap-2">
          <a href="/api/reports/export/csv">
            <Button variant="outline" size="sm" className="gap-2">
              <FileCode className="h-4 w-4 text-green-600" /> 
              CSV
            </Button>
          </a>
          <a href="/api/reports/export/html" target="_blank">
            <Button variant="outline" size="sm" className="gap-2 border-blue-200">
              <FileText className="h-4 w-4 text-blue-600" /> 
              HTML / Print PDF
            </Button>
          </a>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* รายงานแยกตามประเภท */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              จำนวนอุปกรณ์แยกตามประเภท
            </CardTitle>
            <CardDescription>สถิติรวมจากคลังอุปกรณ์ทั้งหมด</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {categoryStats.map((stat) => (
              <div key={stat.category} className="flex items-center justify-between border-b pb-2">
                <span className="capitalize font-medium">{stat.category}</span>
                <span className="text-xl font-bold">{stat.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* รายงานสถานะอุปกรณ์ */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-emerald-500" />
              สถานะอุปกรณ์ปัจจุบัน
            </CardTitle>
            <CardDescription>ตรวจสอบความพร้อมใช้งานของทรัพย์สิน</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {statusStats.map((stat) => (
              <div key={stat.status} className="flex items-center justify-between border-b pb-2">
                <span className="capitalize font-medium">{stat.status}</span>
                <span className="text-xl font-bold">{stat.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* รายงานสถานะงานซ่อม */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Wrench className="h-5 w-5 text-orange-500" />
              สรุปสถานะงานแจ้งซ่อม
            </CardTitle>
            <CardDescription>ข้อมูลการดำเนินงานของทีมเทคนิค</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {serviceStats.map((stat) => (
              <div key={stat.status} className="p-4 bg-slate-50 rounded-xl border">
                <p className="text-xs text-muted-foreground uppercase font-bold">{stat.status}</p>
                <p className="text-3xl font-black text-slate-900">{stat.count}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}