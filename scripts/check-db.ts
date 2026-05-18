import { db } from "../db";
import { sql } from "drizzle-orm";

async function checkTables() {
  try {
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables found in DB:");
    console.log(result);
  } catch (err) {
    console.error("Error checking tables:", err);
  } finally {
    process.exit(0);
  }
}

checkTables();
