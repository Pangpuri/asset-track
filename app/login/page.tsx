"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Package, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/simple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("ยินดีต้อนรับทีม MIS");
        // Force a full refresh to update Navbar state
        window.location.href = "/dashboard";
      } else {
        toast.error(data.message || "การเข้าสู่ระบบล้มเหลว");
      }
    } catch (err) {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6">
      <div className="w-full max-sm:w-full max-w-sm space-y-12">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-6">
          <div className="relative group">
            <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
            <div className="relative flex items-center justify-center w-24 h-24 bg-zinc-900 rounded-[2.2rem] overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 opacity-90" />
              <Package size={48} className="text-white relative z-10" strokeWidth={1.5} />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-4xl font-[1000] tracking-tighter text-zinc-900 uppercase">
              MIS<span className="text-indigo-600">ACCESS</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[10px] font-black text-zinc-400 tracking-[0.4em] uppercase">
                Secure Terminal
              </p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-zinc-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20" />
          
          <form onSubmit={handleLogin} className="space-y-8">
            <div className="space-y-4">
              <div className="text-center">
                <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Enter Access Key</Label>
              </div>
              <div className="relative">
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  required
                  autoFocus
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-16 text-center text-2xl tracking-[0.5em] rounded-2xl border-none bg-zinc-50 focus:ring-2 focus:ring-indigo-500/20 font-black text-zinc-900 transition-all placeholder:text-zinc-200"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-zinc-900 hover:bg-black text-white rounded-2xl font-[1000] text-sm uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/10 active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Grant Access"
              )}
            </Button>
          </form>
        </div>
        
        <div className="flex flex-col items-center gap-6">
          <p className="text-[9px] text-zinc-300 font-black uppercase tracking-[0.4em]">
            Authorized MIS Personnel Only
          </p>
          <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-full border border-zinc-100 shadow-sm">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Environment Secured</span>
          </div>
        </div>
      </div>
    </div>
  );
}
