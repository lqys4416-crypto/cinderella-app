import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useGetProducts, useCreateOrder } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";
import React from "react";

const orderSchema = z.object({
  customerName: z.string().min(1, "الاسم مطلوب"),
  phone: z.string().min(10, "رقم الهاتف غير صالح"),
  province: z.string().min(1, "المحافظة مطلوبة"),
  district: z.string().min(1, "القضاء مطلوب"),
  address: z.string().min(1, "العنوان التفصيلي مطلوب"),
  productId: z.coerce.number().min(1, "يرجى اختيار المنتج"),
  quantity: z.coerce.number().min(1, "الكمية يجب أن تكون 1 على الأقل"),
  salePrice: z.coerce.number().min(1, "السعر مطلوب"),
  paymentMethod: z.string().optional(),
  deliveryCompany: z.string().optional(),
  notes: z.string().optional(),
});

export default function NewOrder() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: products } = useGetProducts();
  const createOrder = useCreateOrder();

  const form = useForm<z.infer<typeof orderSchema>>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      province: "",
      district: "",
      address: "",
      productId: 0,
      quantity: 1,
      salePrice: 0,
      paymentMethod: "الدفع عند الاستلام",
      notes: "",
    },
  });

  const watchProductId = form.watch("productId");

  // Update sale price when product changes
  React.useEffect(() => {
    if (watchProductId && products) {
      const product = products.find((p) => p.id === watchProductId);
      if (product) {
        form.setValue("salePrice", product.price);
      }
    }
  }, [watchProductId, products, form]);

  const onSubmit = (values: z.infer<typeof orderSchema>) => {
    createOrder.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({ title: "تم إضافة الطلب بنجاح" });
          setLocation("/orders");
        },
        onError: () => {
          toast({ variant: "destructive", title: "حدث خطأ أثناء الإضافة" });
        }
      }
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/orders" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowRight className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">إضافة طلب جديد</h1>
          <p className="text-muted-foreground">أدخل بيانات الطلب والزبون</p>
        </div>
      </div>

      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-primary border-b border-border pb-2">بيانات الزبون</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>اسم الزبون <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="الاسم الكامل" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>رقم الهاتف <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="07XXXXXXXXX" dir="ltr" className="text-right" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="province"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>المحافظة <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المحافظة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {["بغداد", "البصرة", "نينوى", "أربيل", "النجف", "كركوك", "السليمانية", "بابل", "كربلاء", "واسط", "الأنبار", "صلاح الدين", "ديالى", "القادسية", "ميسان", "ذي قار", "المثنى", "دهوك"].map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>القضاء / المنطقة <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="اسم المنطقة أو القضاء" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>العنوان التفصيلي <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="المحلة، الزقاق، الدار، أقرب نقطة دالة" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-bold text-primary border-b border-border pb-2">بيانات الطلب</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="productId"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>المنتج <span className="text-destructive">*</span></FormLabel>
                        <Select onValueChange={(val) => field.onChange(Number(val))} value={field.value ? String(field.value) : undefined}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر المنتج" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products?.filter(p => p.status === 'active' && p.quantity > 0).map((p) => (
                              <SelectItem key={p.id} value={String(p.id)}>
                                {p.name} - {new Intl.NumberFormat('ar-IQ').format(p.price)} د.ع
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الكمية <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="salePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سعر البيع النهائي (د.ع) <span className="text-destructive">*</span></FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>يمكنك تغيير السعر إذا كنت تبيع بسعر مختلف عن السعر الرسمي</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>ملاحظات إضافية</FormLabel>
                        <FormControl>
                          <Textarea placeholder="ملاحظات لشركة التوصيل أو حول الطلب..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setLocation("/orders")}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createOrder.isPending} className="min-w-[150px]">
                  {createOrder.isPending ? "جاري الحفظ..." : "حفظ الطلب"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
