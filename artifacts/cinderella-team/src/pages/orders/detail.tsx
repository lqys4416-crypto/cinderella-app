import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, User, Phone, MapPin, Package, CreditCard, FileText, CalendarClock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  
  const { data: order, isLoading, isError } = useGetOrder(Number(id), {
    query: {
      enabled: !!id,
      queryKey: ['order', Number(id)]
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="text-center p-12 text-destructive font-bold text-xl">
        الطلب غير موجود أو لا تملك صلاحية للوصول إليه
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Link href="/orders" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowRight className="h-6 w-6" />
        </Link>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold">تفاصيل الطلب</h1>
            <Badge variant="outline" className={`border-0 text-sm ${statusColors[order.status]}`}>
              {statusLabels[order.status]}
            </Badge>
          </div>
          <p className="text-muted-foreground font-mono">#{order.orderNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> بيانات الزبون
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">الاسم</p>
              <p className="font-semibold text-lg">{order.customerName}</p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4 text-primary" />
              <p dir="ltr" className="text-right text-foreground font-mono">{order.phone}</p>
            </div>
            <div className="flex items-start gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary mt-1" />
              <div>
                <p className="text-foreground">{order.province} - {order.district}</p>
                <p className="text-sm mt-1">{order.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> تفاصيل المنتج
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">المنتج</p>
              <p className="font-semibold text-lg">{order.productName}</p>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <p className="text-muted-foreground">الكمية</p>
              <p className="font-bold">{order.quantity}</p>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-border/30">
              <p className="text-muted-foreground">سعر البيع</p>
              <p className="font-bold text-primary text-xl">
                {new Intl.NumberFormat('ar-IQ').format(order.salePrice)} د.ع
              </p>
            </div>
            {order.marketerProfit !== null && order.marketerProfit !== undefined && (
              <div className="flex justify-between items-center pt-2">
                <p className="text-muted-foreground">عمولة المسوقة</p>
                <p className="font-bold text-emerald-400">
                  {new Intl.NumberFormat('ar-IQ').format(order.marketerProfit)} د.ع
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2 border-primary/20 bg-black/40">
          <CardHeader className="pb-3 border-b border-border/50">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> معلومات إضافية
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground w-24">تاريخ الطلب:</p>
                <p className="font-mono text-sm">{new Date(order.createdAt).toLocaleString('ar-IQ')}</p>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground w-24">طريقة الدفع:</p>
                <p className="text-sm">{order.paymentMethod || "الدفع عند الاستلام"}</p>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground w-24">المسوقة:</p>
                <p className="text-sm font-semibold">{order.marketerName}</p>
              </div>
            </div>
            
            {order.notes && (
              <div className="bg-background/50 p-4 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">الملاحظات:</p>
                <p className="text-sm leading-relaxed">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
