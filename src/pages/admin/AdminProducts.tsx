import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;

interface ProductForm {
  name: string;
  price: string;
  original_price: string;
  image: string;
  category: string;
  badge: string;
  colors: string;
  sizes: string;
  description: string;
}

const emptyForm: ProductForm = {
  name: '', price: '', original_price: '', image: '', category: 'plain',
  badge: '', colors: '', sizes: 'S,M,L,XL', description: '',
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
  };

  useEffect(() => { fetchProducts(); }, []);

  const openCreate = () => { setEditId(null); setForm(emptyForm); setDialogOpen(true); };

  const openEdit = (p: Product) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : '',
      image: p.image,
      category: p.category,
      badge: p.badge || '',
      colors: p.colors.join(','),
      sizes: p.sizes.join(','),
      description: p.description,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      image: form.image,
      category: form.category,
      badge: form.badge || null,
      colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      description: form.description,
    };

    if (editId) {
      const { error } = await supabase.from('products').update(payload).eq('id', editId);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Product updated' });
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
      else toast({ title: 'Product created' });
    }

    setSaving(false);
    setDialogOpen(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Product deleted' }); fetchProducts(); }
  };

  const set = (key: keyof ProductForm, val: string) => setForm((f) => ({ ...f, [key]: val }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">Products</h1>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-heading">{editId ? 'Edit Product' : 'New Product'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="font-accent">Name</Label>
                  <Input value={form.name} onChange={(e) => set('name', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-accent">Price (₹)</Label>
                    <Input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} />
                  </div>
                  <div>
                    <Label className="font-accent">Original Price</Label>
                    <Input type="number" value={form.original_price} onChange={(e) => set('original_price', e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label className="font-accent">Image URL</Label>
                  <Input value={form.image} onChange={(e) => set('image', e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="font-accent">Category</Label>
                    <Select value={form.category} onValueChange={(v) => set('category', v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="plain">Plain</SelectItem>
                        <SelectItem value="graphic">Graphic</SelectItem>
                        <SelectItem value="polo">Polo</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="font-accent">Badge</Label>
                    <Select value={form.badge} onValueChange={(v) => set('badge', v)}>
                      <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="trending">Trending</SelectItem>
                        <SelectItem value="bestseller">Bestseller</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="font-accent">Colors (comma-separated hex)</Label>
                  <Input value={form.colors} onChange={(e) => set('colors', e.target.value)} placeholder="#000000,#FFFFFF" />
                </div>
                <div>
                  <Label className="font-accent">Sizes (comma-separated)</Label>
                  <Input value={form.sizes} onChange={(e) => set('sizes', e.target.value)} placeholder="S,M,L,XL" />
                </div>
                <div>
                  <Label className="font-accent">Description</Label>
                  <Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} />
                </div>
                <Button onClick={handleSave} disabled={saving || !form.name || !form.price} className="w-full">
                  {saving ? 'Saving...' : editId ? 'Update Product' : 'Create Product'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-lg">{products.length} Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-accent">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Category</th>
                    <th className="pb-2 pr-4">Price</th>
                    <th className="pb-2 pr-4">Badge</th>
                    <th className="pb-2 pr-4">Active</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium">{p.name}</td>
                      <td className="py-3 pr-4 capitalize">{p.category}</td>
                      <td className="py-3 pr-4">₹{Number(p.price).toLocaleString()}</td>
                      <td className="py-3 pr-4 capitalize">{p.badge || '—'}</td>
                      <td className="py-3 pr-4">{p.is_active ? '✓' : '✗'}</td>
                      <td className="py-3 flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
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

export default AdminProducts;
