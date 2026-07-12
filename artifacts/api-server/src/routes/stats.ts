import { Router } from "express";
import { eq, count, sql, and, gte, lt } from "drizzle-orm";
import { db, ordersTable, usersTable, productsTable } from "@workspace/db";
import { authMiddleware, adminOnly } from "../middlewares/auth";

const router = Router();

// GET /stats/dashboard (admin)
router.get("/dashboard", authMiddleware, adminOnly, async (req, res) => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayOrders] = await db.select({ count: count() }).from(ordersTable).where(gte(ordersTable.createdAt, todayStart));
  const [monthOrders] = await db.select({ count: count() }).from(ordersTable).where(gte(ordersTable.createdAt, monthStart));
  const [newOrders] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "new"));
  const [deliveredOrders] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "delivered"));
  const [cancelledOrders] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.status, "cancelled"));
  const [totalMarketers] = await db.select({ count: count() }).from(usersTable).where(eq(usersTable.role, "marketer"));
  const [totalProducts] = await db.select({ count: count() }).from(productsTable);

  const profitResult = await db.select({ total: sql<string>`COALESCE(SUM(company_profit), 0)` }).from(ordersTable).where(eq(ordersTable.status, "delivered"));

  // Top marketers
  const topMarketers = await db.select({
    id: usersTable.id,
    name: usersTable.name,
    commissionRate: usersTable.commissionRate,
    balance: usersTable.balance,
    totalOrders: count(ordersTable.id),
  })
    .from(usersTable)
    .leftJoin(ordersTable, eq(ordersTable.marketerId, usersTable.id))
    .where(eq(usersTable.role, "marketer"))
    .groupBy(usersTable.id)
    .orderBy(sql`count(${ordersTable.id}) DESC`)
    .limit(5);

  // Top products
  const topProducts = await db.select({
    id: productsTable.id,
    name: productsTable.name,
    totalSold: sql<number>`COALESCE(SUM(${ordersTable.quantity}), 0)`,
    totalRevenue: sql<number>`COALESCE(SUM(${ordersTable.salePrice}), 0)`,
  })
    .from(productsTable)
    .leftJoin(ordersTable, and(eq(ordersTable.productId, productsTable.id), eq(ordersTable.status, "delivered")))
    .groupBy(productsTable.id)
    .orderBy(sql`COALESCE(SUM(${ordersTable.quantity}), 0) DESC`)
    .limit(5);

  res.json({
    todayOrders: todayOrders.count,
    monthOrders: monthOrders.count,
    totalProfit: parseFloat(profitResult[0]?.total ?? "0"),
    totalMarketers: totalMarketers.count,
    totalProducts: totalProducts.count,
    newOrders: newOrders.count,
    deliveredOrders: deliveredOrders.count,
    cancelledOrders: cancelledOrders.count,
    topMarketers: topMarketers.map((m) => ({
      id: m.id,
      name: m.name,
      totalOrders: m.totalOrders,
      deliveredOrders: 0,
      cancelledOrders: 0,
      totalProfit: parseFloat(m.balance ?? "0"),
      commissionRate: parseFloat(m.commissionRate ?? "0"),
      balance: parseFloat(m.balance ?? "0"),
    })),
    topProducts: topProducts.map((p) => ({
      id: p.id,
      name: p.name,
      totalSold: Number(p.totalSold),
      totalRevenue: Number(p.totalRevenue),
    })),
  });
});

// GET /stats/marketer (current marketer)
router.get("/marketer", authMiddleware, async (req, res) => {
  const userId = req.user!.userId;

  const [total] = await db.select({ count: count() }).from(ordersTable).where(eq(ordersTable.marketerId, userId));
  const [delivered] = await db.select({ count: count() }).from(ordersTable).where(and(eq(ordersTable.marketerId, userId), eq(ordersTable.status, "delivered")));
  const [newOrders] = await db.select({ count: count() }).from(ordersTable).where(and(eq(ordersTable.marketerId, userId), eq(ordersTable.status, "new")));
  const [cancelled] = await db.select({ count: count() }).from(ordersTable).where(and(eq(ordersTable.marketerId, userId), eq(ordersTable.status, "cancelled")));

  const [commissionResult] = await db.select({ total: sql<string>`COALESCE(SUM(marketer_profit), 0)` }).from(ordersTable).where(and(eq(ordersTable.marketerId, userId), eq(ordersTable.status, "delivered")));

  const user = (await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1))[0];

  const recentOrders = await db.select().from(ordersTable).where(eq(ordersTable.marketerId, userId)).orderBy(sql`${ordersTable.createdAt} DESC`).limit(5);

  const formattedRecent = await Promise.all(recentOrders.map(async (o) => {
    const products = await db.select({ name: productsTable.name }).from(productsTable).where(eq(productsTable.id, o.productId)).limit(1);
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
      marketerName: user?.name ?? null,
      status: o.status,
      marketerProfit: o.marketerProfit ? parseFloat(o.marketerProfit) : null,
      companyProfit: o.companyProfit ? parseFloat(o.companyProfit) : null,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString(),
    };
  }));

  res.json({
    totalOrders: total.count,
    deliveredOrders: delivered.count,
    newOrders: newOrders.count,
    cancelledOrders: cancelled.count,
    totalProfit: parseFloat(user?.balance ?? "0"),
    totalCommission: parseFloat(commissionResult?.total ?? "0"),
    recentOrders: formattedRecent,
  });
});

// GET /stats/reports
router.get("/reports", authMiddleware, adminOnly, async (req, res) => {
  const period = (req.query.period as string) ?? "monthly";
  const now = new Date();

  let startDate: Date;
  let label: string;

  if (period === "daily") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    label = "اليوم";
  } else if (period === "weekly") {
    const day = now.getDay();
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
    label = "هذا الأسبوع";
  } else if (period === "yearly") {
    startDate = new Date(now.getFullYear(), 0, 1);
    label = "هذا العام";
  } else {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    label = "هذا الشهر";
  }

  const [totalOrders] = await db.select({ count: count() }).from(ordersTable).where(gte(ordersTable.createdAt, startDate));
  const [deliveredOrders] = await db.select({ count: count() }).from(ordersTable).where(and(eq(ordersTable.status, "delivered"), gte(ordersTable.createdAt, startDate)));
  const [cancelledOrders] = await db.select({ count: count() }).from(ordersTable).where(and(eq(ordersTable.status, "cancelled"), gte(ordersTable.createdAt, startDate)));

  const revenueResult = await db.select({ total: sql<string>`COALESCE(SUM(sale_price), 0)` }).from(ordersTable).where(and(eq(ordersTable.status, "delivered"), gte(ordersTable.createdAt, startDate)));
  const profitResult = await db.select({ total: sql<string>`COALESCE(SUM(company_profit), 0)` }).from(ordersTable).where(and(eq(ordersTable.status, "delivered"), gte(ordersTable.createdAt, startDate)));
  const commissionResult = await db.select({ total: sql<string>`COALESCE(SUM(marketer_profit), 0)` }).from(ordersTable).where(and(eq(ordersTable.status, "delivered"), gte(ordersTable.createdAt, startDate)));

  // Best marketer
  const bestMarketerResult = await db.select({
    name: usersTable.name,
    total: count(ordersTable.id),
  })
    .from(ordersTable)
    .innerJoin(usersTable, eq(ordersTable.marketerId, usersTable.id))
    .where(and(eq(ordersTable.status, "delivered"), gte(ordersTable.createdAt, startDate)))
    .groupBy(usersTable.name)
    .orderBy(sql`count(${ordersTable.id}) DESC`)
    .limit(1);

  // Best product
  const bestProductResult = await db.select({
    name: productsTable.name,
    total: sql<number>`SUM(${ordersTable.quantity})`,
  })
    .from(ordersTable)
    .innerJoin(productsTable, eq(ordersTable.productId, productsTable.id))
    .where(and(eq(ordersTable.status, "delivered"), gte(ordersTable.createdAt, startDate)))
    .groupBy(productsTable.name)
    .orderBy(sql`SUM(${ordersTable.quantity}) DESC`)
    .limit(1);

  // Best province
  const bestProvinceResult = await db.select({
    province: ordersTable.province,
    total: count(ordersTable.id),
  })
    .from(ordersTable)
    .where(and(eq(ordersTable.status, "delivered"), gte(ordersTable.createdAt, startDate)))
    .groupBy(ordersTable.province)
    .orderBy(sql`count(${ordersTable.id}) DESC`)
    .limit(1);

  // Chart data - last 7 days
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const dayEnd = new Date(dayStart.getTime() + 86400000);

    const [dayOrders] = await db.select({ count: count() }).from(ordersTable).where(and(gte(ordersTable.createdAt, dayStart), lt(ordersTable.createdAt, dayEnd)));
    const dayProfit = await db.select({ total: sql<string>`COALESCE(SUM(company_profit), 0)` }).from(ordersTable).where(and(eq(ordersTable.status, "delivered"), gte(ordersTable.createdAt, dayStart), lt(ordersTable.createdAt, dayEnd)));
    const dayCommission = await db.select({ total: sql<string>`COALESCE(SUM(marketer_profit), 0)` }).from(ordersTable).where(and(eq(ordersTable.status, "delivered"), gte(ordersTable.createdAt, dayStart), lt(ordersTable.createdAt, dayEnd)));

    chartData.push({
      label: dayStart.toLocaleDateString("ar-IQ", { month: "short", day: "numeric" }),
      orders: dayOrders.count,
      profit: parseFloat(dayProfit[0]?.total ?? "0"),
      commissions: parseFloat(dayCommission[0]?.total ?? "0"),
    });
  }

  res.json({
    period: label,
    totalOrders: totalOrders.count,
    deliveredOrders: deliveredOrders.count,
    cancelledOrders: cancelledOrders.count,
    totalRevenue: parseFloat(revenueResult[0]?.total ?? "0"),
    totalProfit: parseFloat(profitResult[0]?.total ?? "0"),
    totalCommissions: parseFloat(commissionResult[0]?.total ?? "0"),
    bestMarketer: bestMarketerResult[0]?.name ?? null,
    bestProduct: bestProductResult[0]?.name ?? null,
    bestProvince: bestProvinceResult[0]?.province ?? null,
    chartData,
  });
});

// GET /stats/chart
router.get("/chart", authMiddleware, async (req, res) => {
  const period = (req.query.period as string) ?? "daily";
  const chartData = [];

  if (period === "daily") {
    for (let i = 6; i >= 0; i--) {
      const day = new Date();
      day.setDate(day.getDate() - i);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
      const dayEnd = new Date(dayStart.getTime() + 86400000);

      const [dayOrders] = await db.select({ count: count() }).from(ordersTable).where(and(gte(ordersTable.createdAt, dayStart), lt(ordersTable.createdAt, dayEnd)));
      const dayProfit = await db.select({ total: sql<string>`COALESCE(SUM(company_profit), 0)` }).from(ordersTable).where(and(eq(ordersTable.status, "delivered"), gte(ordersTable.createdAt, dayStart), lt(ordersTable.createdAt, dayEnd)));

      chartData.push({
        label: dayStart.toLocaleDateString("ar-IQ", { month: "short", day: "numeric" }),
        orders: dayOrders.count,
        profit: parseFloat(dayProfit[0]?.total ?? "0"),
        commissions: 0,
      });
    }
  } else {
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      const monthStart = new Date(date.getFullYear(), date.getMonth() - i, 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() - i + 1, 1);

      const [monthOrders] = await db.select({ count: count() }).from(ordersTable).where(and(gte(ordersTable.createdAt, monthStart), lt(ordersTable.createdAt, monthEnd)));
      const monthProfit = await db.select({ total: sql<string>`COALESCE(SUM(company_profit), 0)` }).from(ordersTable).where(and(eq(ordersTable.status, "delivered"), gte(ordersTable.createdAt, monthStart), lt(ordersTable.createdAt, monthEnd)));

      chartData.push({
        label: monthStart.toLocaleDateString("ar-IQ", { month: "long" }),
        orders: monthOrders.count,
        profit: parseFloat(monthProfit[0]?.total ?? "0"),
        commissions: 0,
      });
    }
  }

  res.json(chartData);
});

export default router;
