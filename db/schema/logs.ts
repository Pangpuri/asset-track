import { pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { assets, employees, actionTypeEnum } from "./assets";

// 2.3 ตารางประวัติการเคลื่อนไหว (Logs)
export const logs = pgTable("logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").references(() => assets.id, { onDelete: "cascade" }).notNull(),
  
  action: actionTypeEnum("action").notNull(),
  
  // รายละเอียดการเปลี่ยนแปลง
  location: text("location"),
  department: text("department"),
  
  // ผู้ที่เกี่ยวข้อง
  assignedToId: uuid("assigned_to_id").references(() => employees.id), // เชื่อมกับพนักงาน (ถ้ามี)
  handledBy: varchar("handled_by", { length: 100 }), // ชื่อ Admin หรือผู้ดำเนินการ
  
  // วันที่และหมายเหตุ
  actionDate: timestamp("action_date").defaultNow(),
  condition: text("condition"), // สภาพอุปกรณ์ตอนบันทึก
  notes: text("notes"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
