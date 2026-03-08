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
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Palette, Upload, Search } from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type Product = Tables<'products'>;
type Variation = Tables<'product_variations'>;

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
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [uploading, setUploading] = useState(false);

  // Variation management
  const [varDialogOpen, setVarDialogOpen] = useState(false);
  const [varProductId, setVarProductId] = useState<string | null>(null);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [varForm, setVarForm] = useState({ color: '', name: '', image: '' });
  const [varUploading, setVarUploading] = useState(false);

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
      name: p.name, price: String(p.price), original_price: p.original_price ? String(p.original_price) : '',
      image: p.image, category: p.category, badge: p.badge || '',
      colors: p.colors.join(','), sizes: p.sizes.join(','), description: p.description,
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (file: File, callback: (url: string) => void, setLoadingFn: (v: boolean) => void) => {
    setLoadingFn(true);
    const ext = file.name.split('.').pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('product-images').upload(path, file);
    if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); setLoadingFn(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
    callback(publicUrl);
    setLoadingFn(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      name: form.name, price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      image: form.image, category: form.category, badge: form.badge || null,
      colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
      sizes: form.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      description: form.description,
    };

    const { error } = editId
      ? await supabase.from('products').update(payload).eq('id', editId)
      : await supabase.from('products').insert(payload);

    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else toast({ title: editId ? 'Product updated' : 'Product created' });

    setSaving(false); setDialogOpen(false); fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Product deleted' }); fetchProducts(); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('products').update({ is_active: !current }).eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else fetchProducts();
  };

  // Variations
  const openVariations = async (productId: string) => {
    setVarProductId(productId);
    const { data } = await supabase.from('product_variations').select('*').eq('product_id', productId);
    setVariations(data || []);
    setVarForm({ color: '', name: '', image: '' });
    setVarDialogOpen(true);
  };

  const addVariation = async () => {
    if (!varProductId || !varForm.color || !varForm.image) return;
    const { error } = await supabase.from('product_variations').insert({
      product_id: varProductId, color: varForm.color, name: varForm.name || null, image: varForm.image,
    });
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Variation added' });
      setVarForm({ color: '', name: '', image: '' });
      const { data } = await supabase.from('product_variations').select('*').eq('product_id', varProductId);
      setVariations(data || []);
    }
  };

  const deleteVariation = async (id: string) => {
    const { error } = await supabase.from('product_variations').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message, variant: 'destructive' });
    else {
      toast({ title: 'Variation deleted' });
      if (varProductId) {
        const { data } = await supabase.from('product_variations').select('*').eq('product_id', varProductId);
        setVariations(data || []);
      }
    }
  };

  const set = (key: keyof ProductForm, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="font-heading text-2xl font-bold text-foreground">Products</h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-48" />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="plain">Plain</SelectItem>
                <SelectItem value="graphic">Graphic</SelectItem>
                <SelectItem value="polo">Polo</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader><DialogTitle className="font-heading">{editId ? 'Edit Product' : 'New Product'}</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div><Label className="font-accent">Name</Label><Input value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label className="font-accent">Price (₹)</Label><Input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} /></div>
                    <div><Label className="font-accent">Original Price</Label><Input type="number" value={form.original_price} onChange={(e) => set('original_price', e.target.value)} /></div>
                  </div>
                  <div>
                    <Label className="font-accent">Image</Label>
                    <div className="flex gap-2">
                      <Input value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="URL or upload" className="flex-1" />
                      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => document.getElementById('product-img-upload')?.click()}>
                        <Upload className="w-4 h-4" />
                      </Button>
                      <input id="product-img-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file, (url) => set('image', url), setUploading);
                      }} />
                    </div>
                    {form.image && <img src={form.image} alt="Preview" className="mt-2 h-20 w-20 object-cover rounded" />}
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
                  <div><Label className="font-accent">Colors (comma-separated hex)</Label><Input value={form.colors} onChange={(e) => set('colors', e.target.value)} placeholder="#000000,#FFFFFF" /></div>
                  <div><Label className="font-accent">Sizes (comma-separated)</Label><Input value={form.sizes} onChange={(e) => set('sizes', e.target.value)} placeholder="S,M,L,XL" /></div>
                  <div><Label className="font-accent">Description</Label><Textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} /></div>
                  <Button onClick={handleSave} disabled={saving || !form.name || !form.price} className="w-full">
                    {saving ? 'Saving...' : editId ? 'Update Product' : 'Create Product'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle className="font-heading text-lg">{filtered.length} Products</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-accent">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-2 pr-4">Image</th>
                    <th className="pb-2 pr-4">Name</th>
                    <th className="pb-2 pr-4">Category</th>
                    <th className="pb-2 pr-4">Price</th>
                    <th className="pb-2 pr-4">Badge</th>
                    <th className="pb-2 pr-4">Active</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b border-border/50">
                      <td className="py-3 pr-4">
                        <img src={p.image} alt={p.name} className="h-10 w-10 object-cover rounded" />
                      </td>
                      <td className="py-3 pr-4 font-medium">{p.name}</td>
                      <td className="py-3 pr-4 capitalize">{p.category}</td>
                      <td className="py-3 pr-4">₹{Number(p.price).toLocaleString()}</td>
                      <td className="py-3 pr-4 capitalize">{p.badge || '—'}</td>
                      <td className="py-3 pr-4">
                        <Switch checked={p.is_active} onCheckedChange={() => toggleActive(p.id, p.is_active)} />
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline" onClick={() => openVariations(p.id)} title="Variations">
                            <Palette className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Variations Dialog */}
        <Dialog open={varDialogOpen} onOpenChange={setVarDialogOpen}>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="font-heading">Product Variations</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                {variations.length === 0 ? (
                  <p className="text-muted-foreground text-sm font-accent">No variations yet.</p>
                ) : (
                  variations.map((v) => (
                    <div key={v.id} className="flex items-center gap-3 p-2 rounded bg-muted/50">
                      <img src={v.image} alt={v.color} className="h-10 w-10 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{v.name || v.color}</p>
                        <p className="text-xs text-muted-foreground">{v.color}</p>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => deleteVariation(v.id)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <p className="font-accent font-medium text-sm">Add Variation</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="font-accent text-xs">Color</Label><Input value={varForm.color} onChange={(e) => setVarForm((f) => ({ ...f, color: e.target.value }))} placeholder="#000000" /></div>
                  <div><Label className="font-accent text-xs">Name</Label><Input value={varForm.name} onChange={(e) => setVarForm((f) => ({ ...f, name: e.target.value }))} placeholder="Black" /></div>
                </div>
                <div>
                  <Label className="font-accent text-xs">Image</Label>
                  <div className="flex gap-2">
                    <Input value={varForm.image} onChange={(e) => setVarForm((f) => ({ ...f, image: e.target.value }))} placeholder="URL or upload" className="flex-1" />
                    <Button type="button" variant="outline" size="sm" disabled={varUploading} onClick={() => document.getElementById('var-img-upload')?.click()}>
                      <Upload className="w-4 h-4" />
                    </Button>
                    <input id="var-img-upload" type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file, (url) => setVarForm((f) => ({ ...f, image: url })), setVarUploading);
                    }} />
                  </div>
                </div>
                <Button onClick={addVariation} disabled={!varForm.color || !varForm.image} className="w-full">Add Variation</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
