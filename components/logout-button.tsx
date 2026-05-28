"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success("Logged out successfully");
          router.push("/login");
        },
      },
    });
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
