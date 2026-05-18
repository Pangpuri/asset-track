"use client";

import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Loader2, X, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Asset {
  id: string;
  assetCode: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  status: string;
}

export function AssetReplaceDialog({ 
  oldAssetId, 
  oldAssetCode,
  onClose 
}: { 
  oldAssetId: string, 
  oldAssetCode: string,
  onClose: () => void 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [replacing, setReplacing] = useState(false);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // โหลดอุปกรณ์ที่สามารถนำมาเปลี่ยนได้ (สถานะ active หรือ pending และไม่ใช่เครื่องเดิม)
    const fetchAssets = async () => {
      try {
        const res = await fetch("/api/assets");
        if (res.ok) {
          const data = await res.json();
          // กรองเอาเฉพาะเครื่องที่พร้อม (active/pending) และไม่ใช่เครื่องปัจจุบัน
          const filtered = data.filter((a: Asset) => 
            (a.status === "active" || a.status === "pending") && a.id !== oldAssetId
          );
          setAvailableAssets(filtered);
        }
      } catch (err) {
        toast.error("ไม่สามารถโหลดข้อมูลอุปกรณ์สำรองได้");
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, [oldAssetId]);

  const handleReplace = async () => {
    if (!selectedAssetId) {
      toast.error("กรุณาเลือกอุปกรณ์ที่จะนำมาเปลี่ยน");
      return;
    }

    setReplacing(true);
    try {
      const res = await fetch("/api/assets/replace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldAssetId,
          newAssetId: selectedAssetId,
          reason
        }),
      });

      if (!res.ok) throw new Error();

      toast.success("เปลี่ยนอุปกรณ์เรียบร้อยแล้ว");
      router.refresh();
      onClose();
    } catch (error) {
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนอุปกรณ์");
    } finally {
      setReplacing(false);
    }
  };

  const filteredAssets = availableAssets.filter(a => 
    (a.assetCode?.toLowerCase().includes(search.toLowerCase()) || 
     a.model?.toLowerCase().includes(search.toLowerCase()) ||
     a.brand?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
        <CardHeader className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-4 top-4" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-blue-600" />
            เปลี่ยนอุปกรณ์ (Asset Replacement)
          </CardTitle>
          <CardDescription>
            เลือกอุปกรณ์ตัวใหม่มาแทนที่เครื่อง <b>{oldAssetCode}</b>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex gap-3 text-sm text-amber-800">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <p>
              เครื่องเก่าจะถูกปรับสถานะเป็น <b>Broken</b> และเครื่องใหม่จะรับช่วงต่อ <b>สถานที่ติดตั้ง</b> โดยอัตโนมัติ
            </p>
          </div>

          <div className="space-y-2">
            <Label>ค้นหาอุปกรณ์สำรอง</Label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="ค้นหาด้วย Asset Code, ยี่ห้อ หรือ รุ่น..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>เลือกอุปกรณ์เครื่องใหม่ *</Label>
            <Select onValueChange={(v) => setSelectedAssetId(v || "")} value={selectedAssetId}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "กำลังโหลด..." : "เลือกอุปกรณ์..."} />
              </SelectTrigger>
              <SelectContent>
                {filteredAssets.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">ไม่พบอุปกรณ์ที่พร้อมใช้งาน</div>
                ) : (
                  filteredAssets.map(asset => (
                    <SelectItem key={asset.id} value={asset.id}>
                      <div className="flex flex-col text-left">
                        <span className="font-bold">{asset.assetCode || "UNREGISTERED"}</span>
                        <span className="text-xs opacity-70">{asset.brand} {asset.model} ({asset.category})</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">เหตุผลการเปลี่ยน (บันทึกลง Log)</Label>
            <Input 
              id="reason" 
              placeholder="เช่น เครื่องเปิดไม่ติด, อัปเกรดรุ่นใหม่" 
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>ยกเลิก</Button>
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700" 
            onClick={handleReplace}
            disabled={replacing || !selectedAssetId}
          >
            {replacing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                กำลังดำเนินการ...
              </>
            ) : "ยืนยันการเปลี่ยน"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
