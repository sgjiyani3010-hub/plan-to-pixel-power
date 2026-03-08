import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

interface Settings {
  store_name: string;
  logo_url: string;
  contact_email: string;
  contact_phone: string;
  shipping_fee: string;
  free_shipping_threshold: string;
  tax_rate: string;
  flash_sale_enabled: boolean;
  flash_sale_discount: string;
  instagram_url: string;
  facebook_url: string;
  twitter_url: string;
}

const defaultSettings: Settings = {
  store_name: 'Stylique', logo_url: '', contact_email: '', contact_phone: '',
  shipping_fee: '0', free_shipping_threshold: '999', tax_rate: '18',
  flash_sale_enabled: false, flash_sale_discount: '20',
  instagram_url: '', facebook_url: '', twitter_url: '',
};

const AdminSettings = () => {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('site_settings').select('key, value');
      if (data) {
        const s = { ...defaultSettings };
        data.forEach((row: any) => {
          if (row.key in s) {
            (s as any)[row.key] = typeof row.value === 'object' ? row.value.v : row.value;
          }
        });
        setSettings(s);
      }
      setLoaded(true);
    };
    fetch();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const entries = Object.entries(settings);
    for (const [key, value] of entries) {
      await supabase.from('site_settings').upsert(
        { key, value: { v: value }, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    }
    toast({ title: 'Settings saved' });
    setSaving(false);
  };

  const set = (key: keyof Settings, val: any) => setSettings((s) => ({ ...s, [key]: val }));

  if (!loaded) return <AdminLayout><div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Loading...</p></div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-bold text-foreground">Settings</h1>
          <Button onClick={handleSave} disabled={saving}><Save className="w-4 h-4 mr-2" /> {saving ? 'Saving...' : 'Save All'}</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="font-heading text-lg">Store Info</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="font-accent">Store Name</Label><Input value={settings.store_name} onChange={(e) => set('store_name', e.target.value)} /></div>
              <div><Label className="font-accent">Logo URL</Label><Input value={settings.logo_url} onChange={(e) => set('logo_url', e.target.value)} /></div>
              <div><Label className="font-accent">Contact Email</Label><Input value={settings.contact_email} onChange={(e) => set('contact_email', e.target.value)} /></div>
              <div><Label className="font-accent">Contact Phone</Label><Input value={settings.contact_phone} onChange={(e) => set('contact_phone', e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-heading text-lg">Shipping & Tax</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="font-accent">Shipping Fee (₹)</Label><Input type="number" value={settings.shipping_fee} onChange={(e) => set('shipping_fee', e.target.value)} /></div>
              <div><Label className="font-accent">Free Shipping Above (₹)</Label><Input type="number" value={settings.free_shipping_threshold} onChange={(e) => set('free_shipping_threshold', e.target.value)} /></div>
              <div><Label className="font-accent">Tax Rate (%)</Label><Input type="number" value={settings.tax_rate} onChange={(e) => set('tax_rate', e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-heading text-lg">Flash Sale</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Switch checked={settings.flash_sale_enabled} onCheckedChange={(v) => set('flash_sale_enabled', v)} />
                <Label className="font-accent">Enable Flash Sale</Label>
              </div>
              <div><Label className="font-accent">Flash Sale Discount (%)</Label><Input type="number" value={settings.flash_sale_discount} onChange={(e) => set('flash_sale_discount', e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="font-heading text-lg">Social Links</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label className="font-accent">Instagram URL</Label><Input value={settings.instagram_url} onChange={(e) => set('instagram_url', e.target.value)} /></div>
              <div><Label className="font-accent">Facebook URL</Label><Input value={settings.facebook_url} onChange={(e) => set('facebook_url', e.target.value)} /></div>
              <div><Label className="font-accent">Twitter URL</Label><Input value={settings.twitter_url} onChange={(e) => set('twitter_url', e.target.value)} /></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
