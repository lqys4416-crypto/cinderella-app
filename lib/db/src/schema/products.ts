import { pgTable, serial, text, numeric, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productStatusEnum = pgEnum("product_status", ["active", "inactive"]);

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  image: text("image"),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  profit: numeric("profit", { precision: 12, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(0),
  status: productStatusEnum("status").notNull().default("active"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
