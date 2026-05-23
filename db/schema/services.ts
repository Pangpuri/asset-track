import { pgTable, text, timestamp, uuid, varchar, pgEnum, jsonb, decimal } from "drizzle-orm/pg-core";
import { assets } from "./assets";

// สถานะของตั๋วแจ้งซ่อม/บริการ
export const serviceStatusEnum = pgEnum("service_status", [
  "pending",     // รอดำเนินการ
  "in_progress", // กำลังซ่อม
  "resolved",    // ซ่อมเสร็จแล้ว
  "cancelled",   // ยกเลิก
  "on_hold"      // หยุดไว้ชั่วคราว
]);

// ระดับความสำคัญ
export const priorityEnum = pgEnum("priority", [
  "low",
  "medium",
  "high",
  "critical"
]);

// 2.4 ตารางแจ้งซ่อม/บริการ (Services)
export const services = pgTable("services", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").references(() => assets.id, { onDelete: "cascade" }).notNull(),
  
  // ข้อมูลการแจ้ง (จาก User)
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  reportedBy: varchar("reported_by", { length: 100 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 20 }),
  currentLocation: text("current_location"), // ตำแหน่งที่พบปัญหา
  
  // ข้อมูลการจัดการ (สำหรับ Admin)
  status: serviceStatusEnum("status").default("pending").notNull(),
  priority: priorityEnum("priority").default("medium"),
  
  serviceType: varchar("service_type", { length: 50 }), // repair, maintenance, replace
  
  assignedTo: varchar("assigned_to", { length: 100 }), // ช่าง/Admin ที่รับงาน
  resolutionNotes: text("resolution_notes"),        // บันทึกการแก้ไข
  repairCost: decimal("repair_cost", { precision: 12, scale: 2 }),
  
  resolvedAt: timestamp("resolved_at"),
  
  // ภาพถ่าย (เก็บ URLs ใน JSONB)
  attachments: jsonb("attachments").$type<{
    images?: string[];
  }>(),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
