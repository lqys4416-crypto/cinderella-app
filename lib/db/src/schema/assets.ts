import { pgTable, serial, text, timestamp, pgEnum, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const assetStatusEnum = pgEnum("asset_status", ["available", "in_use", "maintenance", "retired"]);

export const assetsTable = pgTable("assets", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // e.g., Electronics, Furniture, Vehicle
  serialNumber: text("serial_number").unique(),
  status: assetStatusEnum("status").notNull().default("available"),
  location: text("location"),
  assignedTo: integer("assigned_to").references(() => usersTable.id),
  purchaseDate: timestamp("purchase_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertAssetSchema = createInsertSchema(assetsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assetsTable.$inferSelect;
