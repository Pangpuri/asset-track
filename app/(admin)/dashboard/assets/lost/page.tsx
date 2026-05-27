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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Loader2,
  Search,
  X,
  Factory,
  Ghost,
  Calendar,
  User,
  AlertOctagon,
  History
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

interface LostAsset {
  id: string;
  assetCode: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  factory: string | null;
  status: string;
  receivedBy: string | null;
  deletedAt: string | null;
  lostDate: string | null;
  lostNotes: string | null;
}

function LostAssetsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const queryParam = searchParams.get("q") || "";
  const [assets, setAssets] = useState<LostAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  
  // Stats
  const [stats, setStats] = useState({
    total: 0,
    lastMonth: 0,
  });

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.append("status", "lost");
      sp.append("includeDeleted", "true");
      if (queryParam) sp.append("q", queryParam);
      
      const res = await fetch(`/api/assets?${sp.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      
      const data: LostAsset[] = await res.json();
      setAssets(data);

      // Calculate Stats
      const now = new Date();
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const lastMonthCount = data.filter(a => a.lostDate && new Date(a.lostDate) > oneMonthAgo).length;

      setStats({
        total: data.length,
        lastMonth: lastMonthCount,
      });

    } catch (err) {
      toast.error("ไม่สามารถโหลดข้อมูลอุปกรณ์ที่สูญหายได้");
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
        router.push(`/dashboard/assets/lost?${params.toString()}`);
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
              <Ghost className="h-10 w-10 text-amber-600" />
              สรุปอุปกรณ์สูญหาย
            </h1>
          </div>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] ml-11">Lost & Missing Asset Investigation</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-zinc-900 rounded-[2rem] overflow-hidden text-white">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">ยอดรวมสูญหายทั้งหมด</p>
              <h3 className="text-4xl font-black">{stats.total} <span className="text-sm font-bold text-white/40">รายการ</span></h3>
            </div>
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center">
              <AlertOctagon className="h-8 w-8 text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-amber-50 rounded-[2rem] overflow-hidden">
          <CardContent className="p-8 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-amber-600/60 uppercase tracking-widest mb-1">หายในรอบ 30 วันล่าสุด</p>
              <h3 className="text-4xl font-black text-amber-900">{stats.lastMonth} <span className="text-sm font-bold text-amber-600/40">รายการ</span></h3>
            </div>
            <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm">
              <Calendar className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <input
          type="text"
          placeholder="ค้นหาประวัติการสูญหาย..."
          className="w-full pl-12 pr-12 h-12 bg-white border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-amber-100 outline-none font-bold text-zinc-900 placeholder:text-zinc-300 transition-all shadow-sm"
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
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-600" />
          </div>
        ) : assets.length === 0 ? (
          <div className="py-20 text-center text-zinc-300 italic font-medium">
            ไม่พบประวัติอุปกรณ์สูญหาย
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-zinc-50 hover:bg-transparent bg-zinc-900">
                  <TableHead className="font-black text-white/60 uppercase tracking-widest text-[10px] h-12 pl-6">Asset Code</TableHead>
                  <TableHead className="font-black text-white/60 uppercase tracking-widest text-[10px] h-12">อุปกรณ์</TableHead>
                  <TableHead className="font-black text-white/60 uppercase tracking-widest text-[10px] h-12">วันที่ทราบ/หาย</TableHead>
                  <TableHead className="font-black text-white/60 uppercase tracking-widest text-[10px] h-12">ผู้รับผิดชอบล่าสุด</TableHead>
                  <TableHead className="font-black text-white/60 uppercase tracking-widest text-[10px] h-12 pr-6 text-right">รายละเอียด</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-amber-50/30 transition-colors border-b border-zinc-50 h-20">
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
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-amber-600">
                          {asset.lostDate ? new Date(asset.lostDate).toLocaleDateString("th-TH") : "ไม่ระบุ"}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase">Found missing</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-zinc-100 rounded-full flex items-center justify-center shrink-0">
                            <User className="h-4 w-4 text-zinc-400" />
                        </div>
                        <span className="text-xs font-black text-zinc-900">{asset.receivedBy || "ไม่ระบุ"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      <Link href={`/dashboard/assets/${asset.id}`}>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-zinc-400 hover:text-amber-600">
                          <History className="h-5 w-5" />
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
          Internal Investigation • MIS Security
        </p>
      </div>
    </div>
  );
}

export default function LostAssetsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-zinc-300" /></div>}>
      <LostAssetsList />
    </Suspense>
  );
}
