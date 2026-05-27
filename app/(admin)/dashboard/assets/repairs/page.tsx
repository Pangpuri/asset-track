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
  RefreshCw, 
  ArrowLeft, 
  Loader2,
  Search,
  X,
  Factory,
  Wrench,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  History
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";
import { AssetRepairDisposalDialog } from "@/components/asset-repair-disposal-dialog";

interface BrokenAsset {
  id: string;
  assetCode: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  location: string | null;
  factory: string | null;
  status: string;
  updatedAt: string | null;
}

function RepairsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const queryParam = searchParams.get("q") || "";
  const [assets, setAssets] = useState<BrokenAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  
  // Dialog State
  const [selectedAsset, setSelectedAsset] = useState<{id: string, code: string} | null>(null);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.append("status", "broken");
      if (queryParam) sp.append("q", queryParam);
      
      const res = await fetch(`/api/assets?${sp.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error();
      
      const data: BrokenAsset[] = await res.json();
      setAssets(data);
    } catch (err) {
      toast.error("ไม่สามารถโหลดข้อมูลอุปกรณ์ที่ชำรุดได้");
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
        router.push(`/dashboard/assets/repairs?${params.toString()}`);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery, router, queryParam]);

  const handleRepairSuccess = async (id: string, code: string | null) => {
    if (!confirm(`ยืนยันการซ่อมสำเร็จสำหรับเครื่อง ${code || id.substring(0,8)}? อุปกรณ์จะถูกปรับสถานะเป็น 'ใช้งานปกติ'`)) return;
    
    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "active" }),
      });

      if (!res.ok) throw new Error();
      
      toast.success("บันทึกการซ่อมสำเร็จเรียบร้อยแล้ว");
      fetchAssets();
    } catch (err) {
      toast.error("ไม่สามารถบันทึกข้อมูลได้");
    }
  };

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
              <Wrench className="h-10 w-10 text-orange-500" />
              จัดการการซ่อม
            </h1>
          </div>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] ml-11">Repair & Maintenance Workflow</p>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-orange-50 border border-orange-100 p-6 rounded-[2rem] flex items-center gap-6 shadow-sm">
        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm shrink-0">
          <AlertTriangle className="h-8 w-8 text-orange-500" />
        </div>
        <div>
          <h3 className="text-lg font-black text-orange-900 uppercase">ระบบจัดการเครื่องชำรุด</h3>
          <p className="text-sm font-bold text-orange-700/70 leading-relaxed">
            รายการอุปกรณ์ที่มีสถานะ "ชำรุด" ทั้งหมดจะแสดงที่นี่ เพื่อรอการตัดสินใจว่าจะ <span className="text-emerald-600 underline">ซ่อมเสร็จเพื่อนำกลับมาใช้</span> หรือ <span className="text-rose-600 underline">จำหน่ายออก (ซ่อมไม่ได้)</span>
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
        <input
          type="text"
          placeholder="ค้นหาเครื่องที่ชำรุด..."
          className="w-full pl-12 pr-12 h-12 bg-white border border-zinc-200 rounded-2xl focus:ring-4 focus:ring-orange-100 outline-none font-bold text-zinc-900 placeholder:text-zinc-300 transition-all shadow-sm"
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
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-orange-500" />
          </div>
        ) : assets.length === 0 ? (
          <div className="py-20 text-center text-zinc-300 italic font-medium space-y-4">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-zinc-200" />
            </div>
            <p>ไม่พบรายการอุปกรณ์ที่รอการซ่อม</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-zinc-50 hover:bg-transparent bg-zinc-900">
                  <TableHead className="font-black text-white/60 uppercase tracking-widest text-[10px] h-12 pl-6">Asset Code</TableHead>
                  <TableHead className="font-black text-white/60 uppercase tracking-widest text-[10px] h-12">อุปกรณ์</TableHead>
                  <TableHead className="font-black text-white/60 uppercase tracking-widest text-[10px] h-12">ชำรุดเมื่อ</TableHead>
                  <TableHead className="font-black text-white/60 uppercase tracking-widest text-[10px] h-12 pr-6 text-right">ดำเนินการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.map((asset) => (
                  <TableRow key={asset.id} className="hover:bg-zinc-50 transition-colors border-b border-zinc-50 h-24">
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
                          {asset.factory} | {asset.location}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg inline-block">
                        {asset.updatedAt ? new Date(asset.updatedAt).toLocaleDateString("th-TH") : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex justify-end gap-2">
                        <Button 
                            onClick={() => handleRepairSuccess(asset.id, asset.assetCode)}
                            className="bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100 rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-4 transition-all"
                        >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            ซ่อมสำเร็จ
                        </Button>
                        <Button 
                            onClick={() => setSelectedAsset({id: asset.id, code: asset.assetCode || "N/A"})}
                            className="bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-100 rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-4 transition-all"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            ซ่อมไม่ได้
                        </Button>
                        <Link href={`/dashboard/assets/${asset.id}`}>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-zinc-400">
                            <History className="h-5 w-5" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Disposal Dialog */}
      {selectedAsset && (
        <AssetRepairDisposalDialog 
          assetId={selectedAsset.id}
          assetCode={selectedAsset.code}
          onClose={() => setSelectedAsset(null)}
          onSuccess={() => fetchAssets()}
        />
      )}

      <div className="text-center pt-8">
        <p className="text-[10px] text-zinc-300 uppercase tracking-[0.3em] font-black">
          Maintenance & Reliability Division • MIS System
        </p>
      </div>
    </div>
  );
}

export default function RepairsPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-zinc-300" /></div>}>
      <RepairsList />
    </Suspense>
  );
}
