import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode, LayoutDashboard, Package, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/20 blur-[120px] rounded-full -z-10 animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/20 blur-[120px] rounded-full -z-10" />

      <main className="w-full max-w-md space-y-8 text-center relative z-10">
        {/* Logo & Hero Section */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="mx-auto bg-gradient-to-br from-indigo-500 to-blue-600 w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/40 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Package className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-5xl font-black tracking-tight text-indigo-950">
              Asset<span className="text-blue-600 bg-blue-100 px-2 rounded-xl ml-1">Track</span>
            </h1>
            <p className="text-indigo-600/70 font-semibold mt-2 tracking-wide uppercase text-sm">ระบบบริหารจัดการอุปกรณ์ไอที</p>
          </div>
        </div>

        {/* Main Actions Area */}
        <Card className="glass-card border-none shadow-2xl rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in duration-700 delay-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl text-indigo-900">ยินดีต้อนรับ</CardTitle>
            <CardDescription className="text-indigo-600/60 font-medium">กรุณาเลือกรายการที่ต้องการ</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 p-6">
            {/* กล้องสแกน */}
            <Button size="lg" className="h-24 text-xl gap-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 border-none neo-button rounded-2xl shadow-indigo-200" asChild>
              <Link href="/scan">
                <div className="bg-white/20 p-3 rounded-xl">
                  <QrCode className="h-8 w-8" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold">สแกน QR Code</span>
                  <span className="text-xs font-normal opacity-80 uppercase tracking-tighter">Scan to track or register</span>
                </div>
              </Link>
            </Button>

            <div className="grid grid-cols-1 gap-4 mt-2">
              <Button variant="outline" size="lg" className="h-18 gap-3 border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 neo-button rounded-2xl bg-white/50" asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="h-6 w-6" />
                  <span className="font-bold">MIS Dashboard</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="flex flex-col items-center gap-6 pt-8 animate-in fade-in duration-1000 delay-500">
          <div className="flex items-center justify-center gap-8 text-indigo-400/60 text-xs font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              MIS Only
            </div>
            <div className="flex items-center gap-2">
              <QrCode className="h-4 w-4" />
              Any Device
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] text-indigo-300 uppercase tracking-[0.3em] font-black opacity-80">
              พัฒนาโดยฝ่าย MIS
            </p>
            <div className="h-1 w-12 bg-indigo-200 mx-auto rounded-full opacity-50" />
          </div>
        </div>
      </main>
    </div>
  );
}
