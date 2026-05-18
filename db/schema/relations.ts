import { relations } from "drizzle-orm";
import { assets } from "./assets";
import { logs } from "./logs";
import { services } from "./services";

/**
 * ความสัมพันธ์ระหว่างตาราง (Relations)
 * One-to-Many relationships สำหรับ Drizzle ORM
 */

// Asset -> Logs (หนึ่ง asset มีหลาย logs)
export const assetsToLogs = relations(assets, ({ many }) => ({
  logs: many(logs),
}));

// Logs -> Asset (ย้อนกลับ)
export const logsToAssets = relations(logs, ({ one }) => ({
  asset: one(assets, {
    fields: [logs.assetId],
    references: [assets.id],
  }),
}));

// Asset -> Services (หนึ่ง asset มีหลาย services)
export const assetsToServices = relations(assets, ({ many }) => ({
  services: many(services),
}));

// Services -> Asset (ย้อนกลับ)
export const servicesToAssets = relations(services, ({ one }) => ({
  asset: one(assets, {
    fields: [services.assetId],
    references: [assets.id],
  }),
}));
