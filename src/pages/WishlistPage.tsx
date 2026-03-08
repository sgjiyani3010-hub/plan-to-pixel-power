import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Trash2, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useStore, type Product } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const WishlistPage = () => {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlistProducts = async () => {
      setLoading(true);
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('products')
        .select('*')
        .in('id', wishlist)
        .eq('is_active', true);

      if (data) {
        setProducts(
          data.map((d) => ({
            id: d.id,
            name: d.name,
            price: Number(d.price),
            originalPrice: d.original_price ? Number(d.original_price) : undefined,
            image: d.image,
            category: d.category as Product['category'],
            badge: d.badge as Product['badge'],
            colors: d.colors,
            sizes: d.sizes,
            description: d.description,
          }))
        );
      }
      setLoading(false);
    };

    fetchWishlistProducts();
  }, [wishlist]);

  const handleQuickAdd = (product: Product) => {
    addToCart({
      product,
      quantity: 1,
      size: product.sizes[1] || product.sizes[0],
      color: product.colors[0],
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-8">
              <Heart className="w-7 h-7 text-accent fill-accent" />
              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground">My Wishlist</h1>
              {wishlist.length > 0 && (
                <span className="bg-accent/10 text-accent px-3 py-1 rounded-full font-accent text-sm font-semibold">
                  {wishlist.length} item{wishlist.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : products.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-6" />
              <h2 className="font-heading text-xl font-semibold text-foreground mb-2">Your wishlist is empty</h2>
              <p className="font-body text-muted-foreground mb-6">Save items you love to your wishlist and find them here anytime.</p>
              <Link to="/shop">
                <Button className="font-accent gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
                  <ShoppingBag className="w-4 h-4" /> Browse Products
                </Button>
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {products.map((product) => {
                  const discount = product.originalPrice
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : 0;

                  return (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                      className="bg-card rounded-xl border border-border overflow-hidden group"
                    >
                      <Link to={`/product/${product.id}`}>
                        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {discount > 0 && (
                            <span className="absolute top-3 left-3 bg-accent text-accent-foreground px-2 py-1 rounded-md text-[10px] font-accent font-bold">
                              -{discount}%
                            </span>
                          )}
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-body text-sm font-medium text-foreground truncate hover:text-accent transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mt-1 mb-3">
                          <span className="font-accent text-base font-bold text-foreground">₹{product.price}</span>
                          {product.originalPrice && (
                            <span className="font-body text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleQuickAdd(product)}
                            className="flex-1 gap-1 font-accent text-xs bg-accent text-accent-foreground hover:bg-accent/90"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { toggleWishlist(product.id); toast.info('Removed from wishlist'); }}
                            className="px-3"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default WishlistPage;
