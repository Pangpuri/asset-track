"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Save, PackagePlus } from "lucide-react";
import Link from "next/link";

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

export default function AssetEntryPage() {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      status: "active",
      category: "",
    }
  });

  const selectedCategory = watch("category");

  const onSubmit = async (data: AssetFormValues) => {
    try {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการบันทึก");

      toast.success("บันทึกข้อมูลอุปกรณ์เรียบร้อยแล้ว");
      router.push("/dashboard/assets");
      router.refresh();
    } catch (error) {
      toast.error("ไม่สามารถบันทึกได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl min-h-screen flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/10 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-400/10 blur-[100px] rounded-full -z-10" />

      <div className="w-full flex justify-start">
        <Button variant="ghost" className="gap-2 text-indigo-600 hover:bg-indigo-50 font-bold" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" /> กลับ
        </Button>
      </div>

      <Card className="w-full glass-card border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in duration-500">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <PackagePlus className="h-8 w-8 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-black tracking-tight">เพิ่มอุปกรณ์ใหม่</CardTitle>
              <CardDescription className="text-indigo-100 font-medium">ลงทะเบียนสินทรัพย์เข้าสู่ระบบ MIS</CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="assetCode" className="font-bold text-indigo-900/70 text-[10px] uppercase tracking-widest">รหัสอุปกรณ์ *</Label>
                <Input id="assetCode" {...register("assetCode")} placeholder="เช่น P001234" className="h-12 rounded-xl border-indigo-100 focus:border-indigo-500 bg-white/50" />
                {errors.assetCode && <p className="text-xs text-rose-500 font-bold">{errors.assetCode.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="font-bold text-indigo-900/70 text-[10px] uppercase tracking-widest">ประเภทอุปกรณ์ *</Label>
                <Select onValueChange={(value) => setValue("category", value as string)}>
                  <SelectTrigger className="h-12 rounded-xl border-indigo-100 bg-white/50">
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-indigo-100 shadow-xl rounded-xl z-50">
                    <SelectItem value="computer" className="focus:bg-indigo-50 rounded-lg">Computer / Laptop</SelectItem>
                    <SelectItem value="printer" className="focus:bg-indigo-50 rounded-lg">Printer</SelectItem>
                    <SelectItem value="network" className="focus:bg-indigo-50 rounded-lg">Network Device</SelectItem>
                    <SelectItem value="monitor" className="focus:bg-indigo-50 rounded-lg">Monitor</SelectItem>
                    <SelectItem value="other" className="focus:bg-indigo-50 rounded-lg">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-rose-500 font-bold">{errors.category.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="brand" className="font-bold text-indigo-900/70 text-[10px] uppercase tracking-widest">ยี่ห้อ (Brand)</Label>
                <Input id="brand" {...register("brand")} placeholder="เช่น HP, Dell" className="h-12 rounded-xl border-indigo-100 bg-white/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model" className="font-bold text-indigo-900/70 text-[10px] uppercase tracking-widest">รุ่น (Model)</Label>
                <Input id="model" {...register("model")} placeholder="เช่น Latitude 5420" className="h-12 rounded-xl border-indigo-100 bg-white/50" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="serialNumber" className="font-bold text-indigo-900/70 text-[10px] uppercase tracking-widest">Serial Number</Label>
                <Input id="serialNumber" {...register("serialNumber")} className="h-12 rounded-xl border-indigo-100 bg-white/50 font-mono text-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="warrantyUntil" className="font-bold text-indigo-900/70 text-[10px] uppercase tracking-widest">วันหมดประกัน</Label>
                <Input id="warrantyUntil" type="date" {...register("warrantyUntil")} className="h-12 rounded-xl border-indigo-100 bg-white/50" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="font-bold text-indigo-900/70 text-[10px] uppercase tracking-widest">จุดติดตั้ง (Location)</Label>
              <Input id="location" {...register("location")} placeholder="เช่น แผนกบัญชี ชั้น 2" className="h-12 rounded-xl border-indigo-100 bg-white/50" />
            </div>

            {/* ข้อมูลการส่งมอบ (Delivery Info) */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">การส่งมอบ (Delivery)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate" className="text-xs">วันที่ส่งมอบ</Label>
                  <Input id="deliveryDate" type="date" {...register("deliveryDate")} className="h-10 bg-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveredBy" className="text-xs">ผู้ส่งมอบ</Label>
                  <Input id="deliveredBy" {...register("deliveredBy")} placeholder="ชื่อ Admin" className="h-10 bg-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="receivedBy" className="text-xs">ผู้รับมอบ/ผู้ใช้งาน</Label>
                <Input id="receivedBy" {...register("receivedBy")} placeholder="ชื่อพนักงาน" className="h-10 bg-white" />
              </div>
            </div>

            {/* ส่วนขยายตามประเภทอุปกรณ์ */}
            {selectedCategory === "computer" && (
              <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Computer Specifics</p>
                <div className="space-y-2">
                  <Label htmlFor="computerName">ชื่อเครื่อง (Computer Name)</Label>
                  <Input id="computerName" {...register("computerName")} placeholder="เช่น ACC-PC-01" className="h-11 rounded-lg bg-white" />
                </div>
              </div>
            )}

            {selectedCategory === "monitor" && (
              <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Monitor Specifics</p>
                <div className="space-y-2">
                  <Label htmlFor="monitorSize">ขนาดหน้าจอ (Size)</Label>
                  <Input id="monitorSize" {...register("monitorSize")} placeholder="เช่น 24 inch" className="h-11 rounded-lg bg-white" />
                </div>
              </div>
            )}

            {selectedCategory === "network" && (
              <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Network Specifics</p>
                <div className="space-y-2">
                  <Label htmlFor="ipAddress">IP Address</Label>
                  <Input id="ipAddress" {...register("ipAddress")} placeholder="192.168.1.XX" className="h-11 rounded-lg bg-white" />
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-indigo-50/30 border-t border-indigo-100 p-8 flex gap-4">
            <Button type="button" variant="outline" className="flex-1 h-12 rounded-2xl border-2 border-indigo-100 text-indigo-600 font-bold hover:bg-white" onClick={() => router.back()}>ยกเลิก</Button>
            <Button type="submit" className="flex-1 h-12 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 font-bold gap-2" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกอุปกรณ์"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="text-center pb-4">
        <p className="text-[10px] text-indigo-300 uppercase tracking-[0.3em] font-black">
          พัฒนาโดยฝ่าย MIS
        </p>
      </div>
    </div>
  );
}
