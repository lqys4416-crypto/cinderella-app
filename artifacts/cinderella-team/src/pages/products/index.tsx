import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useGetProducts, useDeleteProduct } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: products, isLoading, refetch } = useGetProducts({
    query: {
      queryKey: ['products']
    }
  });

  const deleteProduct = useDeleteProduct();

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
      deleteProduct.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "تم حذف المنتج بنجاح" });
            refetch();
          },
          onError: () => {
            toast({ variant: "destructive", title: "حدث خطأ أثناء الحذف" });
          }
        }
      );
    }
  };

  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">المنتجات</h1>
          <p className="text-muted-foreground">قائمة المنتجات المتاحة للتسويق</p>
        </div>
        {isAdmin && (
          <Link href="/products/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 shadow-primary/20 h-10 px-4 py-2">
            <Plus className="ml-2 h-4 w-4" />
            إضافة منتج
          </Link>
        )}
      </div>

      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>كتالوج المنتجات</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث عن منتج..."
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
                <TableHead>اسم المنتج</TableHead>
                <TableHead>السعر (للمسوقة)</TableHead>
                <TableHead>الربح المقترح</TableHead>
                <TableHead>الكمية المتوفرة</TableHead>
                <TableHead>الحالة</TableHead>
                {isAdmin && <TableHead className="w-[100px]"></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted-foreground">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : filteredProducts?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted-foreground">
                    لا توجد منتجات
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts?.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-bold">{product.name}</TableCell>
                    <TableCell className="text-primary font-bold">
                      {new Intl.NumberFormat('ar-IQ').format(product.price)}
                    </TableCell>
                    <TableCell className="text-emerald-400 font-bold">
                      {new Intl.NumberFormat('ar-IQ').format(product.profit)}
                    </TableCell>
                    <TableCell>
                      <span className={product.quantity <= 5 ? "text-rose-400 font-bold" : ""}>
                        {product.quantity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={product.status === 'active' ? "border-emerald-500/50 text-emerald-400" : "border-rose-500/50 text-rose-400"}>
                        {product.status === 'active' ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setLocation(`/products/${product.id}/edit`)}
                          >
                            <Edit className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
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
