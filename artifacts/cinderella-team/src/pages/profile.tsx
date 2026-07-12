import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCircle, Mail, Briefcase, Calendar, ShieldCheck } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold mb-1">ملفي الشخصي</h1>
        <p className="text-muted-foreground">معلومات حسابك الشخصي</p>
      </div>

      <div className="relative">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-primary/40 to-primary/10 rounded-t-xl border border-primary/20 border-b-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
        </div>
        
        {/* Content */}
        <Card className="border-t-0 rounded-t-none border-primary/20 pt-16 relative">
          {/* Avatar */}
          <div className="absolute -top-16 right-8 p-1 bg-card rounded-full border border-primary/30">
            <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center border border-border shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <UserCircle className="w-16 h-16 text-primary" />
            </div>
          </div>

          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">{user.name}</CardTitle>
            <CardDescription className="text-base flex items-center gap-2 mt-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {user.role === 'admin' ? 'مدير النظام' : 'مسوقة'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <UserCircle className="h-4 w-4" /> اسم المستخدم
                </p>
                <p className="font-mono text-lg">{user.username}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> تاريخ الانضمام
                </p>
                <p className="text-lg">{new Date(user.createdAt).toLocaleDateString('ar-IQ')}</p>
              </div>
            </div>

            {user.role === 'marketer' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> نسبة العمولة
                  </p>
                  <p className="font-bold text-xl text-primary">{user.commissionRate}%</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Briefcase className="h-4 w-4" /> الرصيد الحالي
                  </p>
                  <p className="font-bold text-xl text-emerald-400">
                    {new Intl.NumberFormat('ar-IQ').format(user.balance)} د.ع
                  </p>
                </div>
              </div>
            )}
            
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
