import { useState } from "react";
import { useGetUsers, useDeleteUser } from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Marketers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: users, isLoading, refetch } = useGetUsers({
    query: {
      queryKey: ['users']
    }
  });

  const deleteUser = useDeleteUser();

  const handleDelete = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه المسوقة؟")) {
      deleteUser.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "تم حذف المسوقة بنجاح" });
            refetch();
          },
          onError: () => {
            toast({ variant: "destructive", title: "حدث خطأ أثناء الحذف" });
          }
        }
      );
    }
  };

  const marketers = users?.filter(u => u.role === 'marketer') || [];
  const filteredMarketers = marketers.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">المسوقات</h1>
          <p className="text-muted-foreground">إدارة فريق التسويق الخاص بك</p>
        </div>
        <Link href="/marketers/new" className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 shadow-primary/20 h-10 px-4 py-2">
          <Plus className="ml-2 h-4 w-4" />
          إضافة مسوقة
        </Link>
      </div>

      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>قائمة المسوقات</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بالاسم أو اسم المستخدم..."
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
                <TableHead>الاسم</TableHead>
                <TableHead>اسم المستخدم</TableHead>
                <TableHead>نسبة العمولة (%)</TableHead>
                <TableHead>الرصيد</TableHead>
                <TableHead>تاريخ الانضمام</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : filteredMarketers?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    لا توجد مسوقات
                  </TableCell>
                </TableRow>
              ) : (
                filteredMarketers?.map((marketer) => (
                  <TableRow key={marketer.id}>
                    <TableCell className="font-bold">{marketer.name}</TableCell>
                    <TableCell className="font-mono text-xs">{marketer.username}</TableCell>
                    <TableCell className="font-bold text-primary">{marketer.commissionRate}%</TableCell>
                    <TableCell className="font-bold text-emerald-400">
                      {new Intl.NumberFormat('ar-IQ').format(marketer.balance)} د.ع
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(marketer.createdAt).toLocaleDateString('ar-IQ')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDelete(marketer.id)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                        </Button>
                      </div>
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
