import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

interface CouponForm {
  code: string;
  discount_type: string;
  discount_value: string;
  min_order_amount: string;
  max_uses: string;
  is_active: boolean;
  expires_at: string;
}

const emptyForm: CouponForm = {
  code: '', discount_type: 'percentage', discount_value: '', min_order_amount: '0', max_uses: '', is_active: true, expires_at: '',
};

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    setCoupons((data as Coupon[]) || []);
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (c: Coupon) => {
    setEditId(c.id);
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: String(c.discount_value),
      min_order_amount: String(c.min_order_amount),
      max_uses: c.max_uses ? String(c.max_uses) : '',
      is_active: c.is_active,
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      code: form.code.toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount) || 0,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      is_active: form.is_active,
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };

    const { error } = editId
      ? await supabase.from('coupons').update(payload).eq('id', editId)
      : await supabase.from('coupons').insert(payload);

    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: editId ? 'Coupon updated' : 'Coupon created' });

    setSaving(false);
    setDialogOpen(false);
    fetchCoupons();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    const { error } = await supabase.from('coupons').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Coupon deleted' }); fetchCoupons(); }
  };

  const set = (key: keyof CouponForm, val: any) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">Coupons</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Coupon</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle className="font-heading">{editId ? 'Edit Coupon' : 'New Coupon'}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="font-accent">Code</Label>
                  <Input value={form.code} onChange={(e) => set('code', e.target.value)} placeholder="SAVE20" className="uppercase" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-accent">Type</Label>
                    <Select value={form.discount_type} onValueChange={(v) => set('discount_type', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed (₹)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-accent">Value</Label>
                    <Input type="number" value={form.discount_value} onChange={(e) => set('discount_value', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-accent">Min Order (₹)</Label>
                    <Input type="number" value={form.min_order_amount} onChange={(e) => set('min_order_amount', e.target.value)} />
                  </div>
                  <div>
                    <Label className="font-accent">Max Uses</Label>
                    <Input type="number" value={form.max_uses} onChange={(e) => set('max_uses', e.target.value)} placeholder="Unlimited" />
                  </div>
                </div>
                <div>
                  <Label className="font-accent">Expires At</Label>
                  <Input type="datetime-local" value={form.expires_at} onChange={(e) => set('expires_at', e.target.value)} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_active} onCheckedChange={(v) => set('is_active', v)} />
                  <Label className="font-accent">Active</Label>
                </div>
                <Button onClick={handleSave} disabled={saving || !form.code || !form.discount_value} className="w-full">
                  {saving ? 'Saving...' : editId ? 'Update Coupon' : 'Create Coupon'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader><CardTitle className="font-heading text-lg">{coupons.length} Coupons</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-accent">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Code</th>
                    <th className="pb-2 pr-4">Discount</th>
                    <th className="pb-2 pr-4">Min Order</th>
                    <th className="pb-2 pr-4">Usage</th>
                    <th className="pb-2 pr-4">Active</th>
                    <th className="pb-2 pr-4">Expires</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c.id} className="border-b border-border/50">
                      <td className="py-3 pr-4 font-mono font-medium">{c.code}</td>
                      <td className="py-3 pr-4">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</td>
                      <td className="py-3 pr-4">₹{Number(c.min_order_amount).toLocaleString()}</td>
                      <td className="py-3 pr-4">{c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}</td>
                      <td className="py-3 pr-4">{c.is_active ? '✓' : '✗'}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : '—'}</td>
                      <td className="py-3 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(c)}><Pencil className="w-3 h-3" /></Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(c.id)}><Trash2 className="w-3 h-3" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCoupons;
