import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Eye, Search } from 'lucide-react';

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
}

interface CustomerOrder {
  id: string;
  total: number;
  status: string;
  created_at: string;
}

const AdminCustomers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Profile | null>(null);
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      setProfiles(data || []);
    };
    fetch();
  }, []);

  const viewCustomer = async (profile: Profile) => {
    setSelectedCustomer(profile);
    const { data } = await supabase
      .from('orders')
      .select('id, total, status, created_at')
      .eq('user_id', profile.user_id)
      .order('created_at', { ascending: false });
    setCustomerOrders(data || []);
    setDetailOpen(true);
  };

  const filtered = profiles.filter((p) => {
    const q = search.toLowerCase();
    return !q || (p.full_name || '').toLowerCase().includes(q) || (p.city || '').toLowerCase().includes(q) || (p.phone || '').includes(q);
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">Customers</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="font-heading text-lg">{filtered.length} Customers</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-accent">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Phone</th>
                    <th className="pb-2 pr-4">City</th>
                    <th className="pb-2 pr-4">Joined</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium">{p.full_name || 'Unnamed'}</td>
                      <td className="py-3 pr-4">{p.phone || '—'}</td>
                      <td className="py-3 pr-4">{p.city || '—'}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                      <td className="py-3">
                        <Button size="sm" variant="outline" onClick={() => viewCustomer(p)}>
                          <Eye className="w-3 h-3 mr-1" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle className="font-heading">Customer Details</DialogTitle></DialogHeader>
            {selectedCustomer && (
              <div className="space-y-4 font-accent text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Name:</span> {selectedCustomer.full_name || 'Unnamed'}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {selectedCustomer.phone || '—'}</div>
                  <div><span className="text-muted-foreground">City:</span> {selectedCustomer.city || '—'}</div>
                  <div><span className="text-muted-foreground">State:</span> {selectedCustomer.state || '—'}</div>
                  <div><span className="text-muted-foreground">Joined:</span> {new Date(selectedCustomer.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2 font-medium">Orders ({customerOrders.length})</p>
                  {customerOrders.length === 0 ? <p>No orders.</p> : (
                    <div className="space-y-2">
                      {customerOrders.map((o) => (
                        <div key={o.id} className="flex justify-between items-center p-2 rounded bg-muted/50">
                          <div>
                            <p className="font-mono text-xs">{o.id.slice(0, 8)}...</p>
                            <p className="text-xs text-muted-foreground capitalize">{o.status} · {new Date(o.created_at).toLocaleDateString()}</p>
                          </div>
                          <span className="font-semibold">₹{Number(o.total).toLocaleString()}</span>
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

export default AdminCustomers;
