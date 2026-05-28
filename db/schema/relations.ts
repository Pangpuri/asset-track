import { relations } from "drizzle-orm";
import { assets, employees } from "./assets";
import { logs } from "./logs";

export const employeeRelations = relations(employees, ({ many }) => ({
  logs: many(logs),
}));

export const logRelations = relations(logs, ({ one }) => ({
  asset: one(assets, { fields: [logs.assetId], references: [assets.id] }),
  employee: one(employees, { fields: [logs.assignedToId], references: [employees.id] }),
}));
