import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useStore } from '@/lib/store';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useStore();
  const total = cartTotal();
  const shipping = total >= 999 ? 0 : 79;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-heading text-4xl font-bold text-foreground mb-2"
          >
            Shopping Cart
          </motion.h1>
          <p className="text-muted-foreground font-body mb-10">{cart.length} items</p>

          {cart.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
              <p className="text-muted-foreground font-body mb-6">Add some amazing t-shirts to get started!</p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-8 py-3 rounded-full font-accent font-semibold text-sm"
              >
                Start Shopping <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-10">
              {/* Cart items */}
              <div className="lg:col-span-2 space-y-4">
                {cart.map((item, i) => (
                  <motion.div
                    key={`${item.product.id}-${item.size}-${item.color}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-4 bg-card rounded-xl p-4 border border-border"
                  >
                    <Link to={`/product/${item.product.id}`} className="w-24 h-28 rounded-lg overflow-hidden bg-muted shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="font-body text-sm font-medium text-foreground truncate">{item.product.name}</h3>
                          <p className="font-body text-xs text-muted-foreground mt-0.5">
                            Size: {item.size} • Color: <span className="inline-block w-3 h-3 rounded-full align-middle border border-border" style={{ backgroundColor: item.color }} />
                          </p>
                        </div>
                        <button onClick={() => removeFromCart(item.product.id)} className="text-muted-foreground hover:text-foreground transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-border rounded-lg">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="px-2 py-1 text-foreground">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 font-accent text-xs font-semibold text-foreground">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="px-2 py-1 text-foreground">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-accent text-sm font-bold text-foreground">₹{item.product.price * item.quantity}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Order summary */}
              <div className="lg:col-span-1">
                <div className="bg-card rounded-2xl border border-border p-6 sticky top-24">
                  <h3 className="font-accent text-sm font-bold uppercase tracking-wider text-foreground mb-6">Order Summary</h3>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground font-medium">₹{total}</span>
                    </div>
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-foreground'}`}>
                        {shipping === 0 ? 'Free' : `₹${shipping}`}
                      </span>
                    </div>
                    {shipping > 0 && (
                      <p className="font-body text-[10px] text-accent">
                        Add ₹{999 - total} more for free shipping!
                      </p>
                    )}
                  </div>
                  <div className="border-t border-border pt-4 mb-6">
                    <div className="flex justify-between">
                      <span className="font-accent text-sm font-bold text-foreground">Total</span>
                      <span className="font-accent text-xl font-bold text-foreground">₹{total + shipping}</span>
                    </div>
                    <p className="font-body text-[10px] text-muted-foreground mt-1">Inclusive of all taxes</p>
                  </div>

                  {/* Coupon */}
                  <div className="flex gap-2 mb-6">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-2 font-body text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
                    />
                    <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-accent text-xs font-semibold">
                      Apply
                    </button>
                  </div>

                  <button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-3.5 rounded-xl font-accent font-semibold text-sm transition-all hover:shadow-lg hover:shadow-accent/20">
                    Proceed to Checkout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CartPage;
