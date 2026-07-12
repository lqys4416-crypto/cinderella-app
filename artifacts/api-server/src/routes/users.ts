import { Router } from "express";
import bcrypt from "bcryptjs";
import { eq, count, and } from "drizzle-orm";
import { db, usersTable, ordersTable } from "@workspace/db";
import { authMiddleware, adminOnly } from "../middlewares/auth";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    commissionRate: parseFloat(user.commissionRate),
    balance: parseFloat(user.balance),
    createdAt: user.createdAt.toISOString(),
  };
}

// GET /users
router.get("/", authMiddleware, adminOnly, async (req, res) => {
  const users = await db.select().from(usersTable).orderBy(usersTable.createdAt);
  res.json(users.map(formatUser));
});

// POST /users
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  const { username, name, password, commissionRate } = req.body;
  if (!username || !name || !password) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(usersTable).values({
    username,
    name,
    passwordHash,
    role: "marketer",
    commissionRate: String(commissionRate ?? 30),
    balance: "0",
  }).returning();

  res.status(201).json(formatUser(user));
});

// GET /users/:id
router.get("/:id", authMiddleware, adminOnly, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  const users = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  if (!users[0]) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(users[0]));
});

// PATCH /users/:id
router.patch("/:id", authMiddleware, adminOnly, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  const { name, username, password, commissionRate } = req.body;

  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name;
  if (username !== undefined) updates.username = username;
  if (commissionRate !== undefined) updates.commissionRate = String(commissionRate);
  if (password) {
    updates.passwordHash = await bcrypt.hash(password, 10);
  }

  const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(formatUser(user));
});

// DELETE /users/:id
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  await db.delete(usersTable).where(eq(usersTable.id, id));
  res.json({ success: true, message: "Deleted" });
});

// GET /users/:id/stats
router.get("/:id/stats", authMiddleware, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  const users = await db.select().from(usersTable).where(eq(usersTable.id, id)).limit(1);
  const user = users[0];
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const [totalResult] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.marketerId, id));
  const [deliveredResult] = await db.select({ count: count() }).from(ordersTable).where(and(eq(ordersTable.marketerId, id), eq(ordersTable.status, "delivered")));
  const [cancelledResult] = await db.select({ count: count() }).from(ordersTable).where(and(eq(ordersTable.marketerId, id), eq(ordersTable.status, "cancelled")));

  res.json({
    id: user.id,
    name: user.name,
    totalOrders: totalResult.count,
    deliveredOrders: deliveredResult.count,
    cancelledOrders: cancelledResult.count,
    totalProfit: parseFloat(user.balance),
    commissionRate: parseFloat(user.commissionRate),
    balance: parseFloat(user.balance),
  });
});

export default router;
