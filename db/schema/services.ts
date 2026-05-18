import { pgTable, text, timestamp, uuid, varchar, pgEnum, jsonb, boolean, foreignKey } from "drizzle-orm/pg-core";
import { assets } from "./assets";

/**
 * Enum สำหรับสถานะของตั๋ว Service
 */
export const serviceStatusEnum = pgEnum("service_status", [
  "pending",     // รอดำเนินการ
  "in_progress", // กำลังซ่อม
  "resolved",    // ซ่อมเสร็จแล้ว
  "cancelled",   // ยกเลิก
  "on_hold"      // หยุดไว้ชั่วคราว
]);

/**
 * Enum ระดับความสำคัญ
 */
export const priorityEnum = pgEnum("priority", [
  "low",
  "medium",
  "high",
  "critical"
]);

/**
 * ตารางการร้องเรียน/แจ้งซ่อม (Services)
 * เก็บตั๋วแจ้งปัญหาและการแก้ไขจากผู้ใช้
 */
export const services = pgTable(
  "services",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assetId: uuid("asset_id").notNull(),
    
    // ข้อมูลการร้องเรียน
    title: varchar("title", { length: 200 }).notNull(), // ชื่อปัญหา เช่น "หน้าจออเสียหาย"
    description: text("description"), // รายละเอียดปัญหา
    
    // ประเภท
    serviceType: varchar("service_type", { length: 50 }).notNull(), // complaint, maintenance, repair, replacement
    
    // ข้อมูลการแจ้ง
    reportedBy: varchar("reported_by", { length: 100 }).notNull(), // ชื่อผู้แจ้ง
    reportedAt: timestamp("reported_at").defaultNow().notNull(), // วันเวลาที่แจ้ง
    
    // สถานที่
    location: text("location"), // ตำแหน่งอุปกรณ์ (แผนก, หรือจุด)
    
    // ข้อมูลการดำเนินการ
    status: serviceStatusEnum("status").default("pending").notNull(),
    priority: priorityEnum("priority").default("medium"),
    
    assignedTo: varchar("assigned_to", { length: 100 }), // ผู้รับผิดชอบซ่อม
    assignedAt: timestamp("assigned_at"),
    
    resolvedBy: varchar("resolved_by", { length: 100 }), // ผู้ที่แก้ไข
    resolvedAt: timestamp("resolved_at"), // วันเวลาที่แก้ไข
    
    // บันทึกการแก้ไข
    resolutionNotes: text("resolution_notes"), // บันทึกอะไรเป็นอะไร/แก้ไขยังไง
    repairCost: varchar("repair_cost", { length: 50 }), // ค่าซ่อม (ถ้ามี)
    
    // ภาพและเอกสารเพิ่มเติม (เก็บเป็น JSON)
    attachments: jsonb("attachments").$type<{
      images?: string[]; // URLs ของรูปภาพ
      files?: string[];  // URLs ของไฟล์เอกสาร
    }>(),
    
    // สถานะการแจ้งเตือน
    notificationSent: boolean("notification_sent").default(false),
    
    // การติดตามเวลา
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.assetId],
      foreignColumns: [assets.id],
    }).onDelete("cascade"),
  ]
);
