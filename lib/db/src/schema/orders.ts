import { pgTable, serial, text, numeric, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { productsTable } from "./products";

export const orderStatusEnum = pgEnum("order_status", [
  "new",
  "confirmed",
  "preparing",
  "shipped",
  "delivering",
  "delivered",
  "cancelled",
  "returned",
]);

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  province: text("province"),
  district: text("district"),
  address: text("address"),
  productId: integer("product_id").notNull().references(() => productsTable.id),
  quantity: integer("quantity").notNull().default(1),
  salePrice: numeric("sale_price", { precision: 12, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"),
  deliveryCompany: text("delivery_company"),
  trackingNumber: text("tracking_number"),
  notes: text("notes"),
  marketerId: integer("marketer_id").notNull().references(() => usersTable.id),
  status: orderStatusEnum("status").notNull().default("new"),
  marketerProfit: numeric("marketer_profit", { precision: 12, scale: 2 }),
  companyProfit: numeric("company_profit", { precision: 12, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
