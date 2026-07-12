import { useAuth } from "@/lib/auth";
import { useGetDashboardStats, useGetMarketerDashboard, useGetChartData } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('ar-IQ', { style: 'currency', currency: 'IQD' }).format(value);
};

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return isAdmin ? <AdminDashboard /> : <MarketerDashboard />;
}

function AdminDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: chartData, isLoading: chartLoading } = useGetChartData({ query: { queryKey: ['chart-data', 'daily'] } });

  if (statsLoading) {
    return <div className="text-center p-12 text-muted-foreground">جاري التحميل...</div>;
  }

  const statCards = [
    { title: "طلبات اليوم", value: stats?.todayOrders || 0, color: "text-blue-400" },
    { title: "الطلبات الجديدة", value: stats?.newOrders || 0, color: "text-cyan-400" },
    { title: "الطلبات المسلمة", value: stats?.deliveredOrders || 0, color: "text-emerald-400" },
    { title: "الطلبات الملغية", value: stats?.cancelledOrders || 0, color: "text-rose-400" },
    { title: "طلبات الشهر", value: stats?.monthOrders || 0, color: "text-purple-400" },
    { title: "إجمالي الأرباح", value: formatCurrency(stats?.totalProfit || 0), color: "text-primary" },
    { title: "عدد المسوقات", value: stats?.totalMarketers || 0, color: "text-amber-400" },
    { title: "عدد المنتجات", value: stats?.totalProducts || 0, color: "text-sky-400" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
        <p className="text-muted-foreground">نظرة عامة على أداء فريق سندريلا</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:border-primary/50 transition-colors bg-gradient-to-br from-card to-card/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle>المبيعات والأرباح</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {chartLoading ? (
                <div className="h-full flex items-center justify-center">جاري التحميل...</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="label" stroke="#666" tick={{ fill: '#888' }} />
                    <YAxis yAxisId="left" stroke="#666" tick={{ fill: '#888' }} />
                    <YAxis yAxisId="right" orientation="right" stroke="#666" tick={{ fill: '#888' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#d4af37', borderRadius: '8px' }}
                      itemStyle={{ color: '#eee' }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="orders" name="الطلبات" stroke="#d4af37" strokeWidth={3} dot={{ r: 4, fill: "#d4af37" }} activeDot={{ r: 6 }} />
                    <Line yAxisId="right" type="monotone" dataKey="profit" name="الأرباح" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: "#10b981" }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>أفضل المسوقات</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>الطلبات</TableHead>
                  <TableHead className="text-left">المبيعات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.topMarketers?.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-semibold">{m.name}</TableCell>
                    <TableCell>{m.totalOrders}</TableCell>
                    <TableCell className="text-left text-primary">{formatCurrency(m.totalProfit)}</TableCell>
                  </TableRow>
                ))}
                {!stats?.topMarketers?.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">لا توجد بيانات</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MarketerDashboard() {
  const { data: stats, isLoading } = useGetMarketerDashboard();

  if (isLoading) {
    return <div className="text-center p-12 text-muted-foreground">جاري التحميل...</div>;
  }

  const statCards = [
    { title: "إجمالي الطلبات", value: stats?.totalOrders || 0, color: "text-blue-400" },
    { title: "الطلبات الجديدة", value: stats?.newOrders || 0, color: "text-cyan-400" },
    { title: "الطلبات المسلمة", value: stats?.deliveredOrders || 0, color: "text-emerald-400" },
    { title: "الطلبات الملغية", value: stats?.cancelledOrders || 0, color: "text-rose-400" },
    { title: "إجمالي أرباحي (المبيعات)", value: formatCurrency(stats?.totalProfit || 0), color: "text-primary" },
    { title: "إجمالي عمولتي", value: formatCurrency(stats?.totalCommission || 0), color: "text-primary" },
  ];

  const statusColors: Record<string, string> = {
    new: "bg-blue-500/20 text-blue-500",
    confirmed: "bg-cyan-500/20 text-cyan-500",
    preparing: "bg-yellow-500/20 text-yellow-500",
    shipped: "bg-purple-500/20 text-purple-500",
    delivering: "bg-orange-500/20 text-orange-500",
    delivered: "bg-emerald-500/20 text-emerald-500",
    cancelled: "bg-rose-500/20 text-rose-500",
    returned: "bg-gray-500/20 text-gray-500",
  };

  const statusLabels: Record<string, string> = {
    new: "جديد",
    confirmed: "تم التأكيد",
    preparing: "قيد التجهيز",
    shipped: "تم الشحن",
    delivering: "قيد التوصيل",
    delivered: "تم التسليم",
    cancelled: "ملغي",
    returned: "راجع",
  };

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
        <p className="text-muted-foreground">مرحباً بك في لوحة تحكم المسوقة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="hover:border-primary/50 transition-colors bg-gradient-to-br from-card to-card/50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>أحدث الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>الزبون</TableHead>
                <TableHead>المنتج</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead className="text-left">العمولة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.recentOrders?.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono">{order.orderNumber}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.productName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString('ar-IQ')}</TableCell>
                  <TableCell className="text-left font-bold text-primary">
                    {formatCurrency(order.marketerProfit || 0)}
                  </TableCell>
                </TableRow>
              ))}
              {!stats?.recentOrders?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد طلبات حديثة
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
