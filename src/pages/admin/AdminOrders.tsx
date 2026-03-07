import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

interface Order {
  id: string;
  user_id: string;
  total: number;
  status: string;
  coupon_code: string | null;
  discount: number | null;
  shipping_address: Record<string, string> | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
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

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

const statusColor: Record<string, string> = {
  pending: 'bg-highlight/20 text-highlight',
  confirmed: 'bg-secondary/20 text-secondary',
  shipped: 'bg-primary/20 text-primary',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-destructive/20 text-destructive',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const { toast } = useToast();

  const fetchOrders = async () => {
    const { data } = await supabase
      .from('orders')
      .select('*, profiles!orders_user_id_fkey(full_name)')
      .order('created_at', { ascending: false });
    setOrders((data as unknown as Order[]) || []);
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: `Order marked as ${status}` }); fetchOrders(); }
  };

  const viewDetails = async (order: Order) => {
    setSelectedOrder(order);
    const { data } = await supabase
      .from('order_items')
      .select('*, products(name)')
      .eq('order_id', order.id);
    setOrderItems((data as unknown as OrderItem[]) || []);
    setDetailOpen(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="font-heading text-2xl font-bold text-foreground">Orders</h1>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">{orders.length} Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
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
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id} className="border-b border-border/50">
                        <td className="py-3 pr-4 font-mono text-xs">{o.id.slice(0, 8)}...</td>
                        <td className="py-3 pr-4">{o.profiles?.full_name || 'Unknown'}</td>
                        <td className="py-3 pr-4 font-semibold">₹{Number(o.total).toLocaleString()}</td>
                        <td className="py-3 pr-4">
                          <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {statuses.map((s) => (
                                <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</td>
                        <td className="py-3">
                          <Button size="sm" variant="outline" onClick={() => viewDetails(o)}>
                            <Eye className="w-3 h-3 mr-1" /> View
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
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">Order Details</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 font-accent text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Order ID:</span> <span className="font-mono text-xs">{selectedOrder.id.slice(0, 12)}...</span></div>
                  <div><span className="text-muted-foreground">Status:</span> <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[selectedOrder.status]}`}>{selectedOrder.status}</span></div>
                  <div><span className="text-muted-foreground">Total:</span> <span className="font-semibold">₹{Number(selectedOrder.total).toLocaleString()}</span></div>
                  <div><span className="text-muted-foreground">Date:</span> {new Date(selectedOrder.created_at).toLocaleString()}</div>
                  {selectedOrder.coupon_code && <div><span className="text-muted-foreground">Coupon:</span> {selectedOrder.coupon_code}</div>}
                  {selectedOrder.discount && <div><span className="text-muted-foreground">Discount:</span> ₹{Number(selectedOrder.discount).toLocaleString()}</div>}
                </div>

                {selectedOrder.shipping_address && (
                  <div>
                    <p className="text-muted-foreground mb-1">Shipping Address:</p>
                    <p>{Object.values(selectedOrder.shipping_address).filter(Boolean).join(', ')}</p>
                  </div>
                )}

                <div>
                  <p className="text-muted-foreground mb-2">Items:</p>
                  {orderItems.length === 0 ? (
                    <p>No items found.</p>
                  ) : (
                    <div className="space-y-2">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-2 rounded bg-muted/50">
                          <div>
                            <p className="font-medium">{item.products?.name || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">Size: {item.size} · Color: {item.color} · Qty: {item.quantity}</p>
                          </div>
                          <span className="font-semibold">₹{Number(item.price).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
