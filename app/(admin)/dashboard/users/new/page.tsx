"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, UserPlus, Mail, Lock, User } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

export default function NewUserPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Note: In a production app, we would use an admin API to create users
      // without logging the current user out. Better Auth's signUp logs in by default.
      // For this "non-strict" requirement, we'll use signUp.
      // The user might need to log back in if they are signed out.
      
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/dashboard/users",
      });

      if (error) {
        toast.error(error.message || "Failed to create user");
      } else {
        toast.success("Staff user created successfully");
        router.push("/dashboard/users");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center">
      <div className="w-full max-w-lg bg-white min-h-screen shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-100 sticky top-0 bg-white/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/users" className="p-2 -ml-2 active:opacity-50 transition-opacity">
              <ArrowLeft className="h-6 w-6 text-zinc-900" />
            </Link>
            <span className="text-base font-bold tracking-tight text-zinc-900">Add New Staff</span>
          </div>
        </div>

        <form onSubmit={handleCreateUser} className="p-8 space-y-8 pb-20">
          <div className="flex flex-col items-center gap-2 py-4">
             <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 flex items-center justify-center text-white border border-zinc-100 shadow-xl">
                <UserPlus size={32} />
             </div>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">MIS Access Provisioning</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Full Name</Label>
              <div className="relative">
                <Input
                  required
                  placeholder="Staff Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50 pl-12 font-bold focus:ring-indigo-500"
                />
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email Address</Label>
              <div className="relative">
                <Input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50 pl-12 font-bold focus:ring-indigo-500"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Initial Password</Label>
              <div className="relative">
                <Input
                  type="password"
                  required
                  placeholder="Set password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 rounded-2xl border-zinc-100 bg-zinc-50 pl-12 font-bold focus:ring-indigo-500"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 bg-zinc-900 hover:bg-black text-white rounded-[2rem] font-[1000] text-sm uppercase tracking-widest flex justify-center items-center gap-3 shadow-xl active:scale-[0.98] transition-all"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <UserPlus size={18} />
                </>
              )}
            </Button>
          </div>

          <div className="p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100">
             <p className="text-[10px] text-indigo-900 font-black uppercase tracking-widest mb-2">Notice</p>
             <p className="text-[11px] text-indigo-800 font-medium leading-relaxed">
               บัญชีที่สร้างขึ้นจะสามารถเข้าถึงระบบหลังบ้านได้ทันที โปรดรักษาความลับของรหัสผ่านและตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก
             </p>
          </div>
        </form>
      </div>
    </div>
  );
}
