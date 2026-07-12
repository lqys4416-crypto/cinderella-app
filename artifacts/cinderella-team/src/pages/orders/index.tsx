import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useGetOrders, useUpdateOrderStatus, useDeleteOrder } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

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

export default function Orders() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: orders, isLoading, refetch } = useGetOrders({
    query: {
      queryKey: ['orders', searchTerm],
    },
    request: {
      url: `/api/orders${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ''}`
    }
  });

  const updateStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();

  const handleStatusChange = (id: number, status: any) => {
    updateStatus.mutate(
      { id, data: { status } },
      {
        onSuccess: () => {
          toast({ title: "تم تحديث حالة الطلب" });
          refetch();
        },
        onError: () => {
          toast({ variant: "destructive", title: "حدث خطأ أثناء تحديث الحالة" });
        }
      }
    );
  };

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا الطلب؟")) {
      deleteOrder.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "تم حذف الطلب بنجاح" });
            refetch();
          },
          onError: () => {
            toast({ variant: "destructive", title: "حدث خطأ أثناء الحذف" });
          }
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">الطلبات</h1>
          <p className="text-muted-foreground">إدارة وتتبع طلبات الزبائن</p>
        </div>
        <Link href="/orders/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 shadow-primary/20 h-10 px-4 py-2">
          <Plus className="ml-2 h-4 w-4" />
          إضافة طلب جديد
        </Link>
      </div>

      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>قائمة الطلبات</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم، رقم الهاتف..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>الزبون</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>المنتج</TableHead>
                {isAdmin && <TableHead>المسوقة</TableHead>}
                <TableHead>المبلغ</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8 text-muted-foreground">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 8 : 7} className="text-center py-8 text-muted-foreground">
                    لا توجد طلبات
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-xs">{order.orderNumber}</TableCell>
                    <TableCell className="font-semibold">{order.customerName}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{order.phone}</TableCell>
                    <TableCell>{order.productName}</TableCell>
                    {isAdmin && <TableCell>{order.marketerName}</TableCell>}
                    <TableCell className="font-bold text-primary">
                      {new Intl.NumberFormat('ar-IQ').format(order.salePrice)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`border-0 ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">فتح القائمة</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>الإجراءات</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => setLocation(`/orders/${order.id}`)}>
                            <Eye className="mr-2 ml-2 h-4 w-4" /> عرض التفاصيل
                          </DropdownMenuItem>
                          
                          {(!isAdmin && order.status === 'new') && (
                            <DropdownMenuItem onClick={() => setLocation(`/orders/${order.id}/edit`)}>
                              <Edit className="mr-2 ml-2 h-4 w-4" /> تعديل الطلب
                            </DropdownMenuItem>
                          )}
                          
                          {isAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuSub>
                                <DropdownMenuSubTrigger>تغيير الحالة</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                  {Object.entries(statusLabels).map(([key, label]) => (
                                    <DropdownMenuItem 
                                      key={key}
                                      onClick={() => handleStatusChange(order.id, key)}
                                      className={order.status === key ? "bg-accent text-accent-foreground" : ""}
                                    >
                                      {label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuSubContent>
                              </DropdownMenuSub>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(order.id)}
                                className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                              >
                                <Trash2 className="mr-2 ml-2 h-4 w-4" /> حذف الطلب
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
