"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { 
  Table, 
  TableBody,
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trash2, 
  ArrowLeft, 
  Loader2,
  Search,
  X,
  Factory,
  History,
  TrendingDown,
  DollarSign,
  Package
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface RetiredAsset {
  id: string;
  assetCode: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  factory: string | null;
  status: string;
  deletedAt: string | null;
  disposalReason: string | null;
  disposalMethod: string | null;
  disposalValue: string | null;
  disposalAuthorizedBy: string | null;
}

function RetiredAssetsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const queryParam = searchParams.get("q") || "";
  const [assets, setAssets] = useState<RetiredAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    totalValue: 0,
    topReason: "-",
  });

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.append("status", "retired");
      sp.append("includeDeleted", "true");
      if (queryParam) sp.append("q", queryParam);
      
      const res = await fetch(`/api/assets?${sp.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      
      const data: RetiredAsset[] = await res.json();
      setAssets(data);

      // Calculate Stats
      const totalValue = data.reduce((acc, curr) => acc + (parseFloat(curr.disposalValue || "0")), 0);
      
      const reasons: Record<string, number> = {};
      data.forEach(a => {
        if (a.disposalReason) {
          reasons[a.disposalReason] = (reasons[a.disposalReason] || 0) + 1;
        }
      });
      const topReason = Object.entries(reasons).sort((a, b) => b[1] - a[1])[0]?.[0] || "-";

      setStats({
        total: data.length,
        totalValue,
        topReason,
      });

    } catch (err) {
      toast.error("ไม่สามารถโหลดข้อมูลอุปกรณ์ที่จำหน่ายออกได้");
    } finally {
      setLoading(false);
    }
  }, [queryParam]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== queryParam) {
        const params = new URLSearchParams(window.location.search);
        if (searchQuery) params.set("q", searchQuery); else params.delete("q");
        router.push(`/dashboard/assets/retired?${params.toString()}`);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, router, queryParam]);

  return (
    <div className="container mx-auto p-6 space-y-8 relative pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/assets">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-100">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
              <History className="h-10 w-10 text-rose-600" />
              สรุปการจำหน่ายออก
            </h1>
          </div>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] ml-11">Disposal & Archive Management</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-zinc-50 rounded-3xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <Package className="h-6 w-6 text-zinc-400" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">จำนวนทั้งหมด</p>
              <h3 className="text-2xl font-black text-zinc-900">{stats.total} <span className="text-sm font-bold text-zinc-400">รายการ</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-zinc-50 rounded-3xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <DollarSign className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">มูลค่ารวมที่จำหน่าย</p>
              <h3 className="text-2xl font-black text-zinc-900">{stats.totalValue.toLocaleString()} <span className="text-sm font-bold text-zinc-400">บาท</span></h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-zinc-50 rounded-3xl overflow-hidden">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <TrendingDown className="h-6 w-6 text-rose-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">สาเหตุหลัก</p>
              <h3 className="text-xl font-black text-zinc-900 truncate max-w-[150px]">{stats.topReason}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <input
          type="text"
          placeholder="ค้นหาประวัติ..."
          className="w-full pl-12 pr-12 h-12 bg-white border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-zinc-100 outline-none font-bold text-zinc-900 placeholder:text-zinc-300 transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded-full text-zinc-400"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] shadow-xl border border-zinc-100 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-rose-600" />
          </div>
        ) : assets.length === 0 ? (
          <div className="py-20 text-center text-zinc-300 italic font-medium">
            ไม่พบประวัติการจำหน่ายออก
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-zinc-50 hover:bg-transparent bg-zinc-900">
                  <TableHead className="font-black text-white/60 uppercase tracking-widest text-[10px] h-12 pl-6">Asset Code</TableHead>
                  <TableHead className="font-black text-white/60 uppercase tracking-widest text-[10px] h-12">อุปกรณ์</TableHead>
                  <TableHead className="font-black text-white/60 uppercase tracking-widest text-[10px] h-12">วันที่จำหน่าย</TableHead>
                  <TableHead className="font-black text-white/60 uppercase tracking-widest text-[10px] h-12">สาเหตุ</TableHead>
                  <TableHead className="font-black text-white/60 uppercase tracking-widest text-[10px] h-12">วิธี/มูลค่า</TableHead>
                  <TableHead className="font-black text-white/60 uppercase tracking-widest text-[10px] h-12 pr-6 text-right">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-zinc-50 transition-colors border-b border-zinc-50 h-20">
                    <TableCell className="pl-6">
                      <div className="font-mono font-black text-zinc-900 bg-zinc-100 px-3 py-1.5 rounded-lg border border-zinc-200 inline-block">
                        {asset.assetCode || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-black text-zinc-900 uppercase text-xs">{asset.category}</span>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{asset.brand} {asset.model}</span>
                        <div className="flex items-center gap-1 mt-1 text-[9px] font-black text-zinc-300">
                          <Factory className="h-3 w-3" />
                          {asset.factory}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-bold text-zinc-600">
                        {asset.deletedAt ? new Date(asset.deletedAt).toLocaleDateString("th-TH") : "-"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[10px] rounded-lg">
                        {asset.disposalReason || "ไม่ระบุ"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-zinc-900">{asset.disposalMethod || "-"}</span>
                        <span className="text-xs font-black text-emerald-600">
                          {asset.disposalValue ? `${parseFloat(asset.disposalValue).toLocaleString()} ฿` : "-"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Link href={`/dashboard/assets/${asset.id}`}>
                        <Button variant="ghost" size="sm" className="font-black text-[10px] uppercase tracking-widest text-zinc-400 hover:text-zinc-900">
                          ดูรายละเอียด
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <div className="text-center pt-8">
        <p className="text-[10px] text-zinc-300 uppercase tracking-[0.3em] font-black">
          Development History • MIS Division
        </p>
      </div>
    </div>
  );
}

export default function RetiredAssetsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-zinc-300" /></div>}>
      <RetiredAssetsList />
    </Suspense>
  );
}
