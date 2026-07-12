import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, Router as WouterRouter, Redirect, useLocation } from 'wouter';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Shell } from '@/components/layout/shell';

// Pages
import Login from '@/pages/login';
import Dashboard from '@/pages/dashboard';
import Orders from '@/pages/orders/index';
import NewOrder from '@/pages/orders/new';
import OrderDetail from '@/pages/orders/detail';
import Products from '@/pages/products/index';
import ProductForm from '@/pages/products/form';
import Marketers from '@/pages/marketers/index';
import NewMarketer from '@/pages/marketers/new';
import Reports from '@/pages/reports/index';
import Profile from '@/pages/profile';

const queryClient = new QueryClient();

// Protected Route Wrapper
function ProtectedRoute({ component: Component, adminOnly = false }: { component: any, adminOnly?: boolean }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Redirect to="/dashboard" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      
      {/* Protected Routes inside Shell */}
      <Route path="/dashboard">
        <Shell><ProtectedRoute component={Dashboard} /></Shell>
      </Route>
      
      <Route path="/orders">
        <Shell><ProtectedRoute component={Orders} /></Shell>
      </Route>
      <Route path="/orders/new">
        <Shell><ProtectedRoute component={NewOrder} /></Shell>
      </Route>
      <Route path="/orders/:id">
        <Shell><ProtectedRoute component={OrderDetail} /></Shell>
      </Route>
      <Route path="/orders/:id/edit">
        <Shell><ProtectedRoute component={NewOrder} /></Shell> {/* Simplification: reuse form */}
      </Route>
      
      <Route path="/products">
        <Shell><ProtectedRoute component={Products} /></Shell>
      </Route>
      <Route path="/products/new">
        <Shell><ProtectedRoute component={ProductForm} adminOnly /></Shell>
      </Route>
      <Route path="/products/:id/edit">
        <Shell><ProtectedRoute component={ProductForm} adminOnly /></Shell>
      </Route>
      
      <Route path="/marketers">
        <Shell><ProtectedRoute component={Marketers} adminOnly /></Shell>
      </Route>
      <Route path="/marketers/new">
        <Shell><ProtectedRoute component={NewMarketer} adminOnly /></Shell>
      </Route>
      
      <Route path="/reports">
        <Shell><ProtectedRoute component={Reports} adminOnly /></Shell>
      </Route>
      
      <Route path="/profile">
        <Shell><ProtectedRoute component={Profile} /></Shell>
      </Route>

      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>
      
      <Route>
        <div className="min-h-screen flex items-center justify-center flex-col gap-4">
          <h1 className="text-4xl font-bold">404</h1>
          <p>الصفحة غير موجودة</p>
          <a href="/" className="text-primary hover:underline">العودة للرئيسية</a>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
