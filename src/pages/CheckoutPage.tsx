import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage = () => {
  const { cart, cartTotal, cartCount } = useStore();
  const clearCart = useStore((s) => s.clearCart);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    full_name: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const total = cartTotal();
  const shipping = total >= 999 ? 0 : 79;
  const grandTotal = total + shipping;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Please sign in to checkout</h1>
          <Link to="/auth" className="text-accent hover:underline font-accent">Sign In →</Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-20 text-center">
          <h1 className="font-heading text-2xl font-bold text-foreground mb-4">Your cart is empty</h1>
          <Link to="/shop" className="text-accent hover:underline font-accent">Continue Shopping →</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    if (!address.full_name || !address.phone || !address.address_line1 || !address.city || !address.state || !address.pincode) {
      toast({ title: 'Please fill all required address fields', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast({ title: 'Failed to load payment gateway', variant: 'destructive' });
        setLoading(false);
        return;
      }

      const items = cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));

      const { data, error } = await supabase.functions.invoke('razorpay', {
        body: { action: 'create-order', items, shipping_address: address },
      });

      if (error || !data?.razorpay_order_id) {
        toast({ title: 'Failed to create order', description: error?.message || data?.error, variant: 'destructive' });
        setLoading(false);
        return;
      }

      const options = {
        key: data.razorpay_key_id,
        amount: data.amount,
        currency: 'INR',
        name: 'STYLIQUE',
        description: `Order - ${cartCount()} items`,
        order_id: data.razorpay_order_id,
        prefill: {
          name: address.full_name,
          contact: address.phone,
          email: user.email,
        },
        theme: { color: '#E94560' },
        handler: async (response: any) => {
          // Verify payment
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke('razorpay', {
            body: {
              action: 'verify-payment',
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: data.order_id,
            },
          });

          if (verifyError || !verifyData?.success) {
            toast({ title: 'Payment verification failed', variant: 'destructive' });
          } else {
            clearCart();
            toast({ title: 'Order placed successfully! 🎉' });
            navigate(`/order-success/${data.order_id}`);
          }
        },
        modal: {
          ondismiss: () => {
            toast({ title: 'Payment cancelled' });
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast({ title: 'Something went wrong', description: err.message, variant: 'destructive' });
    }

    setLoading(false);
  };

  const setField = (key: string, val: string) => setAddress((a) => ({ ...a, [key]: val }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <Link to="/cart" className="inline-flex items-center gap-1 text-muted-foreground font-accent text-sm mb-6 hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Cart
          </Link>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8"
          >
            Checkout
          </motion.h1>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Address form */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-heading text-lg font-bold text-foreground mb-4">Shipping Address</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="font-accent text-xs">Full Name *</Label>
                    <Input value={address.full_name} onChange={(e) => setField('full_name', e.target.value)} />
                  </div>
                  <div>
                    <Label className="font-accent text-xs">Phone Number *</Label>
                    <Input value={address.phone} onChange={(e) => setField('phone', e.target.value)} type="tel" />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="font-accent text-xs">Address Line 1 *</Label>
                    <Input value={address.address_line1} onChange={(e) => setField('address_line1', e.target.value)} />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="font-accent text-xs">Address Line 2</Label>
                    <Input value={address.address_line2} onChange={(e) => setField('address_line2', e.target.value)} />
                  </div>
                  <div>
                    <Label className="font-accent text-xs">City *</Label>
                    <Input value={address.city} onChange={(e) => setField('city', e.target.value)} />
                  </div>
                  <div>
                    <Label className="font-accent text-xs">State *</Label>
                    <Input value={address.state} onChange={(e) => setField('state', e.target.value)} />
                  </div>
                  <div>
                    <Label className="font-accent text-xs">Pincode *</Label>
                    <Input value={address.pincode} onChange={(e) => setField('pincode', e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Order items */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-heading text-lg font-bold text-foreground mb-4">Order Items</h2>
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <div className="w-12 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-accent text-sm font-medium text-foreground truncate">{item.product.name}</p>
                        <p className="font-accent text-xs text-muted-foreground">Size: {item.size} · Qty: {item.quantity}</p>
                      </div>
                      <span className="font-accent text-sm font-bold text-foreground">₹{item.product.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                <h3 className="font-accent text-sm font-bold uppercase tracking-wider text-foreground mb-6">Payment Summary</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between font-accent text-sm">
                    <span className="text-muted-foreground">Subtotal ({cartCount()} items)</span>
                    <span className="text-foreground font-medium">₹{total}</span>
                  </div>
                  <div className="flex justify-between font-accent text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-foreground'}`}>
                      {shipping === 0 ? 'Free' : `₹${shipping}`}
                    </span>
                  </div>
                </div>
                <div className="border-t border-border pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="font-accent text-sm font-bold text-foreground">Total</span>
                    <span className="font-accent text-xl font-bold text-foreground">₹{grandTotal}</span>
                  </div>
                  <p className="font-accent text-[10px] text-muted-foreground mt-1">Inclusive of all taxes</p>
                </div>

                <Button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl font-accent font-semibold text-sm"
                >
                  {loading ? 'Processing...' : `Pay ₹${grandTotal}`}
                </Button>

                <div className="flex items-center justify-center gap-1 mt-4 text-muted-foreground">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="font-accent text-xs">Secured by Razorpay</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
