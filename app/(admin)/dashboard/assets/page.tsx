import { db } from "@/db";
import { assets } from "@/db/schema/assets";
import { desc, eq, or, isNull, and } from "drizzle-orm";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Package, QrCode, AlertTriangle, Filter } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateAssetQRCode } from "@/lib/qr";
import { QRPrintWrapper } from "@/components/qr-print-wrapper";

export const dynamic = "force-dynamic";

async function getAssets(filter?: string, status?: string) {
  let query = db.select().from(assets);
  
  const conditions = [];
  
  if (filter === "incomplete") {
    conditions.push(
      and(
        eq(assets.status, "active"),
        or(
          isNull(assets.serialNumber),
          isNull(assets.brand),
          isNull(assets.location)
        )
      )
    );
  }

  if (status) {
    conditions.push(eq(assets.status, status as any));
  }

  // @ts-ignore
  if (conditions.length > 0) {
    // @ts-ignore
    query = query.where(and(...conditions));
  }

  const rawAssets = await query.orderBy(desc(assets.createdAt));
  
  // ดึง QR Data สำหรับทุก Asset
  const allAssets = await Promise.all(rawAssets.map(async (asset) => ({
    ...asset,
    qrData: await generateAssetQRCode(asset.id),
    isIncomplete: asset.status === 'active' && (!asset.serialNumber || !asset.brand || !asset.location)
  })));
  
  return allAssets;
}

export default async function AssetsPage({ 
  searchParams 
}: { 
  searchParams: { filter?: string, status?: string } 
}) {
  const { filter, status } = await searchParams;
  const allAssets = await getAssets(filter, status);

  return (
    <div className="container mx-auto p-6 space-y-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-indigo-950 flex items-center gap-3">
            <Package className="h-10 w-10 text-indigo-600" />
            คลังอุปกรณ์
          </h1>
          <p className="text-indigo-600/60 font-medium ml-1">จัดการข้อมูลทางกายภาพและสติกเกอร์ QR Code</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/assets/print-qr">
            <Button variant="outline" className="h-12 gap-3 border-indigo-200 text-indigo-700 bg-white/50 hover:bg-indigo-50 neo-button rounded-2xl">
              <QrCode className="h-5 w-5" /> พิมพ์ QR ชุดใหญ่
            </Button>
          </Link>
          <Link href="/dashboard/assets/new">
            <Button className="h-12 gap-3 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 neo-button rounded-2xl">
              <Plus className="h-5 w-5" /> เพิ่มอุปกรณ์ใหม่
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between bg-white/40 backdrop-blur-sm p-2 rounded-2xl border border-white/20 shadow-sm">
        <div className="flex gap-2 items-center text-sm px-2">
          <Filter className="h-4 w-4 text-indigo-400" />
          <span className="text-indigo-900/60 font-bold uppercase tracking-wider text-[10px]">ตัวกรอง:</span>
          <div className="flex gap-1 ml-2">
            <Link href="/dashboard/assets">
              <Button variant={!filter && !status ? "secondary" : "ghost"} size="sm" className="h-9 rounded-xl px-4 font-bold">ทั้งหมด</Button>
            </Link>
            <Link href="/dashboard/assets?filter=incomplete">
              <Button variant={filter === "incomplete" ? "secondary" : "ghost"} size="sm" className={`h-9 rounded-xl px-4 font-bold ${filter === "incomplete" ? 'bg-rose-100 text-rose-700' : 'text-rose-600'}`}>ข้อมูลไม่สมบูรณ์</Button>
            </Link>
            <Link href="/dashboard/assets?status=pending">
              <Button variant={status === "pending" ? "secondary" : "ghost"} size="sm" className={`h-9 rounded-xl px-4 font-bold ${status === "pending" ? 'bg-amber-100 text-amber-700' : 'text-amber-600'}`}>รอลงทะเบียน</Button>
            </Link>
          </div>
        </div>
        <div className="text-[10px] font-black text-indigo-300 pr-4 uppercase tracking-widest">
          {allAssets.length} ITEMS FOUND
        </div>
      </div>

      <Card className="glass-card border-none shadow-2xl rounded-[2rem] overflow-hidden">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-indigo-50/50 border-none h-16">
                <TableHead className="font-black text-indigo-900/40 uppercase tracking-widest text-[10px] pl-8">Asset Code</TableHead>
                <TableHead className="font-black text-indigo-900/40 uppercase tracking-widest text-[10px]">ประเภท/ยี่ห้อ</TableHead>
                <TableHead className="font-black text-indigo-900/40 uppercase tracking-widest text-[10px]">สถานที่ติดตั้ง</TableHead>
                <TableHead className="font-black text-indigo-900/40 uppercase tracking-widest text-[10px]">สถานะ</TableHead>
                <TableHead className="text-right font-black text-indigo-900/40 uppercase tracking-widest text-[10px] pr-8">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-20 text-indigo-300 italic font-medium">
                    {filter === "incomplete" ? "ไม่พบอุปกรณ์ที่ข้อมูลไม่สมบูรณ์" : "ยังไม่มีข้อมูลอุปกรณ์ในระบบ"}
                  </TableCell>
                </TableRow>
              ) : (
                allAssets.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-indigo-50/30 transition-colors border-indigo-100/30 h-20">
                    <TableCell className="font-mono font-black pl-8">
                      {asset.assetCode ? (
                        <span className="text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm">{asset.assetCode}</span>
                      ) : (
                        <Badge variant="outline" className="opacity-40 border-dashed text-[10px] font-black tracking-widest">PENDING</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-indigo-950 capitalize">{asset.category || "-"}</span>
                          {asset.isIncomplete && (
                            <div className="bg-rose-500 w-2 h-2 rounded-full animate-ping" title="ข้อมูลไม่สมบูรณ์" />
                          )}
                        </div>
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-tight">{asset.brand} {asset.model}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-bold text-indigo-900/70">{asset.location || "-"}</TableCell>
                    <TableCell>
                      <Badge className={`border-none font-black text-[10px] px-3 py-1 rounded-full shadow-sm ${
                        asset.status === 'active' ? 'bg-emerald-500 text-white' : 
                        asset.status === 'broken' ? 'bg-rose-500 text-white' : 
                        asset.status === 'pending' ? 'bg-amber-500 text-white' : 'bg-indigo-200 text-indigo-700'
                      }`}>
                        {asset.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                      <div className="flex justify-end gap-3">
                        <QRPrintWrapper qrData={asset.qrData} assetCode={asset.assetCode || "NEW-QR"} />
                        <Link href={`/dashboard/assets/${asset.id}`}>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-white border border-indigo-100 shadow-sm text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all duration-300">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="text-center pt-8 pb-4">
        <p className="text-[10px] text-indigo-300 uppercase tracking-[0.3em] font-black">
          พัฒนาโดยฝ่าย MIS
        </p>
      </div>
    </div>
  );
}
