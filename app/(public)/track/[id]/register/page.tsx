"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

const registerSchema = z.object({
  // ข้อมูลอุปกรณ์ (กรณีเป็น QR ใหม่)
  assetCode: z.string().min(2, "กรุณากรอกรหัสอุปกรณ์").optional().or(z.literal("")),
  category: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),

  // ข้อมูลการส่งมอบ
  assignedTo: z.string().min(2, "กรุณากรอกชื่อผู้รับเบิก"),
  department: z.string().min(1, "กรุณากรอกแผนก"),
  location: z.string().min(1, "กรุณากรอกสถานที่/จุดติดตั้ง"),
  assignedBy: z.string().optional(),
  notes: z.string().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ดึงข้อมูล Asset ล่าสุดจาก DB เพื่อเช็คว่าเป็น QR เปล่าหรือไม่
    const fetchAsset = async () => {
      try {
        const res = await fetch(`/api/assets?id=${assetId}`);
        if (res.ok) {
          const data = await res.json();
          setAsset(data);
          
          // ถ้ามีข้อมูลเดิมอยู่แล้ว ให้นำมาใส่ในฟอร์มเบื้องต้น
          if (data.assetCode) setValue("assetCode", data.assetCode);
          if (data.category) setValue("category", data.category);
          if (data.brand) setValue("brand", data.brand);
          if (data.model) setValue("model", data.model);
          if (data.serialNumber) setValue("serialNumber", data.serialNumber);
          if (data.location) setValue("location", data.location);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAsset();
  }, [assetId]);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      // 1. ถ้าเป็น QR ใหม่ (status === 'pending') ต้องอัปเดตข้อมูล Asset ก่อน
      if (asset?.status === "pending") {
        if (!data.assetCode || !data.category) {
          toast.error("กรุณาระบุรหัสอุปกรณ์และประเภทอุปกรณ์");
          return;
        }

        const assetUpdate = await fetch("/api/assets", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: assetId,
            assetCode: data.assetCode,
            category: data.category,
            brand: data.brand,
            model: data.model,
            serialNumber: data.serialNumber,
            status: "active", // เปลี่ยนสถานะเป็น active ทันทีที่ลงทะเบียน
          }),
        });

        if (!assetUpdate.ok) throw new Error("ไม่สามารถอัปเดตข้อมูลอุปกรณ์ได้");
      }

      // 2. บันทึก Log การส่งมอบ
      const response = await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          action: "assign",
          assignedTo: data.assignedTo,
          department: data.department,
          location: data.location,
          assignedBy: data.assignedBy,
          notes: data.notes,
          deliveryDate: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error("เกิดข้อผิดพลาดในการบันทึก");

      toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
      setTimeout(() => router.push(`/track/${assetId}`), 1500);
    } catch (error) {
      toast.error("ไม่สามารถบันทึกได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  );

  const isPending = asset?.status === "pending";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {isPending ? "🆕 ลงทะเบียนอุปกรณ์ใหม่" : "📝 บันทึกข้อมูลการส่งมอบ"}
          </h1>
          <p className="text-gray-600">
            {isPending ? "กรอกข้อมูลพื้นฐานเพื่อเริ่มต้นการใช้งาน QR Code นี้" : "กรอกข้อมูลการเบิก / ส่งมอบอุปกรณ์"}
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-2 shadow-xl">
          <CardHeader className={`bg-gradient-to-r ${isPending ? 'from-amber-500 to-orange-600' : 'from-blue-500 to-blue-600'} text-white rounded-t-lg`}>
            <CardTitle>{isPending ? "ข้อมูลอุปกรณ์และผู้รับ" : "ข้อมูลการส่งมอบ"}</CardTitle>
            <CardDescription className="text-blue-50">
              {isPending ? "ระบุรหัสเครื่องและรายละเอียดเบื้องต้น" : "บันทึกการเคลื่อนไหว หรือเปลี่ยนสถานที่ของอุปกรณ์"}
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="pt-6 space-y-6">
              
              {isPending && (
                <div className="space-y-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h3 className="font-bold text-amber-900 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" /> ส่วนที่ 1: ข้อมูลอุปกรณ์หลัก
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assetCode">รหัสอุปกรณ์ (Asset Code) *</Label>
                      <Input id="assetCode" {...register("assetCode")} placeholder="เช่น P001234" />
                      {errors.assetCode && <p className="text-sm text-red-500">{errors.assetCode.message}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">ประเภทอุปกรณ์ *</Label>
                      <Select onValueChange={(v) => setValue("category", v as string)}>
                        <SelectTrigger><SelectValue placeholder="เลือกประเภท" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="computer">Computer/Laptop</SelectItem>
                          <SelectItem value="printer">Printer</SelectItem>
                          <SelectItem value="monitor">Monitor</SelectItem>
                          <SelectItem value="network">Network</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">ยี่ห้อ</Label>
                      <Input id="brand" {...register("brand")} placeholder="เช่น HP" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">รุ่น</Label>
                      <Input id="model" {...register("model")} placeholder="เช่น ProBook" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="serialNumber">S/N</Label>
                      <Input id="serialNumber" {...register("serialNumber")} />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-1 h-4 bg-blue-500 rounded-full" />
                  {isPending ? "ส่วนที่ 2: ข้อมูลการเบิกจ่าย" : "รายละเอียดการส่งมอบ"}
                </h3>
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">ชื่อผู้รับเบิก / ผู้ถือครอง *</Label>
                  <Input
                    id="assignedTo"
                    placeholder="เช่น นายสมชาย คนขยัน"
                    {...register("assignedTo")}
                    className={errors.assignedTo ? "border-red-500" : ""}
                  />
                  {errors.assignedTo && <p className="text-sm text-red-500">{errors.assignedTo.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">แผนก *</Label>
                    <Input id="department" {...register("department")} placeholder="เช่น ไอที, บัญชี" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">สถานที่/จุดติดตั้ง *</Label>
                    <Input id="location" {...register("location")} placeholder="เช่น อาคาร A ชั้น 3" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedBy">ชื่อผู้ส่งมอบ (ถ้ามี)</Label>
                  <Input id="assignedBy" {...register("assignedBy")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">หมายเหตุ (ข้อมูลที่ยังไม่ครบ สามารถระบุที่นี่)</Label>
                  <Textarea id="notes" {...register("notes")} rows={3} placeholder="เช่น รออัปเดตซีเรียลนัมเบอร์..." />
                </div>
              </div>
            </CardContent>

            <CardFooter className="bg-gray-50 border-t flex gap-3 p-6">
              <Link href={`/track/${assetId}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full h-11">ยกเลิก</Button>
              </Link>
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 h-11 ${isPending ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {isSubmitting ? <Loader2 className="animate-spin" /> : "บันทึกข้อมูล"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
