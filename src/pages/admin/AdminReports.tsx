import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['hsl(350,79%,59%)', 'hsl(213,73%,22%)', 'hsl(38,91%,55%)', 'hsl(240,27%,14%)', 'hsl(120,40%,50%)'];

const AdminReports = () => {
  const [period, setPeriod] = useState('30');
  const [revenueData, setRevenueData] = useState<{ date: string; revenue: number; orders: number }[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; quantity: number; revenue: number }[]>([]);
  const [totals, setTotals] = useState({ revenue: 0, orders: 0, avgOrder: 0 });

  useEffect(() => {
    const fetchData = async () => {
      const since = new Date();
      since.setDate(since.getDate() - Number(period));

      const { data: orders } = await supabase
        .from('orders')
        .select('id, total, status, created_at')
        .gte('created_at', since.toISOString());

      if (!orders) return;

      // Revenue over time
      const byDate: Record<string, { revenue: number; orders: number }> = {};
      orders.forEach((o) => {
        const d = new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
        if (!byDate[d]) byDate[d] = { revenue: 0, orders: 0 };
        byDate[d].revenue += Number(o.total);
        byDate[d].orders += 1;
      });
      setRevenueData(Object.entries(byDate).map(([date, v]) => ({ date, ...v })));

      // Status breakdown
      const byStatus: Record<string, number> = {};
      orders.forEach((o) => { byStatus[o.status] = (byStatus[o.status] || 0) + 1; });
      setStatusData(Object.entries(byStatus).map(([name, value]) => ({ name, value })));

      // Totals
      const totalRev = orders.reduce((s, o) => s + Number(o.total), 0);
      setTotals({ revenue: totalRev, orders: orders.length, avgOrder: orders.length ? totalRev / orders.length : 0 });

      // Top products
      const orderIds = orders.map((o) => o.id);
      if (orderIds.length > 0) {
        const { data: items } = await supabase
          .from('order_items')
          .select('product_id, quantity, price, products(name)')
          .in('order_id', orderIds);

        if (items) {
          const byProduct: Record<string, { name: string; quantity: number; revenue: number }> = {};
          items.forEach((item: any) => {
            const pid = item.product_id;
            if (!byProduct[pid]) byProduct[pid] = { name: item.products?.name || 'Unknown', quantity: 0, revenue: 0 };
            byProduct[pid].quantity += item.quantity;
            byProduct[pid].revenue += Number(item.price) * item.quantity;
          });
          setTopProducts(Object.values(byProduct).sort((a, b) => b.revenue - a.revenue).slice(0, 10));
        }
      }
    };
    fetchData();
  }, [period]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">Reports & Analytics</h1>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-accent text-muted-foreground">Total Revenue</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-heading font-bold">₹{totals.revenue.toLocaleString()}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-accent text-muted-foreground">Total Orders</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-heading font-bold">{totals.orders}</div></CardContent></Card>
          <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-accent text-muted-foreground">Avg Order Value</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-heading font-bold">₹{Math.round(totals.avgOrder).toLocaleString()}</div></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="font-heading text-lg">Revenue Over Time</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(350,79%,59%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-heading text-lg">Orders by Status</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="font-heading text-lg">Top Selling Products</CardTitle></CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-muted-foreground font-accent text-sm">No sales data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-accent">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 pr-4">#</th>
                      <th className="pb-2 pr-4">Product</th>
                      <th className="pb-2 pr-4">Units Sold</th>
                      <th className="pb-2">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((p, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="py-3 pr-4">{i + 1}</td>
                        <td className="py-3 pr-4 font-medium">{p.name}</td>
                        <td className="py-3 pr-4">{p.quantity}</td>
                        <td className="py-3 font-semibold">₹{p.revenue.toLocaleString()}</td>
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

export default AdminReports;
