import { pgTable, text, timestamp, uuid, varchar, foreignKey } from "drizzle-orm/pg-core";
import { assets } from "./assets";

/**
 * ตารางประวัติการเคลื่อนไหว (Logs)
 * บันทึกทุกครั้งที่มีการส่งมอบ, ย้ายสถานที่, หรือเปลี่ยนแปลงอุปกรณ์
 */
export const logs = pgTable(
  "logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    assetId: uuid("asset_id").notNull(),
    
    // ข้อมูลการเคลื่อนไหว
    action: varchar("action", { length: 50 }).notNull(), // assign, transfer, return, damage, lost, repair
    
    // จุดติดตั้ง/ตำแหน่ง
    location: text("location"),
    department: text("department"), // แผนกที่รับเบิก
    
    // ข้อมูลผู้ที่เกี่ยวข้อง
    assignedTo: varchar("assigned_to", { length: 100 }), // ชื่อผู้รับเบิก
    assignedBy: varchar("assigned_by", { length: 100 }), // ชื่อผู้ส่งมอบ
    
    // วันที่สำคัญ
    deliveryDate: timestamp("delivery_date"),
    returnDate: timestamp("return_date"),
    
    // หมายเหตุเพิ่มเติม
    notes: text("notes"),
    
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
