import { db } from "@/db";
import { assets } from "@/db/schema/assets";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Printer, Network, Laptop, Wrench, History, QrCode, AlertTriangle } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function getAsset(id: string) {
  const result = await db
    .select()
    .from(assets)
    .where(eq(assets.id, id))
    .limit(1);
  return result[0];
}

export default async function TrackPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;

  try {
    // ตรวจสอบเบื้องต้นว่าเป็น UUID หรือไม่ (กัน Error จาก Drizzle/Postgres)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (!isUuid) return notFound();

    const asset = await getAsset(id);

    if (!asset) return notFound();

    const isPending = asset.status === "pending";

    // จัดการไอคอนให้ปลอดภัยขึ้น
    const Icon = isPending ? QrCode :
                 asset.category === "computer" ? Laptop : 
                 asset.category === "printer" ? Printer :
                 asset.category === "monitor" ? Monitor : Network;

    return (
      <div className="min-h-screen p-4 flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
        {/* Background accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/10 blur-[100px] rounded-full" />

        <Card className="w-full max-w-md glass-card border-none shadow-2xl rounded-[2rem] overflow-hidden animate-in fade-in zoom-in duration-500">
          <CardHeader className="text-center pb-4 pt-8">
            <div className={`mx-auto ${isPending ? 'bg-orange-100 text-orange-600 shadow-orange-100' : 'bg-indigo-100 text-indigo-600 shadow-indigo-100'} w-20 h-20 rounded-3xl flex items-center justify-center mb-4 shadow-xl rotate-3`}>
              <Icon size={40} />
            </div>
            <CardTitle className="text-3xl font-black text-indigo-950 tracking-tight">
              {isPending ? "NEW DEVICE" : (asset.assetCode || "NO CODE")}
            </CardTitle>
            <div className="flex justify-center mt-2">
              <Badge variant="secondary" className={`${isPending ? 'bg-orange-500 text-white' : 'bg-indigo-600 text-white'} border-none px-4 py-1 rounded-full uppercase text-[10px] font-bold tracking-widest`}>
                {isPending ? "รอลงทะเบียน" : (asset.category || "GENERAL")}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 px-8">
            {isPending ? (
              <div className="text-center space-y-3 py-6 bg-orange-50/50 rounded-2xl border border-orange-100">
                <p className="text-orange-900 font-bold px-4">สติกเกอร์นี้ยังไม่มีข้อมูลในระบบ</p>
                <p className="text-orange-700/70 text-xs px-6 leading-relaxed">กรุณากดปุ่มด้านล่างเพื่อเริ่มบันทึกข้อมูลอุปกรณ์เข้าสู่ฐานข้อมูล MIS</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 py-2">
                <div className="space-y-1">
                  <p className="text-[10px] text-indigo-400 uppercase font-black tracking-wider">ยี่ห้อ/รุ่น</p>
                  <p className="text-sm font-bold text-indigo-900">{asset.brand || "-"} / {asset.model || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-indigo-400 uppercase font-black tracking-wider">สถานที่</p>
                  <p className="text-sm font-bold text-indigo-900">{asset.location || "ไม่ระบุ"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-indigo-400 uppercase font-black tracking-wider">สถานะ</p>
                  <div className="flex">
                    <Badge className={`${asset.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'} text-white border-none font-bold text-[10px]`}>
                      {(asset.status || 'unknown').toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-indigo-400 uppercase font-black tracking-wider">S/N</p>
                  <p className="text-xs font-mono font-bold text-indigo-900/70">{asset.serialNumber || "-"}</p>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3 p-8 bg-indigo-50/30 border-t border-indigo-100/50">
            <Link href={`/track/${asset.id}/register`} className="w-full">
              <Button className={`w-full h-14 text-lg gap-3 neo-button rounded-2xl ${isPending ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}>
                <History className="h-5 w-5" /> 
                {isPending ? "เริ่มลงทะเบียน" : "บันทึกการส่งมอบ"}
              </Button>
            </Link>
            
            {!isPending && (
              <Link href={`/track/${asset.id}/services`} className="w-full">
                <Button variant="outline" className="w-full h-12 gap-3 border-2 border-orange-100 text-orange-600 hover:bg-orange-50 neo-button rounded-2xl bg-white">
                  <Wrench className="h-5 w-5" /> แจ้งปัญหา / ส่งซ่อม
                </Button>
              </Link>
            )}
          </CardFooter>
        </Card>

        <div className="flex flex-col items-center gap-4 pt-4 animate-in fade-in duration-700">
          <Link href="/dashboard" className="text-xs font-bold text-indigo-400 hover:text-indigo-600 transition-colors uppercase tracking-widest">
            MIS ADMIN LOGIN
          </Link>
          <div className="h-px w-8 bg-indigo-200" />
          <p className="text-[10px] text-indigo-300 uppercase tracking-[0.3em] font-black">
            พัฒนาโดยฝ่าย MIS
          </p>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering TrackPage:", error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-8 rounded-[2rem] shadow-xl max-w-sm w-full text-center space-y-4 border-2 border-rose-100">
          <div className="bg-rose-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-rose-600">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-xl font-black text-slate-900 uppercase">System Error</h1>
          <p className="text-sm text-slate-500 leading-relaxed">
            ขออภัย! เกิดข้อผิดพลาดขณะโหลดข้อมูลอุปกรณ์ <br/>
            เป็นไปได้ว่าระบบฐานข้อมูล Supabase กำลังติดขัด
          </p>
          <div className="pt-4">
             <Button variant="outline" className="w-full rounded-xl" onClick={() => window.location.reload()}>
               ลองใหม่อีกครั้ง
             </Button>
          </div>
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">ERROR ID: {id.substring(0,8)}</p>
        </div>
      </div>
    );
  }
}