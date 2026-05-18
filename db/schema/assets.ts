import { pgTable, text, timestamp, uuid, varchar, integer, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// 1. สถานะของอุปกรณ์
export const assetStatusEnum = pgEnum("asset_status", [
  "active",      // ปกติ/กำลังใช้งาน
  "maintenance", // กำลังซ่อม
  "broken",      // ชำรุด
  "lost",        // สูญหาย
  "retired",     // จำหน่ายออก/เลิกใช้งาน
  "pending"      // รอลงทะเบียน (สำหรับ QR เปล่า)
]);

// 2. ตารางหลัก: อุปกรณ์ (Assets) - รวมทุกประเภทในตารางเดียวเพื่อความง่ายในการทำ Dashboard
export const assets = pgTable("assets", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetCode: varchar("asset_code", { length: 50 }).unique(), // รหัสอุปกรณ์ (P001234) - ยอมให้ว่างสำหรับ QR เปล่า
  category: varchar("category", { length: 50 }), // computer, printer, network, monitor - ยอมให้ว่างสำหรับ QR เปล่า
  brand: text("brand"),
  model: text("model"),
  serialNumber: varchar("serial_number", { length: 100 }).unique(),
  location: text("location"), // จุดติดตั้ง
  
  // ข้อมูลเฉพาะตามประเภท (เก็บเป็น JSON เพื่อความยืดหยุ่น เช่น ไซส์จอ, ชื่อคอม)
  specifications: jsonb("specifications").$type<{
    monitorSize?: string;
    computerName?: string;
    ipAddress?: string;
    ram?: string;
    storage?: string;
  }>(),

  status: assetStatusEnum("status").default("active").notNull(),
  
  purchaseDate: timestamp("purchase_date"),
  warrantyExpire: timestamp("warranty_expire"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 3. ตารางผู้เบิก/พนักงาน (Employees)
export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),
  employeeId: varchar("employee_id", { length: 50 }).unique().notNull(), // รหัสพนักงาน
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. ตารางการมอบหมาย (Assignments) - เก็บประวัติว่าใครเคยถือเครื่องไหน
export const assignments = pgTable("assignments", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").references(() => assets.id).notNull(),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(), // วันที่ส่งมอบ
  returnedAt: timestamp("returned_at"), // วันที่คืน (ถ้ามี)
  note: text("note"),
});

// 5. ตารางแจ้งซ่อม (Service Requests)
export const serviceRequests = pgTable("service_requests", {
  id: uuid("id").defaultRandom().primaryKey(),
  assetId: uuid("asset_id").references(() => assets.id).notNull(),
  issue: text("issue").notNull(), // รายละเอียดปัญหา
  contactInfo: text("contact_info"), // เบอร์โทร/ชื่อคนแจ้ง (กรณีไม่ใช่เจ้าของเครื่อง)
  currentLocation: text("current_location"), // แจ้งจากจุดไหน
  status: text("status").default("pending").notNull(), // pending, in_progress, fixed, closed
  adminNote: text("admin_note"), // บันทึกจาก Admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// --- Relations Section ---

export const assetRelations = relations(assets, ({ many }) => ({
  assignments: many(assignments),
  services: many(serviceRequests),
}));

export const employeeRelations = relations(employees, ({ many }) => ({
  assignments: many(assignments),
}));

export const assignmentRelations = relations(assignments, ({ one }) => ({
  asset: one(assets, { fields: [assignments.assetId], references: [assets.id] }),
  employee: one(employees, { fields: [assignments.employeeId], references: [employees.id] }),
}));

export const serviceRelations = relations(serviceRequests, ({ one }) => ({
  asset: one(assets, { fields: [serviceRequests.assetId], references: [assets.id] }),
}));
