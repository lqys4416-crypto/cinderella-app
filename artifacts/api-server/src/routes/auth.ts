import { Router } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { signToken, authMiddleware } from "../middlewares/auth";

const router = Router();

// POST /auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "Username and password are required" });
    return;
  }

  const users = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  const user = users[0];

  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const token = signToken({ userId: user.id, role: user.role });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      commissionRate: parseFloat(user.commissionRate),
      balance: parseFloat(user.balance),
      createdAt: user.createdAt.toISOString(),
    },
  });
});

// POST /auth/logout
router.post("/logout", (req, res) => {
  res.json({ success: true, message: "Logged out" });
});

// GET /auth/me
router.get("/me", authMiddleware, async (req, res) => {
  const users = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
  const user = users[0];

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json({
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    commissionRate: parseFloat(user.commissionRate),
    balance: parseFloat(user.balance),
    createdAt: user.createdAt.toISOString(),
  });
});

export default router;
