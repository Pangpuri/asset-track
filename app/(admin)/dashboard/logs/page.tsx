"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  History, 
  User, 
  MapPin, 
  Calendar, 
  ArrowRight,
  Loader2,
  Package,
  ClipboardList
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  action: string;
  location: string | null;
  department: string | null;
  handledBy: string | null;
  actionDate: string;
  notes: string | null;
  asset: {
    assetCode: string;
    assetName: string;
  };
  employee: {
    name: string;
  } | null;
}

const actionMap: Record<string, { label: string; color: string; icon: any }> = {
  create: { label: "สร้างอุปกรณ์", color: "bg-blue-500", icon: Package },
  update: { label: "แก้ไขข้อมูล", color: "bg-amber-500", icon: ClipboardList },
  assign: { label: "ส่งมอบอุปกรณ์", color: "bg-emerald-500", icon: User },
  transfer: { label: "ย้ายสถานที่", color: "bg-purple-500", icon: MapPin },
  return: { label: "คืนอุปกรณ์", color: "bg-indigo-500", icon: History },
  damage: { label: "แจ้งชำรุด", color: "bg-rose-500", icon: Activity },
  retire: { label: "จำหน่ายออก", color: "bg-zinc-500", icon: History },
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch("/api/logs");
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">Loading History...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-4xl pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[1000] tracking-tight flex items-center gap-3 text-zinc-900 uppercase">
            <History className="h-8 w-8 text-indigo-600" />
            Activity Logs
          </h1>
          <p className="text-zinc-400 font-black text-[9px] uppercase tracking-[0.3em] mt-1 ml-0.5">System-wide audit trail</p>
        </div>
      </div>

      <div className="relative space-y-4">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-zinc-200 hidden sm:block" />

        {logs.length === 0 ? (
          <Card className="border-none shadow-sm rounded-3xl bg-zinc-50 p-12 text-center italic text-zinc-400 font-bold">
            ยังไม่มีประวัติการทำรายการในระบบ
          </Card>
        ) : (
          logs.map((log, index) => {
            const actionInfo = actionMap[log.action] || { label: log.action, color: "bg-zinc-400", icon: Activity };
            const ActionIcon = actionInfo.icon;

            return (
              <div key={log.id} className="relative pl-0 sm:pl-14 group">
                {/* Dot on Timeline */}
                <div className={cn(
                  "absolute left-[21px] top-6 w-3 h-3 rounded-full border-2 border-white shadow-sm z-10 hidden sm:block transition-transform group-hover:scale-150",
                  actionInfo.color
                )} />

                <Card className="border-none shadow-md rounded-[2rem] hover:shadow-xl transition-all duration-300 overflow-hidden bg-white">
                  <div className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                    {/* Action Icon Mobile/Desktop */}
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg text-white",
                      actionInfo.color
                    )}>
                      <ActionIcon size={24} />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={cn("text-[10px] font-black uppercase tracking-widest border-none text-white", actionInfo.color)}>
                          {actionInfo.label}
                        </Badge>
                        <span className="text-zinc-300">•</span>
                        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar size={12} />
                          {format(new Date(log.actionDate), "d MMM yyyy HH:mm", { locale: th })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-indigo-600 text-sm bg-indigo-50 px-2 py-0.5 rounded">
                          {log.asset.assetCode}
                        </span>
                        <ArrowRight size={14} className="text-zinc-300" />
                        <h3 className="font-black text-zinc-800 text-base">{log.asset.assetName}</h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm pt-1">
                        {log.employee && (
                          <div className="flex items-center gap-2 text-zinc-500">
                            <User size={14} className="text-zinc-300" />
                            <span className="font-bold">พนักงาน:</span>
                            <span className="text-zinc-900 font-black">{log.employee.name}</span>
                          </div>
                        )}
                        {log.location && (
                          <div className="flex items-center gap-2 text-zinc-500">
                            <MapPin size={14} className="text-zinc-300" />
                            <span className="font-bold">สถานที่:</span>
                            <span className="text-zinc-900 font-black">{log.location} {log.department ? `(${log.department})` : ""}</span>
                          </div>
                        )}
                      </div>

                      {log.notes && (
                        <div className="mt-3 p-3 bg-zinc-50 rounded-2xl border border-zinc-100 italic text-xs text-zinc-500 font-bold leading-relaxed">
                          "{log.notes}"
                        </div>
                      )}
                    </div>

                    {log.handledBy && (
                      <div className="md:text-right border-t md:border-t-0 md:border-l border-zinc-100 pt-4 md:pt-0 md:pl-6 shrink-0">
                        <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest mb-1">Processed By</p>
                        <p className="text-xs font-black text-zinc-600">{log.handledBy}</p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
