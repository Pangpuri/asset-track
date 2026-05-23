"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react";
import { AssetReplaceDialog } from "@/components/asset-replace-dialog";

const assetSchema = z.object({
  assetCode: z.string().min(2, "รหัสอุปกรณ์ต้องมีอย่างน้อย 2 ตัวอักษร"),
  category: z.string().min(1, "กรุณาเลือกประเภทอุปกรณ์"),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  computerName: z.string().optional(),
  monitorSize: z.string().optional(),
  warrantyExpire: z.string().optional(),
  purchaseDate: z.string().optional(),
  receivedBy: z.string().optional(),
  deliveredBy: z.string().optional(),
  ipAddress: z.string().optional(),
  status: z.string().optional(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [assetData, setAssetData] = useState<any>(null);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { isSubmitting, errors } } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
  });

  const selectedCategory = watch("category");

  useEffect(() => {
    const fetchAsset = async () => {
      // เปลี่ยนมาใช้ endpoint ตรงของมันเอง และปิด cache
      const res = await fetch(`/api/assets/${params.id}`, { cache: "no-store" });
      
      if (res.ok) {
        const data = await res.json();
        // ตอนนี้ data เป็น {} ไม่ใช่ [] แล้ว
        setAssetData(data);
        
        // แตกค่าจาก specifications ออกมาที่ root เพื่อให้ register() หาเจอ
        reset({
          ...data,
          ...data.specifications, // ดึง computerName, ipAddress ฯลฯ ออกมา
          // ตรวจสอบชื่อฟิลด์ให้ตรงกับที่ใช้ใน register(...)
          receivedBy: data.receivedBy || "",
          deliveredBy: data.deliveredBy || "",
          purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString().split('T')[0] : "",
          warrantyExpire: data.warrantyExpire ? new Date(data.warrantyExpire).toISOString().split('T')[0] : "",
        });
        
        setLoading(false);
      } else {
        toast.error("ไม่พบข้อมูลอุปกรณ์");
        router.push("/dashboard/assets");
      }
    };
    fetchAsset();
  }, [params.id, reset, router]);

  const onSubmit = async (data: AssetFormValues) => {
    try {
      const response = await fetch(`/api/assets/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error();
      toast.success("อัปเดตข้อมูลอุปกรณ์เรียบร้อยแล้ว");
      router.push("/dashboard/assets");
      router.refresh();
    } catch (error) {
      toast.error("ไม่สามารถอัปเดตข้อมูลได้");
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /> กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Sticky Header IG Style */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="active:opacity-50">
            <ArrowLeft className="h-6 w-6 text-black" />
          </button>
          <h1 className="text-lg font-black tracking-tight text-black">แก้ไข {assetData?.assetCode || "อุปกรณ์"}</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            className="text-orange-500 p-0 hover:bg-transparent"
            onClick={() => setShowReplaceDialog(true)}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          <Button 
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            variant="ghost"
            className="text-blue-600 font-bold hover:bg-transparent p-0 ml-2"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "บันทึก"}
          </Button>
        </div>
      </div>

      {showReplaceDialog && (
        <AssetReplaceDialog
          oldAssetId={params.id as string}
          oldAssetCode={assetData?.assetCode || "NEW-QR"}
          onClose={() => setShowReplaceDialog(false)}
        />
      )}

      <div className="max-w-lg mx-auto p-4 pt-8 space-y-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Asset Code</Label>
                <Input {...register("assetCode")} className="border-none bg-gray-50 h-14 rounded-2xl text-lg font-bold" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">สถานะ</Label>
                <Select onValueChange={(v) => setValue("status", v as string)} value={watch("status") ?? "active"}>
                  <SelectTrigger className="border-none bg-gray-50 h-14 rounded-2xl font-bold"><SelectValue /></SelectTrigger>
                  <SelectContent className="rounded-2xl shadow-2xl border-none">
                    <SelectItem value="active">พร้อมใช้งาน</SelectItem>
                    <SelectItem value="pending">รอลงทะเบียน</SelectItem>
                    <SelectItem value="maintenance">กำลังซ่อม</SelectItem>
                    <SelectItem value="broken">ชำรุด</SelectItem>
                    <SelectItem value="lost">สูญหาย</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 🚩 ส่วนที่แก้ไขเพิ่ม: Category Select เพื่อระบุประเภทอุปกรณ์ */}
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ประเภทอุปกรณ์</Label>
              <Select onValueChange={(v) => setValue("category", v as string)} value={watch("category")}>
                <SelectTrigger className="border-none bg-gray-50 h-14 rounded-2xl font-bold"><SelectValue placeholder="เลือกประเภท" /></SelectTrigger>
                <SelectContent className="rounded-2xl shadow-2xl border-none">
                  <SelectItem value="computer">Computer / Laptop</SelectItem>
                  <SelectItem value="printer">Printer</SelectItem>
                  <SelectItem value="network">Network Device</SelectItem>
                  <SelectItem value="monitor">Monitor</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gray-50 pt-8">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">ยี่ห้อ</Label>
              <Input {...register("brand")} className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">รุ่น</Label>
              <Input {...register("model")} className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Serial Number</Label>
              <Input {...register("serialNumber")} className="border-none bg-gray-50 h-12 rounded-xl font-mono" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">สถานที่ติดตั้ง</Label>
              <Input {...register("location")} className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
            </div>
          </div>

          {/* Dynamic Category Specifics */}
          {(selectedCategory === "computer" || selectedCategory === "monitor" || selectedCategory === "network") && (
            <div className="bg-blue-50/50 p-6 rounded-[2rem] space-y-4">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">ข้อมูลเฉพาะของ {selectedCategory}</p>
              {selectedCategory === "computer" && <Input {...register("computerName")} placeholder="Computer Name" className="bg-white border-none h-12 rounded-xl font-bold" />}
              {selectedCategory === "monitor" && <Input {...register("monitorSize")} placeholder="Size (e.g. 24 inch)" className="bg-white border-none h-12 rounded-xl font-bold" />}
              {selectedCategory === "network" && <Input {...register("ipAddress")} placeholder="IP Address" className="bg-white border-none h-12 rounded-xl font-mono" />}
            </div>
          )}

          {/* Delivery Info */}
          <div className="border-t border-gray-50 pt-8 space-y-6 pb-10">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">การส่งมอบ</p>
            <div className="space-y-2">
              <Label className="text-xs text-gray-500 ml-1">ผู้รับมอบ/ผู้ใช้งาน</Label>
              <Input {...register("receivedBy")} className="border-none bg-gray-50 h-12 rounded-xl font-bold" />
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label className="text-xs text-gray-500 ml-1">วันที่ส่งมอบ</Label>
                <Input type="date" {...register("purchaseDate")} className="border-none bg-gray-50 h-12 rounded-xl font-bold uppercase text-[10px]" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-500 ml-1">วันหมดประกัน</Label>
                <Input type="date" {...register("warrantyExpire")} className="border-none bg-gray-50 h-12 rounded-xl font-bold uppercase text-[10px]" />
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}