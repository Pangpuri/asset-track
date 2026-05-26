import { sql } from "drizzle-orm";
import { pgTable, text, timestamp, uuid, varchar, pgEnum, jsonb, boolean, decimal } from "drizzle-orm/pg-core";

/**
 * --- ENUMS ---
 */

// สถานะของอุปกรณ์
export const assetStatusEnum = pgEnum("asset_status", [
  "active",      // ปกติ/กำลังใช้งาน
  "broken",      // ชำรุด
  "lost",        // สูญหาย
  "retired",     // จำหน่ายออก/เลิกใช้งาน
  "pending"      // รอลงทะเบียน (สำหรับ QR เปล่า)
]);

// ประเภทของการเคลื่อนไหว (Logs)
export const actionTypeEnum = pgEnum("action_type", [
  "create",    // สร้างใหม่
  "update",    // แก้ไขข้อมูล
  "assign",    // ส่งมอบให้พนักงาน
  "transfer",  // ย้ายสถานที่/แผนก
  "return",    // คืนอุปกรณ์
  "damage",    // รายงานความเสียหาย
  "lost"       // รายงานสูญหาย
]);

/**
 * --- TABLES ---
 */

// 2.1 ตารางหลัก: อุปกรณ์ (Assets)
export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  
  // ข้อมูลระบุตัวตน (ยอมให้ Null สำหรับ QR เปล่า)
  assetCode: varchar("asset_code", { length: 50 }).unique(), // เช่น P001234
  assetName: text("asset_name"), // ชื่ออุปกรณ์ (เช่น "คอมพิวเตอร์สำนักงาน")
  serialNumber: varchar("serial_number", { length: 100 }).unique(),
  
  // หมวดหมู่และประเภท
  category: varchar("category", { length: 50 }), // computer, printer, network, monitor, etc.
  brand: text("brand"),
  model: text("model"),
  
  // สถานะและตำแหน่ง
  status: assetStatusEnum("status").default("pending").notNull(),
  location: text("location"),   // สถานที่ติดตั้งปัจจุบัน
  department: text("department"), // แผนกที่ดูแล/ใช้งาน
  factory: text("factory"), // โรงงานที่ใช้งาน (สำหรับอุปกรณ์ที่มีการย้ายหลายแผนก)
  //ประวัติการลบอุปกรณ์ (Soft Delete)
  deletedAt: timestamp("deleted_at", { withTimezone: true }).default(sql`null`),
  // ข้อมูลเฉพาะตามประเภท (เก็บเป็น JSONB)
  specifications: jsonb("specifications").$type<{
    assetcode?: string;
    computerName?: string;
    ipAddress?: string;
    cpu?: string;
    ram?: string;
    storage?: string;
    os?: string;
    monitorSize?: string;
    printerType?: string; // Laser, Inkjet
    [key: string]: unknown; 
  }>(),

  // ข้อมูลการจัดซื้อและประกัน
  price: decimal("price", { precision: 12, scale: 2 }), // ราคาซื้อ
  vendor: text("vendor"),             // ผู้จัดจำหน่าย/ร้านค้า
  purchaseDate: timestamp("purchase_date"),
  warrantyExpire: timestamp("warranty_expire"),
  receivedBy: text("received_by"),    // เพิ่มคอลัมน์ผู้รับมอบ
  deliveredBy: text("delivered_by"),  // เพิ่มคอลัมน์ผู้ส่งมอบ
  
  // การติดตามข้อมูล
  isComplete: boolean("is_complete").default(false).notNull(), // บันทึกว่าข้อมูลกรอกครบหรือยัง
  notes: text("notes"), // หมายเหตุเพิ่มเติม
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2.2 ตารางผู้ใช้งาน/พนักงาน (Employees) - สำหรับอ้างอิงตอนส่งมอบ
export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: varchar("employee_id", { length: 50 }).unique().notNull(), // รหัสพนักงาน
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }),
  department: text("department"),
  email: varchar("email", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
