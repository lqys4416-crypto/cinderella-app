import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation, useParams } from "wouter";
import { useCreateProduct, useGetProduct, useUpdateProduct } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import React from "react";

const productSchema = z.object({
  name: z.string().min(1, "اسم المنتج مطلوب"),
  price: z.coerce.number().min(0, "السعر مطلوب"),
  profit: z.coerce.number().min(0, "الربح مطلوب"),
  quantity: z.coerce.number().min(0, "الكمية مطلوبة"),
  status: z.enum(["active", "inactive"]),
  description: z.string().optional(),
});

export default function ProductForm() {
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: product, isLoading } = useGetProduct(Number(id), {
    query: {
      enabled: isEditing,
      queryKey: ['product', Number(id)]
    }
  });

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const form = useForm<z.infer<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      profit: 0,
      quantity: 0,
      status: "active",
      description: "",
    },
  });

  React.useEffect(() => {
    if (product && isEditing) {
      form.reset({
        name: product.name,
        price: product.price,
        profit: product.profit,
        quantity: product.quantity,
        status: product.status as "active" | "inactive",
        description: product.description || "",
      });
    }
  }, [product, isEditing, form]);

  const onSubmit = (values: z.infer<typeof productSchema>) => {
    if (isEditing) {
      updateProduct.mutate(
        { id: Number(id), data: values },
        {
          onSuccess: () => {
            toast({ title: "تم تحديث المنتج بنجاح" });
            setLocation("/products");
          },
          onError: () => {
            toast({ variant: "destructive", title: "حدث خطأ أثناء التحديث" });
          }
        }
      );
    } else {
      createProduct.mutate(
        { data: values },
        {
          onSuccess: () => {
            toast({ title: "تم إضافة المنتج بنجاح" });
            setLocation("/products");
          },
          onError: () => {
            toast({ variant: "destructive", title: "حدث خطأ أثناء الإضافة" });
          }
        }
      );
    }
  };

  if (isEditing && isLoading) {
    return <div className="text-center p-12">جاري التحميل...</div>;
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/products" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowRight className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{isEditing ? "تعديل منتج" : "إضافة منتج جديد"}</h1>
          <p className="text-muted-foreground">أدخل تفاصيل المنتج للكتالوج</p>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المنتج <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="أدخل اسم المنتج" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>سعر البيع (د.ع) <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="profit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ربح المسوقة (د.ع) <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الكمية المتوفرة المخزنية <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>الحالة <span className="text-destructive">*</span></FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الحالة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">نشط (متاح للبيع)</SelectItem>
                          <SelectItem value="inactive">غير نشط (مخفي)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الوصف (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="وصف المنتج، مميزاته..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setLocation("/products")}>
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={createProduct.isPending || updateProduct.isPending} 
                  className="min-w-[150px]"
                >
                  {(createProduct.isPending || updateProduct.isPending) ? "جاري الحفظ..." : "حفظ المنتج"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
