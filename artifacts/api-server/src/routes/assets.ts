import { Router } from "express";
import { eq, desc } from "drizzle-orm";
import { db, assetsTable } from "@workspace/db";
import { authMiddleware, adminOnly } from "../middlewares/auth";

const router = Router();

// GET /assets - List all assets
router.get("/", authMiddleware, async (req, res) => {
  const assets = await db.select().from(assetsTable).orderBy(desc(assetsTable.createdAt));
  res.json(assets);
});

// GET /assets/:id - Get single asset
router.get("/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id);
  const asset = await db.select().from(assetsTable).where(eq(assetsTable.id, id)).limit(1);
  if (asset.length === 0) {
    return res.status(404).json({ error: "Asset not found" });
  }
  res.json(asset[0]);
});

// POST /assets - Create new asset (Admin only)
router.post("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const newAsset = await db.insert(assetsTable).values(req.body).returning();
    res.status(201).json(newAsset[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PATCH /assets/:id - Update asset
router.patch("/:id", authMiddleware, adminOnly, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const updatedAsset = await db.update(assetsTable)
      .set({ ...req.body, updatedAt: new Date() })
      .where(eq(assetsTable.id, id))
      .returning();
    res.json(updatedAsset[0]);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /assets/:id - Delete asset
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  const id = parseInt(req.params.id);
  await db.delete(assetsTable).where(eq(assetsTable.id, id));
  res.json({ success: true });
});

export default router;
