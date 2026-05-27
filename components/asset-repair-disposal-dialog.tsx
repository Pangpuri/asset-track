"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AssetRepairDisposalDialog({ 
  assetId, 
  assetCode,
  onClose,
  onSuccess
}: { 
  assetId: string, 
  assetCode: string,
  onClose: () => void,
  onSuccess: () => void
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  
  // Disposal Fields
  const [reason, setReason] = useState("ชำรุดซ่อมไม่คุ้ม");
  const [method, setMethod] = useState("");
  const [value, setValue] = useState("");
  const [authorizedBy, setAuthorizedBy] = useState("");

  const handleDispose = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/assets/${assetId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "retired",
          disposalReason: reason,
          disposalMethod: method,
          disposalValue: value,
          disposalAuthorizedBy: authorizedBy
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("ส่งอุปกรณ์ไปจำหน่ายออกเรียบร้อยแล้ว");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการจำหน่ายออก");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200 border-rose-100">
        <CardHeader className="relative bg-rose-50/50 rounded-t-xl">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4 text-rose-400 hover:text-rose-600 hover:bg-rose-100" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="flex items-center gap-2 text-rose-700">
            <Trash2 className="h-5 w-5" />
            ส่งจำหน่ายออก (Confirm Disposal)
          </CardTitle>
          <CardDescription className="text-rose-600/70 font-medium">
            อุปกรณ์ <b>{assetCode}</b> ซ่อมไม่สำเร็จและต้องการคัดแยกออกจากระบบ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex gap-3 text-sm text-rose-800">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500" />
            <p className="font-bold">
              ระบุรายละเอียดการจำหน่ายออกเพื่อเก็บไว้ในประวัติการเคลื่อนไหว
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-rose-700 font-bold ml-1">สาเหตุการจำหน่าย (เช่น ชำรุดซ่อมไม่คุ้ม)</Label>
            <Input 
              placeholder="ระบุสาเหตุ..." 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="border-rose-100 focus:ring-rose-200 h-12 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-rose-700 font-bold ml-1 text-xs">วิธีการจำหน่าย</Label>
              <Input 
                placeholder="เช่น ขาย, ทิ้ง, บริจาค" 
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="border-rose-100 h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-rose-700 font-bold ml-1 text-xs">มูลค่า (บาท)</Label>
              <Input 
                type="number"
                placeholder="0.00" 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="border-rose-100 h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-rose-700 font-bold ml-1 text-xs">ผู้อนุมัติการจำหน่าย</Label>
            <Input 
              placeholder="ชื่อผู้อนุมัติ..." 
              value={authorizedBy}
              onChange={(e) => setAuthorizedBy(e.target.value)}
              className="border-rose-100 h-12 rounded-xl"
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-3 pt-2 pb-6 px-6">
          <Button variant="outline" className="flex-1 h-12 rounded-xl border-rose-100 text-rose-600" onClick={onClose}>ยกเลิก</Button>
          <Button 
            className="flex-1 bg-rose-600 hover:bg-rose-700 h-12 rounded-xl font-bold shadow-lg shadow-rose-600/20" 
            onClick={handleDispose}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังบันทึก...
              </>
            ) : "ยืนยันการจำหน่ายออก"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
