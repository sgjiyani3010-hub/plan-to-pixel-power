import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, MapPin, LogOut, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface Profile {
  full_name: string | null;
  phone: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  order_items: { product_id: string; quantity: number; price: number; size: string; color: string }[];
}

const ProfilePage = () => {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({
    full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', pincode: '',
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      setLoadingData(true);
      const [profileRes, ordersRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).single(),
        supabase.from('orders').select('*, order_items(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      if (profileRes.data) {
        const p = profileRes.data;
        setProfile({
          full_name: p.full_name, phone: p.phone,
          address_line1: p.address_line1, address_line2: p.address_line2,
          city: p.city, state: p.state, pincode: p.pincode,
        });
      }
      if (ordersRes.data) setOrders(ordersRes.data as Order[]);
      setLoadingData(false);
    };
    fetchData();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from('profiles').update(profile).eq('user_id', user.id);
    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    } else {
      toast({ title: 'Saved', description: 'Your profile has been updated.' });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const statusColor = (s: string) => {
    switch (s) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (authLoading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-heading text-3xl font-bold text-foreground">My Account</h1>
              <p className="text-muted-foreground font-accent text-sm mt-1">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="gap-2 font-accent">
              <LogOut className="w-4 h-4" /> Sign Out
            </Button>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="profile" className="gap-2 font-accent"><User className="w-4 h-4" /> Profile</TabsTrigger>
              <TabsTrigger value="address" className="gap-2 font-accent"><MapPin className="w-4 h-4" /> Address</TabsTrigger>
              <TabsTrigger value="orders" className="gap-2 font-accent"><Package className="w-4 h-4" /> Orders</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="bg-card rounded-xl border border-border p-6 space-y-5">
                <h2 className="font-heading text-xl font-semibold text-foreground">Personal Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-accent">Full Name</Label>
                    <Input value={profile.full_name || ''} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-accent">Phone</Label>
                    <Input value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-accent">Email</Label>
                  <Input value={user?.email || ''} disabled className="bg-muted" />
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2 font-accent bg-accent text-accent-foreground hover:bg-accent/90">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="address">
              <div className="bg-card rounded-xl border border-border p-6 space-y-5">
                <h2 className="font-heading text-xl font-semibold text-foreground">Shipping Address</h2>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="font-accent">Address Line 1</Label>
                    <Input value={profile.address_line1 || ''} onChange={(e) => setProfile({ ...profile, address_line1: e.target.value })} placeholder="House/Flat No., Street" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-accent">Address Line 2</Label>
                    <Input value={profile.address_line2 || ''} onChange={(e) => setProfile({ ...profile, address_line2: e.target.value })} placeholder="Landmark, Area" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="font-accent">City</Label>
                      <Input value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-accent">State</Label>
                      <Input value={profile.state || ''} onChange={(e) => setProfile({ ...profile, state: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-accent">Pincode</Label>
                      <Input value={profile.pincode || ''} onChange={(e) => setProfile({ ...profile, pincode: e.target.value })} />
                    </div>
                  </div>
                </div>
                <Button onClick={handleSave} disabled={saving} className="gap-2 font-accent bg-accent text-accent-foreground hover:bg-accent/90">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Address
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="orders">
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-12 text-center">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-accent text-muted-foreground">No orders yet.</p>
                    <Button variant="outline" className="mt-4 font-accent" onClick={() => navigate('/shop')}>Start Shopping</Button>
                  </div>
                ) : (
                  orders.map((order) => (
                    <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-xl border border-border p-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <div>
                          <p className="font-accent text-xs text-muted-foreground">Order #{order.id.slice(0, 8)}</p>
                          <p className="font-accent text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${statusColor(order.status)} font-accent text-xs capitalize`}>{order.status}</Badge>
                          <span className="font-heading font-bold text-foreground">₹{order.total.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground font-accent">
                        {order.order_items.length} item{order.order_items.length > 1 ? 's' : ''} — {order.order_items.map(i => `${i.quantity}× (${i.size}, ${i.color})`).join(', ')}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
