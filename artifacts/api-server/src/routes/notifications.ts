import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, notificationsTable } from "@workspace/db";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

function formatNotification(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id,
    userId: n.userId,
    type: n.type,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  };
}

// GET /notifications
router.get("/", authMiddleware, async (req, res) => {
  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, req.user!.userId))
    .orderBy(notificationsTable.createdAt);
  res.json(notifications.map(formatNotification));
});

// PATCH /notifications/read-all
router.patch("/read-all", authMiddleware, async (req, res) => {
  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(and(eq(notificationsTable.userId, req.user!.userId), eq(notificationsTable.read, false)));
  res.json({ success: true, message: "All notifications marked as read" });
});

// PATCH /notifications/:id/read
router.patch("/:id/read", authMiddleware, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  const [notification] = await db
    .update(notificationsTable)
    .set({ read: true })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, req.user!.userId)))
    .returning();
  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(formatNotification(notification));
});

export default router;
