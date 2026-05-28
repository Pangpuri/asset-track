import { db } from "@/db";
import { user as userTable } from "@/db/schema/auth";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Mail, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function UserManagementPage() {
  const users = await db.select().from(userTable);

  return (
    <div className="min-h-screen bg-zinc-50 pb-20">
      <div className="max-w-lg mx-auto bg-white min-h-screen shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-zinc-100 sticky top-0 bg-white/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="p-2 -ml-2 active:opacity-50 transition-opacity">
              <ArrowLeft className="h-6 w-6 text-zinc-900" />
            </Link>
            <span className="text-base font-bold tracking-tight text-zinc-900">Staff Management</span>
          </div>
          <Link href="/dashboard/users/new">
            <Button size="sm" className="bg-zinc-900 text-white rounded-xl h-8 text-[10px] font-black uppercase tracking-widest gap-2">
              <UserPlus size={14} />
              Add Staff
            </Button>
          </Link>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center gap-2 py-4">
             <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner">
                <ShieldCheck size={32} />
             </div>
             <div className="text-center">
                <p className="text-xl font-black text-zinc-900 uppercase tracking-tighter">MIS Personnel</p>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-[0.2em] mt-1">Authorized System Operators</p>
             </div>
          </div>

          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="p-4 rounded-3xl bg-white border border-zinc-100 shadow-sm flex items-center justify-between group active:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white font-black text-lg shadow-lg">
                    {user.name?.[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight leading-none mb-1">{user.name}</h3>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Mail size={10} />
                      <span className="text-[10px] font-bold">{user.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">Joined</span>
                  <span className="text-[9px] font-bold text-zinc-500">
                    {format(new Date(user.createdAt), "d MMM yy", { locale: th })}
                  </span>
                </div>
              </div>
            ))}
            
            {users.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">No staff accounts found</p>
              </div>
            )}
          </div>

          <div className="mt-10 p-6 rounded-[2rem] bg-zinc-50 border border-zinc-100">
             <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-3">Security Note</p>
             <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
               เฉพาะผู้ที่มีรายชื่อในหน้านี้เท่านั้นที่สามารถเข้าถึง Dashboard และแก้ไขข้อมูลทรัพย์สินได้ หากต้องการยกเลิกสิทธิ์ กรุณาติดต่อหัวหน้าแผนก MIS
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
