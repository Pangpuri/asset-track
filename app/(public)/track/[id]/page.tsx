import { db } from "@/db";
import { assets } from "@/db/schema/assets";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Monitor, Printer, Network, Laptop, Wrench, History, QrCode, AlertTriangle, ChevronRight, Settings, MapPin, Tag, Package } from "lucide-react";
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

  // 1. Validation & Data Fetching Phase
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  if (!isUuid) return notFound();

  let asset;
  try {
    asset = await getAsset(id);
  } catch (err) {
    console.error("Error rendering TrackPage:", err);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <AlertTriangle size={48} className="text-black mb-4" />
        <h1 className="text-lg font-bold">System Error</h1>
        <p className="text-sm text-gray-400 mt-1">Unable to load asset information.</p>
        <Button variant="outline" className="mt-6 border-black text-black font-bold h-10 px-8" asChild>
          <Link href="/">RETRY</Link>
        </Button>
      </div>
    );
  }

  // Ensure asset is defined before proceeding to rendering
  if (!asset) return notFound();

  // 3. Main Rendering Phase
  const isPending = asset.status === "pending";
  const Icon = isPending ? QrCode :
               asset.category === "computer" ? Laptop : 
               asset.category === "printer" ? Printer :
               asset.category === "monitor" ? Monitor : Network;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      <div className="w-full max-w-lg">
        {/* Top Profile-style Header */}
        <div className="px-6 py-8 flex items-center gap-8 border-b border-gray-100">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border border-gray-200 p-[3px]">
              <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center text-black">
                 <Icon size={32} />
              </div>
            </div>
            {isPending && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-orange-500 rounded-full border-2 border-white flex items-center justify-center">
                 <Tag size={12} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4">
             <div className="flex items-center gap-2">
               <h1 className="text-xl font-medium tracking-tight">
                 {isPending ? "Pending Device" : (asset.assetCode || "No Code")}
               </h1>
               <Settings size={18} className="text-black ml-auto" />
             </div>
             
             <div className="flex gap-6">
                <div className="text-center">
                  <p className="text-sm font-bold">1</p>
                  <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Asset</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">0</p>
                  <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Logs</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold">Live</p>
                  <p className="text-[10px] uppercase text-gray-400 font-bold tracking-widest">Status</p>
                </div>
             </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="px-6 py-4 space-y-1">
           <p className="text-sm font-bold text-black">{asset.brand || "Generic"} {asset.model || "Device"}</p>
           <p className="text-sm text-gray-700 leading-snug">
             {isPending ? "This QR sticker has not been registered yet. Please click 'Register' below to add it to the system." : 
             `Category: ${asset.category || 'General'} | S/N: ${asset.serialNumber || 'N/A'}`}
           </p>
           <div className="flex items-center gap-1 text-gray-400 mt-2">
              <MapPin size={12} />
              <span className="text-xs font-medium">{asset.location || "Location Unknown"}</span>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 grid grid-cols-2 gap-2">
           <Link href={`/track/${asset.id}/register`} className="w-full">
              <Button className="w-full bg-black text-white text-xs font-bold h-9 border-0">
                {isPending ? "REGISTER NOW" : "LOG DELIVERY"}
              </Button>
           </Link>
           {!isPending && (
             <Link href={`/track/${asset.id}/services`} className="w-full">
                <Button variant="outline" className="w-full border-gray-200 text-black text-xs font-bold h-9">
                  REPORT ISSUE
                </Button>
             </Link>
           )}
        </div>

        {/* Content Area - IG Grid Style Placeholder */}
        <div className="mt-4 border-t border-gray-100">
           <div className="flex justify-center py-3 border-b border-gray-100 gap-12">
              <Package size={20} className="text-black border-t-2 border-black pt-1 -mt-3.5" />
              <History size={20} className="text-gray-300" />
           </div>
           
           <div className="grid grid-cols-3 gap-[2px]">
              <div className="aspect-square bg-gray-50 flex items-center justify-center text-gray-200">
                 <Icon size={24} />
              </div>
              {[1,2,3,4,5].map(i => (
                 <div key={i} className="aspect-square bg-gray-50" />
              ))}
           </div>
        </div>

        <div className="p-8 text-center">
           <Link href="/dashboard" className="text-[10px] font-bold text-gray-300 uppercase tracking-[0.2em] hover:text-black transition-colors">
              MIS Department Management
           </Link>
        </div>
      </div>
    </div>
  );
}