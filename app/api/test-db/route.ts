import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  console.log("🔍 Starting DB Connection Test...");
  
  try {
    // 1. ตรวจสอบว่า Environment Variable มาถึงไหม
    const hasUrl = !!process.env.DATABASE_URL;
    const urlMasked = process.env.DATABASE_URL 
      ? process.env.DATABASE_URL.split("@")[1] || "Hidden" 
      : "MISSING";

    // 2. ทดสอบ Query พื้นฐานที่สุด
    const start = Date.now();
    const result = await db.execute(sql`SELECT 1 as connected`);
    const duration = Date.now() - start;

    return NextResponse.json({
      status: "success",
      message: "Connected to Supabase successfully!",
      env: {
        hasDatabaseUrl: hasUrl,
        hostInfo: urlMasked
      },
      query: {
        result: result,
        durationMs: duration
      }
    });

  } catch (error: any) {
    console.error("❌ DB Test Failed:", error);
    
    return NextResponse.json({
      status: "error",
      message: error?.message || "Unknown database error",
      stack: error?.stack,
      env: {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      },
      hint: "Check if your DATABASE_URL is correct in Vercel and if Supabase is accepting connections."
    }, { status: 500 });
  }
}
