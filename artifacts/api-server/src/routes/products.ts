import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, productsTable, notificationsTable, usersTable } from "@workspace/db";
import { authMiddleware, adminOnly } from "../middlewares/auth";

const router = Router();

function formatProduct(p: typeof productsTable.$inferSelect) {
  return {
    id: p.id,
    name: p.name,
    image: p.image ?? null,
    price: parseFloat(p.price),
    profit: parseFloat(p.profit),
    quantity: p.quantity,
    status: p.status,
    description: p.description ?? null,
    createdAt: p.createdAt.toISOString(),
  };
}

// GET /products
router.get("/", authMiddleware, async (req, res) => {
  const products = await db.select().from(productsTable).orderBy(productsTable.createdAt);
  res.json(products.map(formatProduct));
});

// POST /products
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  const { name, image, price, profit, quantity, status, description } = req.body;
  if (!name || price === undefined || profit === undefined) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const [product] = await db.insert(productsTable).values({
    name,
    image: image ?? null,
    price: String(price),
    profit: String(profit),
    quantity: quantity ?? 0,
    status: status ?? "active",
    description: description ?? null,
  }).returning();

  // Notify all marketers
  const marketers = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.role, "marketer"));
  if (marketers.length > 0) {
    await db.insert(notificationsTable).values(
      marketers.map((m) => ({
        userId: m.id,
        type: "new_product" as const,
        message: `تم إضافة منتج جديد: ${name}`,
        read: false,
      }))
    );
  }

  res.status(201).json(formatProduct(product));
});

// GET /products/:id
router.get("/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  const products = await db.select().from(productsTable).where(eq(productsTable.id, id)).limit(1);
  if (!products[0]) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(formatProduct(products[0]));
});

// PATCH /products/:id
router.patch("/:id", authMiddleware, adminOnly, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  const { name, image, price, profit, quantity, status, description } = req.body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (image !== undefined) updates.image = image;
  if (price !== undefined) updates.price = String(price);
  if (profit !== undefined) updates.profit = String(profit);
  if (quantity !== undefined) updates.quantity = quantity;
  if (status !== undefined) updates.status = status;
  if (description !== undefined) updates.description = description;

  const [product] = await db.update(productsTable).set(updates).where(eq(productsTable.id, id)).returning();
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  res.json(formatProduct(product));
});

// DELETE /products/:id
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  await db.delete(productsTable).where(eq(productsTable.id, id));
  res.json({ success: true, message: "Deleted" });
});

export default router;
