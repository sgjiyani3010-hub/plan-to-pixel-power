import { useState, useEffect } from 'react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, ShieldCheck, User, UserX } from 'lucide-react';
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
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);
  const [guestEmail, setGuestEmail] = useState('');
  const [useWalletBalance, setUseWalletBalance] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

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
  const walletDeduction = useWalletBalance ? Math.min(walletBalance, total + shipping) : 0;
  const grandTotal = total + shipping - walletDeduction;

  // Fetch wallet balance for logged-in users
  useEffect(() => {
    const fetchWallet = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
      if (data) setWalletBalance(Number(data.balance));
    };
    fetchWallet();
  }, [user]);

  // Pre-fill from profile if logged in
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (data) {
        setAddress({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          city: data.city || '',
          state: data.state || '',
          pincode: data.pincode || '',
        });
      }
    };
    loadProfile();
  }, [user]);

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

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleCheckout = async () => {
    if (!address.full_name || !address.phone || !address.address_line1 || !address.city || !address.state || !address.pincode) {
      toast({ title: 'Please fill all required address fields', variant: 'destructive' });
      return;
    }

    // Validate guest email
    if (!user && isGuestCheckout) {
      if (!guestEmail || !validateEmail(guestEmail)) {
        toast({ title: 'Please enter a valid email address', variant: 'destructive' });
        return;
      }
    }

    // If not logged in and not guest checkout, redirect to auth
    if (!user && !isGuestCheckout) {
      toast({ title: 'Please sign in or continue as guest', variant: 'destructive' });
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
        body: { 
          action: 'create-order', 
          items, 
          shipping_address: address,
          guest_email: !user ? guestEmail : undefined,
          use_wallet: useWalletBalance,
          wallet_amount: walletDeduction,
        },
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
          email: user?.email || guestEmail,
        },
        theme: { color: '#E94560' },
        handler: async (response: any) => {
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
            <div className="lg:col-span-2 space-y-6">
              {/* Guest checkout option */}
              {!user && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border p-6"
                >
                  <h2 className="font-heading text-lg font-bold text-foreground mb-4">Checkout Options</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      onClick={() => setIsGuestCheckout(false)}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        !isGuestCheckout ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <User className="w-5 h-5 text-primary" />
                      <div className="text-left">
                        <p className="font-accent font-semibold text-foreground text-sm">Sign In</p>
                        <p className="font-accent text-xs text-muted-foreground">Track orders & earn rewards</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setIsGuestCheckout(true)}
                      className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                        isGuestCheckout ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <UserX className="w-5 h-5 text-muted-foreground" />
                      <div className="text-left">
                        <p className="font-accent font-semibold text-foreground text-sm">Guest Checkout</p>
                        <p className="font-accent text-xs text-muted-foreground">Quick checkout without account</p>
                      </div>
                    </button>
                  </div>

                  {!isGuestCheckout && (
                    <div className="mt-4 text-center">
                      <Link to="/auth" className="text-primary hover:underline font-accent text-sm">
                        Sign in to your account →
                      </Link>
                    </div>
                  )}

                  {isGuestCheckout && (
                    <div className="mt-4">
                      <Label className="font-accent text-xs">Email Address *</Label>
                      <Input
                        type="email"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="mt-1"
                      />
                      <p className="font-accent text-xs text-muted-foreground mt-1">
                        We'll send order confirmation to this email
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Address form - only show if logged in or guest checkout selected */}
              {(user || isGuestCheckout) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-2xl border border-border p-6"
                >
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
                </motion.div>
              )}

              {/* Order items */}
              {(user || isGuestCheckout) && (
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
              )}
            </div>

            {/* Payment summary */}
            {(user || isGuestCheckout) && (
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                  <h3 className="font-accent text-sm font-bold uppercase tracking-wider text-foreground mb-6">Payment Summary</h3>
                  
                  {/* Wallet balance option */}
                  {user && walletBalance > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20 mb-4">
                      <Checkbox
                        id="use-wallet"
                        checked={useWalletBalance}
                        onCheckedChange={(checked) => setUseWalletBalance(checked === true)}
                      />
                      <label htmlFor="use-wallet" className="font-accent text-sm text-foreground cursor-pointer flex-1">
                        Use wallet balance
                        <span className="text-green-600 font-semibold ml-1">(₹{walletBalance})</span>
                      </label>
                    </div>
                  )}

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
                    {walletDeduction > 0 && (
                      <div className="flex justify-between font-accent text-sm">
                        <span className="text-green-600">Wallet Credit</span>
                        <span className="text-green-600 font-medium">-₹{walletDeduction}</span>
                      </div>
                    )}
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
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
