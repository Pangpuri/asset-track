import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config();

export default defineConfig({
  schema: "./db/schema/index.ts", // ชี้ไปที่ไฟล์ index ที่รวบรวมทุก schema
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  verbose: true,
  strict: false, // ปิดโหมดเข้มงวดเพื่อเลี่ยงบั๊ก introspection
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
