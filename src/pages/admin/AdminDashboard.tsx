import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, ShoppingCart, Users, IndianRupee } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
}

interface RecentOrder {
  id: string;
  total: number;
  status: string;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalCustomers: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      const [products, orders, profiles] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, total'),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
      ]);

      const totalRevenue = (orders.data || []).reduce((sum, o) => sum + Number(o.total), 0);

      setStats({
        totalProducts: products.count || 0,
        totalOrders: (orders.data || []).length,
        totalRevenue,
        totalCustomers: profiles.count || 0,
      });
    };

    const fetchRecent = async () => {
      const { data } = await supabase
        .from('orders')
        .select('id, total, status, created_at, profiles!orders_user_id_fkey(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      setRecentOrders((data as unknown as RecentOrder[]) || []);
    };

    fetchStats();
    fetchRecent();
  }, []);

  const statCards = [
    { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-secondary' },
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-accent' },
    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-highlight' },
    { label: 'Customers', value: stats.totalCustomers, icon: Users, color: 'text-primary' },
  ];

  const statusColor: Record<string, string> = {
    pending: 'bg-highlight/20 text-highlight',
    confirmed: 'bg-secondary/20 text-secondary',
    shipped: 'bg-primary/20 text-primary',
    delivered: 'bg-green-100 text-green-700',
    cancelled: 'bg-destructive/20 text-destructive',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-accent font-medium text-muted-foreground">{s.label}</CardTitle>
                <s.icon className={`h-5 w-5 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-heading font-bold">{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground font-accent text-sm">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-accent">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Order ID</th>
                      <th className="pb-2 pr-4">Customer</th>
                      <th className="pb-2 pr-4">Total</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((o) => (
                      <tr key={o.id} className="border-b border-border/50">
                        <td className="py-3 pr-4 font-mono text-xs">{o.id.slice(0, 8)}...</td>
                        <td className="py-3 pr-4">{o.profiles?.full_name || 'Unknown'}</td>
                        <td className="py-3 pr-4 font-semibold">₹{Number(o.total).toLocaleString()}</td>
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${statusColor[o.status] || ''}`}>
                            {o.status}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
