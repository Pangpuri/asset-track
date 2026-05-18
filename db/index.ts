import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/assets";
import * as logsSchema from "./schema/logs";
import * as servicesSchema from "./schema/services";
import * as relations from "./schema/relations";

const connectionString = process.env.DATABASE_URL!;

// สำหรับ Serverless Environment (Vercel) + Supabase
const client = postgres(connectionString, {
  prepare: false, 
  ssl: 'require', // บังคับ SSL สำหรับ Supabase
  max: 1,         // จำกัด connection ต่อ 1 instance เพื่อไม่ให้เกิน limit ของ Supabase
});

// รวมทุก schema เข้าด้วยกัน
const allSchema = {
  ...schema,
  ...logsSchema,
  ...servicesSchema,
  ...relations,
};

export const db = drizzle(client, { schema: allSchema });
