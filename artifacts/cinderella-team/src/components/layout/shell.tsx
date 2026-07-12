import * as React from "react"
import { Link, useLocation } from "wouter"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  BarChart, 
  Bell, 
  UserCircle,
  LogOut,
  Menu
} from "lucide-react"

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const [location] = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  if (!user) return <>{children}</>

  const navItems = user.role === "admin" 
    ? [
        { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
        { href: "/orders", label: "الطلبات", icon: ShoppingCart },
        { href: "/products", label: "المنتجات", icon: Package },
        { href: "/marketers", label: "المسوقات", icon: Users },
        { href: "/reports", label: "التقارير", icon: BarChart },
        { href: "/profile", label: "ملفي الشخصي", icon: UserCircle },
      ]
    : [
        { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
        { href: "/orders", label: "طلباتي", icon: ShoppingCart },
        { href: "/profile", label: "ملفي الشخصي", icon: UserCircle },
      ]

  return (
    <div className="min-h-screen flex w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 z-50 w-64 bg-sidebar border-l border-border transform transition-transform duration-300 ease-in-out md:translate-x-0 flex flex-col",
        mobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-center border-b border-border bg-background/50">
          <div className="text-xl font-black text-primary tracking-wider">CINDERELLA</div>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const active = location === item.href || location.startsWith(item.href + '/') && item.href !== '/'
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all group",
                  active 
                    ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(212,175,55,0.3)]" 
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
                {item.label}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center border border-border">
              <UserCircle className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.role === 'admin' ? 'مدير النظام' : 'مسوقة'}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20" onClick={logout}>
            <LogOut className="w-4 h-4 mr-2 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:pr-64 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="h-16 md:hidden flex items-center justify-between px-4 border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-40">
          <div className="text-lg font-black text-primary tracking-wider">CINDERELLA</div>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Menu className="w-6 h-6" />
          </Button>
        </header>

        {/* Content area */}
        <div className="flex-1 p-4 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  )
}
