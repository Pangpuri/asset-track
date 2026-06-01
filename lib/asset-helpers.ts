import { assets } from "@/db/schema";
import { isNull, and, or, ilike, eq } from "drizzle-orm";

/**
 * แผนผังคำนำหน้าสำหรับประเภทอุปกรณ์
 */
export const prefixMap: Record<string, string> = {
  computer: "PC",
  printer: "PT",
  monitor: "MO",
  network: "NW",
  other: "E",
};

/**
 * แผนผังรหัสสำหรับโรงงาน
 */
export const factoryMap: Record<string, string> = {
  "โรงงาน 1": "1",
  "โรงงาน 2": "2",
  "อื่นๆ": "E",
  "ทั้ง 2 โรงงาน": "E",
};

/**
 * ตรวจสอบว่าสถานะที่ส่งมาควรทำการ Soft Delete หรือไม่
 */
export function isSoftDeleteStatus(status?: string | null) {
  return status === "retired" || status === "lost";
}

/**
 * Logic สำหรับการเตรียมข้อมูล Specifications ตามประเภทอุปกรณ์
 */
export function formatSpecifications(data: any) {
  const { computerName, monitorSize, ipAddress } = data;
  return {
    ...(computerName && { computerName }),
    ...(monitorSize && { monitorSize }),
    ...(ipAddress && { ipAddress }),
  };
}

/**
 * มาตรฐานการ Query ข้อมูลที่ยังไม่ถูกลบ (Soft Delete)
 */
export const activeOnly = isNull(assets.deletedAt);

/**
 * Logic การกรองข้อมูลที่ยังไม่สมบูรณ์ (Incomplete)
 * สถานะเป็น active แต่ขาดข้อมูลสำคัญ (S/N, Brand, หรือ Location)
 */
export const isIncomplete = and(
  eq(assets.status, "active"),
  or(
    isNull(assets.serialNumber),
    eq(assets.serialNumber, ""),
    isNull(assets.brand),
    eq(assets.brand, ""),
    isNull(assets.location),
    eq(assets.location, "")
  )
);

/**
 * Logic การค้นหาข้อมูล (Search)
 */
export function buildSearchCondition(q: string) {
  return or(
    ilike(assets.assetCode, `%${q}%`),
    ilike(assets.assetName, `%${q}%`),
    ilike(assets.serialNumber, `%${q}%`),
    ilike(assets.brand, `%${q}%`),
    ilike(assets.model, `%${q}%`),
    ilike(assets.location, `%${q}%`),
    ilike(assets.department, `%${q}%`),
    ilike(assets.factory, `%${q}%`)
  );
}
