import { db } from "@/db";
import { assets } from "@/db/schema/assets";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Tag, MapPin } from "lucide-react";

export default async function TrackAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ดึงข้อมูล Asset จาก Database ตาม ID ที่ได้จาก QR Code
  const asset = await db
    .select()
    .from(assets)
    .where(eq(assets.id, id))
    .limit(1)
    .then((res) => res[0]);

  // 🚩 ลอจิกดักกรณีไม่พบข้อมูลในระบบ (ถูกลบ หรือ ID ผิด)
  if (!asset) {
    notFound(); // จะไปแสดงผลไฟล์ not-found.tsx อัตโนมัติ
  }

  // 🚩 ลอจิกดักกรณีพบ ID แต่สถานะเป็น pending (ยังไม่ได้ลงทะเบียนข้อมูล)
  if (asset.status === "pending") {
    redirect(`/track/${id}/register`);
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center gap-4 px-4 h-14 border-b border-gray-100 sticky top-0 bg-white z-10">
          <Link href="/scan" className="active:opacity-50">
            <ArrowLeft className="h-6 w-6 text-black" />
          </Link>
          <h1 className="text-base font-bold text-black">Asset Details</h1>
        </div>

        <div className="p-4 space-y-4">
          <div className="p-6 border border-gray-100 rounded-2xl bg-gray-50/30 space-y-4">
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-black uppercase">{asset.brand || "Unknown Brand"}</h2>
              <span className="px-2 py-1 bg-black text-white text-[10px] font-bold rounded uppercase tracking-tighter">
                {asset.status}
              </span>
            </div>
            
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm">
                <Package size={16} className="text-gray-400" />
                <span className="font-mono text-gray-600">{asset.serialNumber || "No Serial"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-600">{asset.location || "Not specified"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}