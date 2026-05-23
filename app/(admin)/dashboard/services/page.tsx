import { db } from "@/db";
import { services } from "@/db/schema/services";
import { assets } from "@/db/schema/assets";
import { desc, eq } from "drizzle-orm";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Clock, CheckCircle2, AlertTriangle, Timer } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { ServiceStatusUpdate } from "@/components/service-status-update";

export const dynamic = "force-dynamic";

async function getServiceTickets() {
  try {
    return await db
      .select({
        id: services.id,
        title: services.title,
        status: services.status,
        priority: services.priority,
        serviceType: services.serviceType,
        reportedBy: services.reportedBy,
        createdAt: services.createdAt,
        assetCode: assets.assetCode,
        category: assets.category,
      })
      .from(services)
      .leftJoin(assets, eq(services.assetId, assets.id))
      .orderBy(desc(services.createdAt));
  } catch (error) {
    console.error("Error in getServiceTickets:", error);
    return [];
  }
}

export default async function ServicesPage() {
  const tickets = await getServiceTickets();

  return (
    <div className="container mx-auto p-6 space-y-8 relative">
      {tickets.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 p-4 rounded-xl flex items-center gap-3 mb-4">
          <AlertTriangle className="h-5 w-5" />
          <p className="text-sm font-bold">ไม่พบรายการแจ้งซ่อม หรือมีปัญหาในการเชื่อมต่อฐานข้อมูล</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">รายการแจ้งซ่อม (Service Tickets)</h1>
          <p className="text-muted-foreground">จัดการและติดตามสถานะการแก้ไขอุปกรณ์</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-orange-200 bg-orange-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" /> รอดำเนินการ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {tickets.filter(t => t.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Timer className="h-4 w-4 text-blue-600" /> กำลังดำเนินการ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {tickets.filter(t => t.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50">
                <TableHead>วันที่แจ้ง</TableHead>
                <TableHead>อุปกรณ์</TableHead>
                <TableHead>หัวข้อปัญหา</TableHead>
                <TableHead>ผู้แจ้ง</TableHead>
                <TableHead>ความเร่งด่วน</TableHead>
                <TableHead className="text-right">สถานะ / การจัดการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="text-xs">
                    {format(new Date(ticket.createdAt), "dd MMM yy HH:mm", { locale: th })}
                  </TableCell>
                  <TableCell>
                    <div className="font-mono font-bold text-blue-700">{ticket.assetCode}</div>
                    <div className="text-[10px] text-muted-foreground uppercase">{ticket.category}</div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col gap-1">
                      <span>{ticket.title}</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className={`text-[10px] h-4 px-1 ${ticket.serviceType === 'replacement' ? 'border-orange-200 text-orange-600 bg-orange-50' : ''}`}>
                          {ticket.serviceType === 'replacement' ? 'ขอเปลี่ยนเครื่อง' : 
                           ticket.serviceType === 'repair' ? 'ส่งซ่อม' : ticket.serviceType}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{ticket.reportedBy}</TableCell>
                  <TableCell>
                    <Badge variant={ticket.priority === 'critical' ? 'destructive' : ticket.priority === 'high' ? 'destructive' : 'secondary'}>
                      {ticket.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <ServiceStatusUpdate id={ticket.id} currentStatus={ticket.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}