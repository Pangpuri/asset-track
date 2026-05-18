"use client";

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
import { Plus, Edit2, Package, QrCode, AlertTriangle, Filter, Trash2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateAssetQRCode } from "@/lib/qr";
import { QRPrintWrapper } from "@/components/qr-print-wrapper";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BulkPrintSelected } from "@/components/bulk-print-selected";
import { useRouter } from "next/navigation";

interface Asset {
  id: string;
  assetCode: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  location: string | null;
  status: string;
  qrData: string;
  isIncomplete: boolean;
}

export default function AssetsPage({ 
  searchParams 
}: { 
  searchParams: { filter?: string, status?: string } 
}) {
  const router = useRouter();
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // โหลดข้อมูลผ่าน Client Side เพื่อให้รองรับการ Interact (Delete/Select)
  const fetchAssets = async () => {
    try {
      const sp = new URLSearchParams();
      if (searchParams.filter) sp.append("filter", searchParams.filter);
      if (searchParams.status) sp.append("status", searchParams.status);
      
      const res = await fetch(`/api/assets?${sp.toString()}`);
      if (res.ok) {
        const data = await res.json();
        // เพิ่มข้อมูล QR และ Check Incomplete
        const enriched = await Promise.all(data.map(async (a: any) => ({
          ...a,
          qrData: await generateAssetQRCode(a.id),
          isIncomplete: a.status === 'active' && (!a.serialNumber || !a.brand || !a.location)
        })));
        setAllAssets(enriched);
      }
    } catch (err) {
      toast.error("ไม่สามารถโหลดข้อมูลอุปกรณ์ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [searchParams.filter, searchParams.status]);

  const handleDelete = async (id: string, code: string | null) => {
    if (!confirm(`คุณต้องการลบอุปกรณ์ ${code || id.substring(0,8)} ใช่หรือไม่? ประวัติทั้งหมดจะถูกลบไปด้วย`)) return;
    
    try {
      const res = await fetch(`/api/assets/${id}?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("ลบข้อมูลเรียบร้อยแล้ว");
        fetchAssets();
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("ไม่สามารถลบข้อมูลได้");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedAssetsForPrint = allAssets
    .filter(a => selectedIds.includes(a.id))
    .map(a => ({ id: a.id, assetCode: a.assetCode, qrData: a.qrData }));

  return (
    <div className="container mx-auto p-6 space-y-8 relative">
      {!loading && allAssets.length === 0 && !searchParams.filter && !searchParams.status && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl flex items-center gap-3 mb-4 text-sm font-bold">
          <AlertTriangle className="h-5 w-5" />
          ไม่พบข้อมูลอุปกรณ์ในระบบ
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-indigo-950 flex items-center gap-3">
            <Package className="h-10 w-10 text-indigo-600" />
            คลังอุปกรณ์
          </h1>
          <p className="text-indigo-600/60 font-medium ml-1">จัดการข้อมูลและสั่งพิมพ์ QR Code แบบกลุ่ม</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/assets/print-qr">
            <Button variant="outline" className="h-12 gap-2 border-indigo-200 text-indigo-700 bg-white/50 hover:bg-indigo-50 neo-button rounded-2xl">
              <QrCode className="h-5 w-5" /> สร้าง QR เปล่า
            </Button>
          </Link>
          <Link href="/dashboard/assets/new">
            <Button className="h-12 gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 neo-button rounded-2xl">
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
              <Button variant={!searchParams.filter && !searchParams.status ? "secondary" : "ghost"} size="sm" className="h-9 rounded-xl px-4 font-bold">ทั้งหมด</Button>
            </Link>
            <Link href="/dashboard/assets?filter=incomplete">
              <Button variant={searchParams.filter === "incomplete" ? "secondary" : "ghost"} size="sm" className={`h-9 rounded-xl px-4 font-bold ${searchParams.filter === "incomplete" ? 'bg-rose-100 text-rose-700' : 'text-rose-600'}`}>ข้อมูลไม่สมบูรณ์</Button>
            </Link>
            <Link href="/dashboard/assets?status=pending">
              <Button variant={searchParams.status === "pending" ? "secondary" : "ghost"} size="sm" className={`h-9 rounded-xl px-4 font-bold ${searchParams.status === "pending" ? 'bg-amber-100 text-amber-700' : 'text-amber-600'}`}>รอลงทะเบียน</Button>
            </Link>
          </div>
        </div>
        <div className="text-[10px] font-black text-indigo-300 pr-4 uppercase tracking-widest">
          {loading ? "LOADING..." : `${allAssets.length} ITEMS FOUND`}
        </div>
      </div>

      <Card className="glass-card border-none shadow-2xl rounded-[2rem] overflow-hidden">
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-indigo-50/50 border-none h-16">
                <TableHead className="w-[50px] pl-6"></TableHead>
                <TableHead className="font-black text-indigo-900/40 uppercase tracking-widest text-[10px]">Asset Code</TableHead>
                <TableHead className="font-black text-indigo-900/40 uppercase tracking-widest text-[10px]">ประเภท/ยี่ห้อ</TableHead>
                <TableHead className="font-black text-indigo-900/40 uppercase tracking-widest text-[10px]">สถานที่ติดตั้ง</TableHead>
                <TableHead className="font-black text-indigo-900/40 uppercase tracking-widest text-[10px]">สถานะ</TableHead>
                <TableHead className="text-right font-black text-indigo-900/40 uppercase tracking-widest text-[10px] pr-8">การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
                  </TableCell>
                </TableRow>
              ) : allAssets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-indigo-300 italic font-medium">
                    ไม่พบข้อมูลอุปกรณ์
                  </TableCell>
                </TableRow>
              ) : (
                allAssets.map((asset) => (
                  <TableRow 
                    key={asset.id} 
                    className={`hover:bg-indigo-50/30 transition-colors border-indigo-100/30 h-20 ${selectedIds.includes(asset.id) ? 'bg-indigo-50/50' : ''}`}
                  >
                    <TableCell className="pl-6">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 rounded-full border-2 transition-all ${selectedIds.includes(asset.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-indigo-100 text-transparent hover:border-indigo-300'}`}
                        onClick={() => toggleSelect(asset.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="font-mono font-black">
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
                      <div className="flex justify-end gap-2">
                        <QRPrintWrapper qrData={asset.qrData} assetCode={asset.assetCode || "NEW-QR"} />
                        <Link href={`/dashboard/assets/${asset.id}`}>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-white border border-indigo-50 shadow-sm text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-9 w-9 rounded-xl bg-white border border-rose-50 shadow-sm text-rose-500 hover:bg-rose-600 hover:text-white transition-all"
                          onClick={() => handleDelete(asset.id, asset.assetCode)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bulk Print Overlay */}
      {selectedIds.length > 0 && (
        <BulkPrintSelected 
          selectedAssets={selectedAssetsForPrint} 
          onClear={() => setSelectedIds([])} 
        />
      )}

      <div className="text-center pt-8 pb-4">
        <p className="text-[10px] text-indigo-300 uppercase tracking-[0.3em] font-black">
          พัฒนาโดยฝ่าย MIS
        </p>
      </div>
    </div>
  );
}
