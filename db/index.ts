import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

const connectionString = process.env.DATABASE_URL || "";

/**
 * สำหรับการเชื่อมต่อ Supabase บน Serverless (Vercel)
 * เราใช้ postgres-js พร้อมการตั้งค่าที่เหมาะสมกับ Connection Pooler (Port 6543)
 */
const client = postgres(connectionString, {
  prepare: false,      // ต้องเป็น false เมื่อใช้ Supabase Transaction Pooler (Port 6543)
  ssl: 'require',      // Supabase บังคับใช้ SSL
  max: 1,              // สำคัญ: Serverless 1 ฟังก์ชันควรเปิดแค่ 1 connection
  idle_timeout: 20,    // ปิด connection ที่ไม่ได้ใช้งานใน 20 วินาที
  connect_timeout: 10, // timeout ถ้าเชื่อมต่อไม่ได้ใน 10 วินาที
});

export const db = drizzle(client, { schema });
