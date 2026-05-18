"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { AlertCircle, ArrowLeft, Wrench } from "lucide-react";
import Link from "next/link";

const serviceSchema = z.object({
  title: z.string().min(2, "กรุณาระบุหัวข้อปัญหา"),
  description: z.string().optional(),
  reportedBy: z.string().min(2, "กรุณาระบุชื่อผู้แจ้ง"),
  serviceType: z.string().min(1),
  priority: z.enum(["low", "medium", "high", "critical"]),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function PublicServicePage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id as string;

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      priority: "medium",
      serviceType: "repair",
    }
  });

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetId,
          ...data
        }),
      });

      if (!response.ok) throw new Error("เกิดข้อผิดพลาด");

      toast.success("ส่งข้อมูลแจ้งซ่อมเรียบร้อยแล้ว");
      router.push(`/track/${assetId}`);
    } catch (error) {
      toast.error("ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-4">
        <Link href={`/track/${assetId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" /> กลับ
          </Button>
        </Link>

        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-orange-600 text-white rounded-t-xl">
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" /> แจ้งปัญหา / ส่งซ่อม
            </CardTitle>
            <CardDescription className="text-orange-100">
              กรุณาระบุรายละเอียดปัญหาเพื่อให้เจ้าหน้าที่ตรวจสอบ
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">หัวข้อปัญหา *</Label>
                <Input
                  id="title"
                  placeholder="เช่น เปิดไม่ติด, จอแตก, พิมพ์ไม่ได้"
                  {...register("title")}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
                <Textarea
                  id="description"
                  placeholder="อธิบายอาการเสียเพิ่มเติม..."
                  {...register("description")}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportedBy">ชื่อผู้แจ้ง / เบอร์โทร *</Label>
                <Input id="reportedBy" {...register("reportedBy")} placeholder="ระบุชื่อเพื่อให้เจ้าหน้าที่ติดต่อกลับ" />
                {errors.reportedBy && <p className="text-xs text-red-500">{errors.reportedBy.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>ประเภทการแจ้ง</Label>
                <Select onValueChange={(v) => setValue("serviceType", v as any)} defaultValue="repair">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="repair">แจ้งซ่อมทั่วไป</SelectItem>
                    <SelectItem value="replacement">ขอเปลี่ยนอุปกรณ์ (เครื่องเสีย/เก่า)</SelectItem>
                    <SelectItem value="complaint">ร้องเรียน/อื่นๆ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>ความเร่งด่วน</Label>
                <Select onValueChange={(v) => setValue("priority", v as any)} defaultValue="medium">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">ต่ำ (รอได้)</SelectItem>
                    <SelectItem value="medium">ปกติ</SelectItem>
                    <SelectItem value="high">สูง (ด่วน)</SelectItem>
                    <SelectItem value="critical">วิกฤต (ใช้งานไม่ได้เลย)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-orange-600 hover:bg-orange-700 h-11"
              >
                {isSubmitting ? "กำลังส่งข้อมูล..." : "ส่งข้อมูลแจ้งซ่อม"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}