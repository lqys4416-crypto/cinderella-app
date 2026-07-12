import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLogin } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { motion } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(1, { message: "اسم المستخدم مطلوب" }),
  password: z.string().min(1, { message: "كلمة المرور مطلوبة" }),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const loginMutation = useLogin();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(
      { data: values },
      {
        onSuccess: (data) => {
          login(data.token);
          setLocation("/dashboard");
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "خطأ في تسجيل الدخول",
            description: "اسم المستخدم أو كلمة المرور غير صحيحة",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-primary tracking-widest mb-2 drop-shadow-[0_0_10px_rgba(212,175,55,0.5)]">
            CINDERELLA
          </h1>
          <p className="text-muted-foreground tracking-widest text-sm uppercase">LUXURY MANAGEMENT</p>
        </div>

        <Card className="border-primary/20 bg-card/60 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <CardHeader className="space-y-1 text-center pb-8">
            <CardTitle className="text-2xl font-bold">تسجيل الدخول</CardTitle>
            <CardDescription className="text-muted-foreground">
              أدخل بيانات الاعتماد الخاصة بك للوصول للنظام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>اسم المستخدم</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="أدخل اسم المستخدم" 
                          {...field} 
                          className="bg-black/40 border-border focus-visible:ring-primary/50 focus-visible:border-primary"
                        />
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
                      <FormLabel>كلمة المرور</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="bg-black/40 border-border focus-visible:ring-primary/50 focus-visible:border-primary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending ? "جاري الدخول..." : "دخول"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
