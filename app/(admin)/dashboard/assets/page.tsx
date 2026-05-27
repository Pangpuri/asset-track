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
import { 
  Plus, 
  Edit2, 
  Package, 
  QrCode, 
  AlertTriangle, 
  Filter, 
  Trash2, 
  CheckCircle2, 
  Loader2,
  Search,
  X,
  Factory
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { generateAssetQRCode } from "@/lib/qr";
import { QRPrintWrapper } from "@/components/qr-print-wrapper";
import { useEffect, useState, useCallback, useRef, Suspense } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BulkPrintSelected } from "@/components/bulk-print-selected";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface Asset {
  id: string;
  assetCode: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  location: string | null;
  serialNumber: string | null;
  factory: string | null;
  status: string;
  qrData: string;
  isIncomplete: boolean;
}

// สร้าง Type สำหรับข้อมูลที่ได้จาก API (ยังไม่มี qrData และ isIncomplete)
type RawAsset = Omit<Asset, "qrData" | "isIncomplete">;

function AssetsList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract params from hook for true reactivity
  const filterParam = searchParams.get("filter") || "";
  const statusParam = searchParams.get("status") || "";
  const categoryParam = searchParams.get("category") || "";
  const factoryParam = searchParams.get("factory") || "";
  const queryParam = searchParams.get("q") || "";

  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(queryParam);
  
  // Sync internal states when URL parameters change (Render-phase sync)
  // This is the recommended pattern in React 18+ to avoid cascading renders warning
  const currentParamsKey = `${filterParam}-${statusParam}-${categoryParam}-${factoryParam}-${queryParam}`;
  const [lastParamsKey, setLastParamsKey] = useState(currentParamsKey);
  
  if (currentParamsKey !== lastParamsKey) {
    setLastParamsKey(currentParamsKey);
    setSearchQuery(queryParam);
    setLoading(true);
  }

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Real-time Search effect (Sync UI to URL)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== queryParam) {
        const params = new URLSearchParams(window.location.search);
        if (searchQuery) params.set("q", searchQuery); else params.delete("q");
        router.push(`/dashboard/assets?${params.toString()}`);
      }
    }, 400); // Debounce 400ms
    return () => clearTimeout(timer);
  }, [searchQuery, router, queryParam]);
  
  // โหลดข้อมูลผ่าน Client Side เพื่อให้รองรับการ Interact (Delete/Select)
  const fetchAssets = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (filterParam) sp.append("filter", filterParam);
      if (statusParam) sp.append("status", statusParam);
      if (categoryParam) sp.append("category", categoryParam);
      if (factoryParam) sp.append("factory", factoryParam);
      if (queryParam) sp.append("q", queryParam);
      
      const res = await fetch(`/api/assets?${sp.toString()}&includeDeleted=false`, { cache: "no-store" }); // เพิ่ม filter เพื่อไม่รวมรายการที่ถูกลบ
      if (!res.ok) throw new Error();
      
      const data: RawAsset[] = await res.json();
      const enriched: Asset[] = await Promise.all(data.map(async (a) => ({
        ...a,
        qrData: await generateAssetQRCode(a.id),
        isIncomplete: a.status === 'active' && (!a.serialNumber || !a.brand || !a.location)
      })));
      
      setAllAssets(enriched);
    } catch (err) {
      toast.error("ไม่สามารถโหลดข้อมูลอุปกรณ์ได้");
    } finally {
      setLoading(false);
    }
  }, [filterParam, statusParam, categoryParam, factoryParam, queryParam]);

  useEffect(() => {
    // ใช้ setTimeout เพื่อแยกวงจรการทำงานออกจากรอบการ Render ของ React (ป้องกัน cascading renders)
    const timer = setTimeout(() => {
      fetchAssets(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAssets]);


  const handleRetire = async (id: string, code: string | null) => {
    if (!confirm(`คุณต้องการทำเครื่องหมายอุปกรณ์ ${code || id.substring(0,8)} เป็น 'จำหน่ายออก' ใช่หรือไม่? อุปกรณ์จะไม่ปรากฏในรายการปกติ แต่ยังคงอยู่ในระบบเพื่อการตรวจสอบย้อนหลัง`)) return;
    
    try {
      const res = await fetch(`/api/assets/${id}?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("อุปกรณ์ถูกทำเครื่องหมายเป็น 'จำหน่ายออก' เรียบร้อยแล้ว");
        setLoading(true); // สั่ง loading ที่นี่แทน (ปลอดภัยเพราะอยู่ใน Event Handler)
        fetchAssets();
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("ไม่สามารถจำหน่ายออกได้");
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
      {!loading && allAssets.length === 0 && !filterParam && !statusParam && !queryParam && !categoryParam && (
        <div className="bg-amber-50 text-amber-700 p-4 rounded-xl flex items-center gap-3 mb-4 text-sm font-bold">
          <AlertTriangle className="h-5 w-5" />
          ไม่พบข้อมูลอุปกรณ์ในระบบ
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
            <Package className="h-10 w-10 text-zinc-900" />
            คลัง
          </h1>
          <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] ml-1">Asset Inventory Management</p>
        </div>
        <div className="flex gap-3">
          <div className="p-[2px] rounded-2xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-md">
            <Link href="/dashboard/assets/new">
              <Button className="h-11 px-6 gap-2 bg-white text-zinc-900 hover:bg-zinc-50 border-none rounded-[14px] font-black text-sm transition-all">
                <Plus className="h-5 w-5" /> เพิ่มอุปกรณ์ใหม่
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center border-b border-indigo-50 pb-6">
        <div ref={searchContainerRef} className="relative flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className={cn(
              "absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors",
              isSearchFocused ? "text-indigo-600" : "text-indigo-400"
            )} />
            <input
              type="text"
              placeholder="ค้นหาอุปกรณ์..."
              className="w-full pl-12 pr-12 h-12 bg-white border border-zinc-200 rounded-2xl focus:border-indigo-100 focus:bg-white focus:ring-4 focus:ring-indigo-600/5 outline-none font-bold text-indigo-950 placeholder:text-indigo-300 transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const params = new URLSearchParams(window.location.search);
                  if (searchQuery) params.set("q", searchQuery); else params.delete("q");
                  router.push(`/dashboard/assets?${params.toString()}`);
                  setIsSearchFocused(false);
                  (e.currentTarget as HTMLInputElement).blur();
                }
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery("");
                  const params = new URLSearchParams(window.location.search);
                  params.delete("q");
                  router.push(`/dashboard/assets?${params.toString()}`);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-100 rounded-full text-zinc-400"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          {isSearchFocused && (
            <Button 
              variant="ghost" 
              className="md:hidden text-indigo-600 font-bold h-12"
              onClick={() => {
                setIsSearchFocused(false);
                setSearchQuery(queryParam);
              }}
            >
              ยกเลิก
            </Button>
          )}
        </div>
        <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
          <Select 
            defaultValue={factoryParam || "all"}
            onValueChange={(val) => {
              const params = new URLSearchParams(window.location.search);
              if (val === "all") params.delete("factory");
              else params.set("factory", val || "");
              router.push(`/dashboard/assets?${params.toString()}`);
            }}
          >
            <SelectTrigger className="w-full md:w-[150px] h-12 bg-white border border-zinc-200 rounded-2xl font-black text-indigo-900 shadow-sm focus:ring-indigo-600">
              <SelectValue placeholder="โรงงาน" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 bg-white">
              <SelectItem value="all" className="font-bold rounded-xl focus:bg-indigo-50">ทุกโรงงาน</SelectItem>
              <SelectItem value="โรงงาน 1" className="font-bold rounded-xl focus:bg-indigo-50">โรงงาน 1</SelectItem>
              <SelectItem value="โรงงาน 2" className="font-bold rounded-xl focus:bg-indigo-50">โรงงาน 2</SelectItem>
              <SelectItem value="ทั้ง 2 โรงงาน" className="font-bold rounded-xl focus:bg-indigo-50">ทั้ง 2 โรงงาน</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            defaultValue={categoryParam || "all"}
            onValueChange={(val) => {
              const params = new URLSearchParams(window.location.search);
              if (val === "all") params.delete("category");
              else params.set("category", val || "");
              router.push(`/dashboard/assets?${params.toString()}`);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px] h-12 bg-white border border-zinc-200 rounded-2xl font-black text-indigo-900 shadow-sm focus:ring-indigo-600">
              <SelectValue placeholder="หมวดหมู่" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 bg-white">
              <SelectItem value="all" className="font-bold rounded-xl focus:bg-indigo-50">ทุกประเภท</SelectItem>
              <SelectItem value="computer" className="font-bold rounded-xl focus:bg-indigo-50">คอมพิวเตอร์/โน้ตบุ๊ค</SelectItem>
              <SelectItem value="printer" className="font-bold rounded-xl focus:bg-indigo-50">เครื่องพิมพ์</SelectItem>
              <SelectItem value="monitor" className="font-bold rounded-xl focus:bg-indigo-50">จอภาพ</SelectItem>
              <SelectItem value="network" className="font-bold rounded-xl focus:bg-indigo-50">อุปกรณ์เครือข่าย</SelectItem>
              <SelectItem value="other" className="font-bold rounded-xl focus:bg-indigo-50">อื่นๆ</SelectItem>
            </SelectContent>
          </Select>

          <Select 
            defaultValue={filterParam || statusParam || "all"}
            onValueChange={(val) => {
              if (val === "retired") {
                router.push("/dashboard/assets/retired");
                return;
              }
              const params = new URLSearchParams(window.location.search);
              params.delete("filter");
              params.delete("status");
              if (val === "incomplete") params.set("filter", "incomplete");
              else if (val === "pending") params.set("status", "pending");
              else if (val === "active") params.set("status", "active");
              else if (val === "broken") params.set("status", "broken");
              else if (val === "lost") params.set("status", "lost");
              router.push(`/dashboard/assets?${params.toString()}`);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px] h-12 bg-white border border-zinc-200 rounded-2xl font-black text-indigo-900 shadow-sm focus:ring-indigo-600">
              <SelectValue placeholder="สถานะ" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 bg-white">
              <SelectItem value="all" className="font-bold rounded-xl focus:bg-indigo-50">ทุกสถานะ</SelectItem>
              <SelectItem value="active" className="font-bold text-emerald-600 rounded-xl focus:bg-emerald-50">ใช้งานปกติ</SelectItem>
              <SelectItem value="broken" className="font-bold text-rose-600 rounded-xl focus:bg-rose-50">ชำรุด/เสียหาย</SelectItem>
              <SelectItem value="incomplete" className="font-bold text-amber-600 rounded-xl focus:bg-amber-50">ข้อมูลไม่สมบูรณ์</SelectItem>
              <SelectItem value="pending" className="font-bold text-indigo-400 rounded-xl focus:bg-indigo-50">รอลงทะเบียน</SelectItem>
              <SelectItem value="retired" className="font-bold text-zinc-600 rounded-xl focus:bg-zinc-50">จำหน่ายออก</SelectItem>
              <SelectItem value="lost" className="font-bold text-zinc-500 rounded-xl focus:bg-zinc-50">สูญหาย</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full">
        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
          </div>
        ) : allAssets.length === 0 ? (
          <div className="py-20 text-center text-indigo-300 italic font-medium">
            ไม่พบข้อมูลอุปกรณ์
          </div>
        ) : (
          <>
            {/* Desktop View - Table Mode */}
            <div className="hidden md:block overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-indigo-50 hover:bg-transparent">
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead className="font-black text-indigo-900/40 uppercase tracking-widest text-[12px]">Asset Code</TableHead>
                    <TableHead className="font-black text-indigo-900/40 uppercase tracking-widest text-[12px]">ประเภท/ยี่ห้อ</TableHead>
                    <TableHead className="font-black text-indigo-900/40 uppercase tracking-widest text-[12px]">โรงงาน</TableHead>
                    <TableHead className="font-black text-indigo-900/40 uppercase tracking-widest text-[12px]">สถานที่ติดตั้ง</TableHead>
                    <TableHead className="font-black text-indigo-900/40 uppercase tracking-widest text-[12px]">สถานะ</TableHead>
                    <TableHead className="text-right font-black text-indigo-900/40 uppercase tracking-widest text-[12px]">การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {allAssets.map((asset) => (
                      <TableRow 
                        key={asset.id} 
                        className={`hover:bg-indigo-50/20 transition-colors border-b border-indigo-50/50 h-20 ${selectedIds.includes(asset.id) ? 'bg-indigo-50/40' : ''}`}
                      >
                        <TableCell>
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
                            <Link href={`/dashboard/assets/${asset.id}`} className="group cursor-pointer">
                              <span className="text-indigo-600 bg-indigo-50/50 px-3 py-1.5 rounded-lg border border-indigo-100 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">{asset.assetCode}</span>
                            </Link>
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
                        <TableCell>
                          <div className="flex items-center gap-1.5 font-bold text-zinc-600">
                            <Factory className="h-3.5 w-3.5" />
                            {asset.factory || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm font-bold text-indigo-900/70">{asset.location || "-"}</TableCell>
                        <TableCell>
                          <Badge className={`border-none font-black text-[10px] px-3 py-1 rounded-full shadow-sm ${
                            asset.status === 'active' ? 'bg-emerald-500 text-white' : 
                            asset.status === 'broken' ? 'bg-rose-500 text-white' : 
                            asset.status === 'pending' ? 'bg-amber-500 text-white' : 
                            asset.status === 'retired' ? 'bg-zinc-500 text-white' : 'bg-indigo-200 text-indigo-700'
                          }`}>
                            {asset.status === 'active' ? "ใช้งานปกติ" :
                             asset.status === 'broken' ? "ชำรุด/เสียหาย" :
                             asset.status === 'pending' ? "รอลงทะเบียน" :
                             asset.status === 'retired' ? "จำหน่ายออก" :
                             asset.status === 'lost' ? "สูญหาย" : asset.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
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
                              onClick={() => handleRetire(asset.id, asset.assetCode)}
                              title="จำหน่ายออก"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>

              {/* Mobile View - Card Mode */}
              <div className="md:hidden space-y-4">
                {allAssets.map((asset) => (
                  <div 
                    key={asset.id} 
                    className={`p-5 flex gap-4 transition-colors border-b border-indigo-50 ${selectedIds.includes(asset.id) ? 'bg-indigo-50/30' : ''}`}
                  >
                    <div className="pt-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`h-8 w-8 rounded-full border-2 transition-all ${selectedIds.includes(asset.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-indigo-100 text-transparent'}`}
                        onClick={() => toggleSelect(asset.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-1">
                          <Link href={`/dashboard/assets/${asset.id}`}>
                            <span className="font-mono font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded text-[10px] border border-indigo-100 active:bg-indigo-600 active:text-white">
                              {asset.assetCode || "PENDING"}
                            </span>
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <h3 className="font-black text-indigo-950 truncate text-sm">{asset.category || "-"}</h3>
                            {asset.isIncomplete && (
                              <div className="bg-rose-500 w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse" />
                            )}
                          </div>
                          {asset.factory && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-400">
                              <Factory className="h-3 w-3" />
                              {asset.factory}
                            </div>
                          )}
                        </div>
                        <Badge className={`border-none font-black text-[8px] px-2 py-0.5 rounded-full ${
                          asset.status === 'active' ? 'bg-emerald-500 text-white' : 
                          asset.status === 'broken' ? 'bg-rose-500 text-white' : 
                          asset.status === 'pending' ? 'bg-amber-500 text-white' : 
                          asset.status === 'retired' ? 'bg-zinc-500 text-white' : 'bg-indigo-200 text-indigo-700'
                        }`}>
                           {asset.status === 'active' ? "ใช้งานปกติ" :
                            asset.status === 'broken' ? "ชำรุด/เสียหาย" :
                            asset.status === 'pending' ? "รอลงทะเบียน" :
                            asset.status === 'retired' ? "จำหน่ายออก" :
                            asset.status === 'lost' ? "สูญหาย" : asset.status}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase truncate pr-2">
                          {asset.brand} {asset.model}
                        </span>
                        <div className="flex gap-1.5">
                          <QRPrintWrapper qrData={asset.qrData} assetCode={asset.assetCode || "NEW-QR"} />
                          <Link href={`/dashboard/assets/${asset.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg bg-white border border-indigo-50 text-indigo-600 shadow-sm">
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 rounded-lg bg-white border border-rose-50 text-rose-500 shadow-sm"
                            onClick={() => handleRetire(asset.id, asset.assetCode)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
          </>
        )}
      </div>

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

export default function AssetsPage() {
  return (
    <Suspense fallback={
      <div className="py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-600" />
        <p className="mt-4 text-indigo-400 font-bold uppercase tracking-widest text-[10px]">Loading Inventory...</p>
      </div>
    }>
      <AssetsList />
    </Suspense>
  );
}
