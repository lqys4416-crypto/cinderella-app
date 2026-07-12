import { useState } from "react";
import { useGetReports, GetReportsPeriod } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Package, Users, MapPin, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Reports() {
  const [period, setPeriod] = useState<GetReportsPeriod>("monthly");

  const { data: report, isLoading } = useGetReports({
    query: {
      queryKey: ['reports', period]
    },
    request: {
      url: `/api/reports?period=${period}`
    }
  });

  const periodLabels = {
    daily: "يومي",
    weekly: "أسبوعي",
    monthly: "شهري",
    yearly: "سنوي"
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">التقارير والإحصائيات</h1>
          <p className="text-muted-foreground">تحليل أداء النظام والمبيعات</p>
        </div>
        <div className="w-40">
          <Select value={period} onValueChange={(v) => setPeriod(v as GetReportsPeriod)}>
            <SelectTrigger>
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">يومي</SelectItem>
              <SelectItem value="weekly">أسبوعي</SelectItem>
              <SelectItem value="monthly">شهري</SelectItem>
              <SelectItem value="yearly">سنوي</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">الطلبات الكلية</p>
                <p className="text-3xl font-bold text-foreground">{report?.totalOrders || 0}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">الطلبات المسلمة</p>
                <p className="text-3xl font-bold text-emerald-400">{report?.deliveredOrders || 0}</p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Award className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">الأرباح الصافية</p>
                <p className="text-2xl font-bold text-primary">
                  {new Intl.NumberFormat('ar-IQ').format(report?.totalProfit || 0)}
                </p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">عمولات المسوقات</p>
                <p className="text-2xl font-bold text-amber-400">
                  {new Intl.NumberFormat('ar-IQ').format(report?.totalCommissions || 0)}
                </p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Users className="h-5 w-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle>المبيعات خلال الـ {periodLabels[period]}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full mt-4">
              {report?.chartData && report.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart data={report.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                    <XAxis dataKey="label" stroke="#666" tick={{ fill: '#888' }} />
                    <YAxis stroke="#666" tick={{ fill: '#888' }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111', borderColor: '#d4af37', borderRadius: '8px' }}
                      itemStyle={{ color: '#eee' }}
                    />
                    <Bar dataKey="profit" name="الأرباح" fill="#d4af37" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="commissions" name="العمولات" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </RechartsBarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  لا توجد بيانات كافية للرسم البياني
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader className="pb-3 border-b border-border/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" /> الأفضل أداءً
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-6">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                  <Users className="h-4 w-4" /> أفضل مسوقة
                </p>
                <p className="text-lg font-bold">{report?.bestMarketer || "غير محدد"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                  <Package className="h-4 w-4" /> المنتج الأكثر مبيعاً
                </p>
                <p className="text-lg font-bold">{report?.bestProduct || "غير محدد"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mb-1">
                  <MapPin className="h-4 w-4" /> المحافظة الأكثر طلباً
                </p>
                <p className="text-lg font-bold">{report?.bestProvince || "غير محدد"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
