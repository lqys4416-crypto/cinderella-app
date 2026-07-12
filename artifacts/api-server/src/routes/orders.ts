import { Router } from "express";
import { eq, and, or, ilike, sql } from "drizzle-orm";
import { db, ordersTable, productsTable, usersTable, notificationsTable } from "@workspace/db";
import { authMiddleware, adminOnly } from "../middlewares/auth";

const router = Router();

async function formatOrder(o: typeof ordersTable.$inferSelect) {
  const products = await db.select({ name: productsTable.name }).from(productsTable).where(eq(productsTable.id, o.productId)).limit(1);
  const users = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, o.marketerId)).limit(1);
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    customerName: o.customerName,
    phone: o.phone,
    province: o.province ?? null,
    district: o.district ?? null,
    address: o.address ?? null,
    productId: o.productId,
    productName: products[0]?.name ?? null,
    quantity: o.quantity,
    salePrice: parseFloat(o.salePrice),
    paymentMethod: o.paymentMethod ?? null,
    deliveryCompany: o.deliveryCompany ?? null,
    trackingNumber: o.trackingNumber ?? null,
    notes: o.notes ?? null,
    marketerId: o.marketerId,
    marketerName: users[0]?.name ?? null,
    status: o.status,
    marketerProfit: o.marketerProfit ? parseFloat(o.marketerProfit) : null,
    companyProfit: o.companyProfit ? parseFloat(o.companyProfit) : null,
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  };
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
  return `CT-${timestamp}-${random}`;
}

// GET /orders
router.get("/", authMiddleware, async (req, res) => {
  const { status, marketerId, search, province, productId } = req.query;
  const isAdmin = req.user!.role === "admin";
  const currentUserId = req.user!.userId;

  let query = db.select().from(ordersTable);

  const conditions = [];

  // Marketers can only see their own orders
  if (!isAdmin) {
    conditions.push(eq(ordersTable.marketerId, currentUserId));
  } else if (marketerId) {
    conditions.push(eq(ordersTable.marketerId, parseInt(marketerId as string)));
  }

  if (status) {
    conditions.push(eq(ordersTable.status, status as typeof ordersTable.$inferSelect["status"]));
  }

  if (province) {
    conditions.push(ilike(ordersTable.province, `%${province}%`));
  }

  if (productId) {
    conditions.push(eq(ordersTable.productId, parseInt(productId as string)));
  }

  if (search) {
    const s = `%${search}%`;
    conditions.push(
      or(
        ilike(ordersTable.customerName, s),
        ilike(ordersTable.phone, s),
        ilike(ordersTable.orderNumber, s),
      )!
    );
  }

  const orders = conditions.length > 0
    ? await db.select().from(ordersTable).where(and(...conditions)).orderBy(sql`${ordersTable.createdAt} DESC`)
    : await db.select().from(ordersTable).orderBy(sql`${ordersTable.createdAt} DESC`);

  const formatted = await Promise.all(orders.map(formatOrder));
  res.json(formatted);
});

// POST /orders
router.post("/", authMiddleware, async (req, res) => {
  const { customerName, phone, province, district, address, productId, quantity, salePrice, paymentMethod, deliveryCompany, trackingNumber, notes } = req.body;

  if (!customerName || !phone || !productId || !quantity || !salePrice) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const orderNumber = generateOrderNumber();
  const marketerId = req.user!.userId;

  const [order] = await db.insert(ordersTable).values({
    orderNumber,
    customerName,
    phone,
    province: province ?? null,
    district: district ?? null,
    address: address ?? null,
    productId: parseInt(productId),
    quantity: parseInt(quantity),
    salePrice: String(salePrice),
    paymentMethod: paymentMethod ?? null,
    deliveryCompany: deliveryCompany ?? null,
    trackingNumber: trackingNumber ?? null,
    notes: notes ?? null,
    marketerId,
    status: "new",
  }).returning();

  // Notify all admins
  const admins = await db.select({ id: usersTable.id }).from(usersTable).where(eq(usersTable.role, "admin"));
  if (admins.length > 0) {
    await db.insert(notificationsTable).values(
      admins.map((a) => ({
        userId: a.id,
        type: "new_order" as const,
        message: `طلب جديد من ${customerName} - رقم الطلب: ${orderNumber}`,
        read: false,
      }))
    );
  }

  const formatted = await formatOrder(order);
  res.status(201).json(formatted);
});

// GET /orders/:id
router.get("/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
  const order = orders[0];

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  // Marketers can only see their own orders
  if (req.user!.role !== "admin" && order.marketerId !== req.user!.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  res.json(await formatOrder(order));
});

// PATCH /orders/:id
router.patch("/:id", authMiddleware, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  const orders = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
  const order = orders[0];

  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const isAdmin = req.user!.role === "admin";
  if (!isAdmin) {
    if (order.marketerId !== req.user!.userId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (order.status !== "new") {
      res.status(403).json({ error: "Can only edit new orders" });
      return;
    }
  }

  const { customerName, phone, province, district, address, productId, quantity, salePrice, paymentMethod, deliveryCompany, trackingNumber, notes } = req.body;

  const updates: Record<string, unknown> = { updatedAt: new Date() };
  if (customerName !== undefined) updates.customerName = customerName;
  if (phone !== undefined) updates.phone = phone;
  if (province !== undefined) updates.province = province;
  if (district !== undefined) updates.district = district;
  if (address !== undefined) updates.address = address;
  if (productId !== undefined) updates.productId = parseInt(productId);
  if (quantity !== undefined) updates.quantity = parseInt(quantity);
  if (salePrice !== undefined) updates.salePrice = String(salePrice);
  if (paymentMethod !== undefined) updates.paymentMethod = paymentMethod;
  if (deliveryCompany !== undefined) updates.deliveryCompany = deliveryCompany;
  if (trackingNumber !== undefined) updates.trackingNumber = trackingNumber;
  if (notes !== undefined) updates.notes = notes;

  const [updated] = await db.update(ordersTable).set(updates).where(eq(ordersTable.id, id)).returning();
  res.json(await formatOrder(updated));
});

// DELETE /orders/:id
router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  await db.delete(ordersTable).where(eq(ordersTable.id, id));
  res.json({ success: true, message: "Deleted" });
});

// PATCH /orders/:id/status
router.patch("/:id/status", authMiddleware, async (req, res) => {
  const id = parseInt(req.params["id"] as string);
  const { status } = req.body;

  if (!status) {
    res.status(400).json({ error: "Status is required" });
    return;
  }

  const orders = await db.select().from(ordersTable).where(eq(ordersTable.id, id)).limit(1);
  const order = orders[0];
  if (!order) {
    res.status(404).json({ error: "Order not found" });
    return;
  }

  const updates: Record<string, unknown> = { status, updatedAt: new Date() };

  // Calculate commission when status changes to delivered
  if (status === "delivered" && order.status !== "delivered") {
    const products = await db.select().from(productsTable).where(eq(productsTable.id, order.productId)).limit(1);
    const product = products[0];
    const marketer = (await db.select().from(usersTable).where(eq(usersTable.id, order.marketerId)).limit(1))[0];

    if (product && marketer) {
      const productProfit = parseFloat(product.profit) * order.quantity;
      const commissionRate = parseFloat(marketer.commissionRate) / 100;
      const marketerProfit = productProfit * commissionRate;
      const companyProfit = productProfit - marketerProfit;

      updates.marketerProfit = String(marketerProfit);
      updates.companyProfit = String(companyProfit);

      // Update marketer balance
      const newBalance = parseFloat(marketer.balance) + marketerProfit;
      await db.update(usersTable).set({ balance: String(newBalance) }).where(eq(usersTable.id, marketer.id));

      // Notify marketer
      await db.insert(notificationsTable).values({
        userId: marketer.id,
        type: "commission" as const,
        message: `تم احتساب عمولتك: ${marketerProfit.toFixed(0)} د.ع على الطلب ${order.orderNumber}`,
        read: false,
      });
    }
  }

  // Notify marketer of status change
  await db.insert(notificationsTable).values({
    userId: order.marketerId,
    type: "status_change" as const,
    message: `تم تغيير حالة الطلب ${order.orderNumber} إلى: ${status}`,
    read: false,
  });

  const [updated] = await db.update(ordersTable).set(updates).where(eq(ordersTable.id, id)).returning();
  res.json(await formatOrder(updated));
});

export default router;
