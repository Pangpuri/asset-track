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
  warrantyUntil: z.string().optional(),
  deliveryDate: z.string().optional(),
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
      const res = await fetch(`/api/assets?id=${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setAssetData(data);
        reset(data); // นำข้อมูลเดิมมาใส่ในฟอร์ม
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
      const response = await fetch("/api/assets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: params.id as string, ...data }),
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
    <div className="container mx-auto p-4 max-w-2xl mt-10">
      <div className="flex justify-between items-center mb-4">
        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> กลับหน้าคลังอุปกรณ์
        </Button>
        <Button 
          variant="outline" 
          className="gap-2 border-orange-200 text-orange-600 hover:bg-orange-50"
          onClick={() => setShowReplaceDialog(true)}
        >
          <RefreshCw className="h-4 w-4" /> เปลี่ยนอุปกรณ์นี้
        </Button>
      </div>

      {showReplaceDialog && (
        <AssetReplaceDialog 
          oldAssetId={params.id as string}
          oldAssetCode={assetData?.assetCode || "NEW-QR"}
          onClose={() => setShowReplaceDialog(false)}
        />
      )}
      
      <Card className="glass-card border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8">
          <CardTitle className="text-2xl font-black tracking-tight">แก้ไขข้อมูลอุปกรณ์</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="p-8 space-y-8">
            {/* 1. General Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-indigo-900/70 text-[10px] uppercase tracking-widest">Asset Code</Label>
                <Input {...register("assetCode")} className="h-12 rounded-xl border-indigo-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-indigo-900/70 text-[10px] uppercase tracking-widest">สถานะการใช้งาน</Label>
                <Select onValueChange={(v) => setValue("status", v as string)} value={watch("status") ?? "active"}>
                  <SelectTrigger className="h-12 rounded-xl border-indigo-100"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">พร้อมใช้งาน (Active)</SelectItem>
                    <SelectItem value="pending">รอลงทะเบียน (Pending)</SelectItem>
                    <SelectItem value="maintenance">กำลังซ่อม (Maintenance)</SelectItem>
                    <SelectItem value="broken">ชำรุด (Broken)</SelectItem>
                    <SelectItem value="lost">สูญหาย (Lost)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-indigo-900/70 text-[10px] uppercase tracking-widest">ยี่ห้อ (Brand)</Label>
                <Input {...register("brand")} className="h-12 rounded-xl border-indigo-100" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-indigo-900/70 text-[10px] uppercase tracking-widest">รุ่น (Model)</Label>
                <Input {...register("model")} className="h-12 rounded-xl border-indigo-100" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="font-bold text-indigo-900/70 text-[10px] uppercase tracking-widest">Serial Number</Label>
                <Input {...register("serialNumber")} className="h-12 rounded-xl border-indigo-100 font-mono" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-indigo-900/70 text-[10px] uppercase tracking-widest">วันหมดประกัน</Label>
                <Input type="date" {...register("warrantyUntil")} className="h-12 rounded-xl border-indigo-100" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-bold text-indigo-900/70 text-[10px] uppercase tracking-widest">สถานที่ติดตั้ง (Location)</Label>
              <Input {...register("location")} className="h-12 rounded-xl border-indigo-100" />
            </div>

            {/* 2. Specific Info by Category */}
            {(selectedCategory === "computer" || selectedCategory === "monitor" || selectedCategory === "network") && (
              <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">ข้อมูลเฉพาะของประเภท {selectedCategory}</p>
                {selectedCategory === "computer" && (
                  <div className="space-y-2">
                    <Label>Computer Name</Label>
                    <Input {...register("computerName")} className="h-11 bg-white" />
                  </div>
                )}
                {selectedCategory === "monitor" && (
                  <div className="space-y-2">
                    <Label>Monitor Size</Label>
                    <Input {...register("monitorSize")} className="h-11 bg-white" />
                  </div>
                )}
                {selectedCategory === "network" && (
                  <div className="space-y-2">
                    <Label>IP Address</Label>
                    <Input {...register("ipAddress")} className="h-11 bg-white" />
                  </div>
                )}
              </div>
            )}

            {/* 3. Delivery Info */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ข้อมูลการส่งมอบ (Delivery)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs">วันที่ส่งมอบ</Label>
                  <Input type="date" {...register("deliveryDate")} className="h-10 bg-white" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">ผู้ส่งมอบ</Label>
                  <Input {...register("deliveredBy")} className="h-10 bg-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">ผู้รับมอบ/ผู้ใช้งาน</Label>
                <Input {...register("receivedBy")} className="h-10 bg-white" />
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-indigo-50/30 border-t border-indigo-100 p-8 flex gap-4">
            <Button type="button" variant="outline" className="flex-1 h-12 rounded-2xl border-2 font-bold" onClick={() => router.back()}>ยกเลิก</Button>
            <Button type="submit" className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 font-bold" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}