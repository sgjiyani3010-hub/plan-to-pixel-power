import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Search } from 'lucide-react';
import { OrderFulfillment } from '@/components/admin/OrderFulfillment';
import { cn } from '@/lib/utils';

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  coupon_code: string | null;
  discount: number | null;
  shipping_address: Record<string, string> | null;
  created_at: string;
  customerName?: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  size: string;
  color: string;
  price: number;
  products: { name: string } | null;
}

const statuses = ['pending', 'confirmed', 'processing', 'ready_to_ship', 'shipped', 'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];

const statusColor: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  ready_to_ship: 'bg-orange-100 text-orange-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  in_transit: 'bg-cyan-100 text-cyan-800',
  out_for_delivery: 'bg-teal-100 text-teal-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const fetchOrders = async () => {
    const { data: ordersData } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (!ordersData) { setOrders([]); return; }

    const userIds = [...new Set(ordersData.map((o) => o.user_id))];
    const { data: profiles } = await supabase.from('profiles').select('user_id, full_name').in('user_id', userIds);
    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p.full_name]));

    setOrders(ordersData.map((o) => ({ ...o, customerName: profileMap.get(o.user_id) || 'Unknown' })) as Order[]);
  };

  useEffect(() => { fetchOrders(); }, []);

  const viewDetails = async (order: Order) => {
    setSelectedOrder(order);
    const { data } = await supabase
      .from('order_items')
      .select('*, products(name)')
      .eq('order_id', order.id);
    setOrderItems((data as unknown as OrderItem[]) || []);
    setDetailOpen(true);
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.includes(q) || (o.customerName || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="font-heading text-2xl font-bold text-foreground">Orders</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-48" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">
                    {s.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="font-heading text-lg">{filtered.length} Orders</CardTitle></CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-muted-foreground font-accent text-sm">No orders found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-accent">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Order ID</th>
                      <th className="pb-2 pr-4">Customer</th>
                      <th className="pb-2 pr-4">Total</th>
                      <th className="pb-2 pr-4">Status</th>
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((o) => (
                      <tr key={o.id} className="border-b border-border/50">
                        <td className="py-3 pr-4 font-mono text-xs">{o.id.slice(0, 8)}...</td>
                        <td className="py-3 pr-4">{o.customerName}</td>
                        <td className="py-3 pr-4 font-semibold">₹{Number(o.total).toLocaleString()}</td>
                        <td className="py-3 pr-4">
                          <Badge className={cn('capitalize text-xs', statusColor[o.status])}>
                            {o.status.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                        <td className="py-3">
                          <Button size="sm" variant="outline" onClick={() => viewDetails(o)}>
                            <Eye className="w-3 h-3 mr-1" /> Fulfill
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">
                Order Fulfillment — {selectedOrder?.id.slice(0, 8)}...
              </DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <OrderFulfillment
                order={selectedOrder}
                items={orderItems}
                onStatusChange={() => {
                  fetchOrders();
                  // Re-fetch the selected order to update its status in the dialog
                  if (selectedOrder) {
                    supabase
                      .from('orders')
                      .select('*')
                      .eq('id', selectedOrder.id)
                      .single()
                      .then(({ data }) => {
                        if (data) {
                          const updated = { ...data, customerName: selectedOrder.customerName } as Order;
                          setSelectedOrder(updated);
                        }
                      });
                  }
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
