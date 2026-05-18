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

const assetSchema = z.object({
  assetCode: z.string().min(2, "รหัสอุปกรณ์ต้องมีอย่างน้อย 2 ตัวอักษร"),
  category: z.string().min(1, "กรุณาเลือกประเภทอุปกรณ์"),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  computerName: z.string().optional(),
  monitorSize: z.string().optional(),
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
      router.refresh();
      // หรือเคลียร์ฟอร์ม
    } catch (error) {
      toast.error("ไม่สามารถบันทึกได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl min-h-screen flex items-center justify-center">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">เพิ่มอุปกรณ์ใหม่</CardTitle>
          <CardDescription>กรอกข้อมูลอุปกรณ์เพื่อลงทะเบียนในระบบ AssetTrack</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assetCode">รหัสอุปกรณ์ (Asset Code) *</Label>
                <Input id="assetCode" {...register("assetCode")} placeholder="เช่น P001234" />
                {errors.assetCode && <p className="text-sm text-red-500">{errors.assetCode.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">ประเภทอุปกรณ์ *</Label>
                <Select onValueChange={(value) => setValue("category", value as string)}>
                  <SelectTrigger>
                    <SelectValue placeholder="เลือกประเภท" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="computer">Computer / Laptop</SelectItem>
                    <SelectItem value="printer">Printer</SelectItem>
                    <SelectItem value="network">Network Device</SelectItem>
                    <SelectItem value="monitor">Monitor</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">ยี่ห้อ (Brand)</Label>
                <Input id="brand" {...register("brand")} placeholder="เช่น HP, Dell, Cisco" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">รุ่น (Model)</Label>
                <Input id="model" {...register("model")} placeholder="เช่น Latitude 5420" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input id="serialNumber" {...register("serialNumber")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">จุดติดตั้ง (Location)</Label>
              <Input id="location" {...register("location")} placeholder="เช่น แผนกบัญชี ชั้น 2" />
            </div>

            {/* ส่วนขยายตามประเภทอุปกรณ์ */}
            {selectedCategory === "computer" && (
              <div className="p-4 bg-muted rounded-lg space-y-4">
                <p className="text-sm font-medium">ข้อมูลเฉพาะสำหรับ Computer</p>
                <div className="space-y-2">
                  <Label htmlFor="computerName">ชื่อเครื่อง (Computer Name)</Label>
                  <Input id="computerName" {...register("computerName")} placeholder="เช่น ACC-PC-01" />
                </div>
              </div>
            )}

            {selectedCategory === "monitor" && (
              <div className="p-4 bg-muted rounded-lg space-y-4">
                <p className="text-sm font-medium">ข้อมูลเฉพาะสำหรับ Monitor</p>
                <div className="space-y-2">
                  <Label htmlFor="monitorSize">ขนาดหน้าจอ (Size)</Label>
                  <Input id="monitorSize" {...register("monitorSize")} placeholder="เช่น 24 inch" />
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between gap-4">
            <Button type="button" variant="outline" className="w-full" onClick={() => router.back()}>ยกเลิก</Button>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกอุปกรณ์"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
