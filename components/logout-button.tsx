"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/simple", {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("ออกจากระบบสำเร็จ");
        window.location.href = "/login";
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาด");
    }
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      className="rounded-xl border-zinc-200 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
      onClick={handleLogout}
    >
      <LogOut size={18} />
    </Button>
  );
}
