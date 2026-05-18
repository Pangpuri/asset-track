import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/assets";
import * as logsSchema from "./schema/logs";
import * as servicesSchema from "./schema/services";
import * as relations from "./schema/relations";

const connectionString = process.env.DATABASE_URL!;

// แยกเฉพาะส่วน URL หลักออกมา (ตัด query params ออกถ้ามีปัญหา)
const client = postgres(connectionString, {
  prepare: false, // จำเป็นสำหรับบาง Provider เช่น Supabase/Neon ที่ใช้ connection pooling
});

// รวมทุก schema เข้าด้วยกัน
const allSchema = {
  ...schema,
  ...logsSchema,
  ...servicesSchema,
  ...relations,
};

export const db = drizzle(client, { schema: allSchema });
