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
  status: z.string(),
});

type AssetFormValues = z.infer<typeof assetSchema>;

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [assetData, setAssetData] = useState<any>(null);
  const [showReplaceDialog, setShowReplaceDialog] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { isSubmitting } } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
  });

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
      
      <Card className="border-2 shadow-lg">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>แก้ไขข้อมูลอุปกรณ์</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Asset Code</Label>
                <Input {...register("assetCode")} />
              </div>
              <div className="space-y-2">
                <Label>สถานะการใช้งาน</Label>
                <Select onValueChange={(v) => setValue("status", v || "active")} defaultValue="active">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">พร้อมใช้งาน (Active)</SelectItem>
                    <SelectItem value="maintenance">กำลังซ่อม (Maintenance)</SelectItem>
                    <SelectItem value="broken">ชำรุด (Broken)</SelectItem>
                    <SelectItem value="lost">สูญหาย (Lost)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
                <Label>ยี่ห้อ (Brand)</Label>
                <Input {...register("brand")} />
            </div>
            <div className="space-y-2">
                <Label>รุ่น (Model)</Label>
                <Input {...register("model")} />
            </div>
          </CardContent>
          <CardFooter className="flex gap-4 bg-slate-50 border-t mt-6">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>ยกเลิก</Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
              {isSubmitting ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}