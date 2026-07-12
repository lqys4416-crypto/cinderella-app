import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateUser } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

const marketerSchema = z.object({
  name: z.string().min(1, "الاسم مطلوب"),
  username: z.string().min(4, "اسم المستخدم يجب أن يكون 4 أحرف على الأقل").regex(/^[a-zA-Z0-9_]+$/, "يجب أن يحتوي على أحرف إنجليزية وأرقام فقط"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  commissionRate: z.coerce.number().min(0, "لا يمكن أن تكون أقل من 0").max(100, "لا يمكن أن تكون أكثر من 100"),
});

export default function NewMarketer() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const createUser = useCreateUser();

  const form = useForm<z.infer<typeof marketerSchema>>({
    resolver: zodResolver(marketerSchema),
    defaultValues: {
      name: "",
      username: "",
      password: "",
      commissionRate: 100, // Default 100% of the set profit
    },
  });

  const onSubmit = (values: z.infer<typeof marketerSchema>) => {
    createUser.mutate(
      { data: values },
      {
        onSuccess: () => {
          toast({ title: "تم إضافة المسوقة بنجاح" });
          setLocation("/marketers");
        },
        onError: () => {
          toast({ variant: "destructive", title: "حدث خطأ أثناء الإضافة", description: "قد يكون اسم المستخدم مستخدم مسبقاً" });
        }
      }
    );
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/marketers" className="text-muted-foreground hover:text-primary transition-colors">
          <ArrowRight className="h-6 w-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">إضافة مسوقة جديدة</h1>
          <p className="text-muted-foreground">إنشاء حساب مسوقة في فريق سندريلا</p>
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
                    <FormLabel>الاسم الكامل <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input placeholder="مثال: سارة محمد" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المستخدم الدخول <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="sara_m" dir="ltr" className="text-right" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور <span className="text-destructive">*</span></FormLabel>
                      <FormControl>
                        <Input type="password" dir="ltr" className="text-right" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="commissionRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نسبة العمولة (%) <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input type="number" min="0" max="100" {...field} />
                    </FormControl>
                    <FormDescription>
                      نسبة العمولة من (الربح) المحدد للمنتج. القيمة الافتراضية هي 100%.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setLocation("/marketers")}>
                  إلغاء
                </Button>
                <Button 
                  type="submit" 
                  disabled={createUser.isPending} 
                  className="min-w-[150px]"
                >
                  {createUser.isPending ? "جاري الحفظ..." : "حفظ الحساب"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
