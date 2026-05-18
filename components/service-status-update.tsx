"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

export function ServiceStatusUpdate({ id, currentStatus }: { id: string, currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    try {
      const res = await fetch("/api/services", {
        method: "PUT",
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) throw new Error();
      
      toast.success("อัปเดตสถานะเรียบร้อย");
      router.refresh();
    } catch (error) {
      toast.error("ไม่สามารถอัปเดตสถานะได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={loading ? "opacity-50 pointer-events-none" : ""}>
      <Select defaultValue={currentStatus} onValueChange={(v) => v && handleStatusChange(v)}>
        <SelectTrigger className="w-[140px] h-8 ml-auto">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="resolved">Resolved ✅</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}