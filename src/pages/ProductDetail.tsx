import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Minus, Plus, ChevronLeft, Star, Truck, RotateCcw, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { products } from '@/lib/products';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';

const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const { addToCart, toggleWishlist, wishlist } = useStore();

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground font-body">Product not found</p>
      </div>
    );
  }

  const isWished = wishlist.includes(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    addToCart({
      product,
      quantity,
      size: selectedSize,
      color: selectedColor || product.colors[0],
    });
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <Link to="/shop" className="inline-flex items-center gap-1 text-muted-foreground font-body text-sm mb-8 hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to Shop
          </Link>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-muted"
            >
              <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              {product.badge && (
                <span className="absolute top-4 left-4 bg-accent text-accent-foreground px-4 py-1.5 rounded-full font-accent text-xs font-bold uppercase">
                  {product.badge}
                </span>
              )}
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-highlight text-highlight' : 'text-border'}`} />
                  ))}
                </div>
                <span className="font-body text-sm text-muted-foreground">(24 reviews)</span>
              </div>

              <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">{product.name}</h1>

              <div className="flex items-center gap-3 mb-6">
                <span className="font-accent text-3xl font-bold text-foreground">₹{product.price}</span>
                {product.originalPrice && (
                  <>
                    <span className="font-body text-xl text-muted-foreground line-through">₹{product.originalPrice}</span>
                    <span className="bg-accent/10 text-accent px-3 py-1 rounded-full font-accent text-xs font-bold">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="font-body text-foreground/70 leading-relaxed mb-8">{product.description}</p>

              {/* Colors */}
              <div className="mb-6">
                <h3 className="font-accent text-sm font-semibold text-foreground mb-3">Color</h3>
                <div className="flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === c ? 'border-accent scale-110' : 'border-border'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-accent text-sm font-semibold text-foreground">Size</h3>
                  <button className="font-body text-xs text-accent hover:underline">Size Guide</button>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`min-w-[48px] h-10 px-3 rounded-lg font-accent text-xs font-semibold border transition-all ${
                        selectedSize === s
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card text-foreground border-border hover:border-foreground/30'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity + Add to cart */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-border rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2.5 text-foreground hover:bg-muted transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-accent text-sm font-semibold text-foreground">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2.5 text-foreground hover:bg-muted transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground py-3.5 rounded-xl font-accent font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-accent/20"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-12 h-12 rounded-xl border border-border flex items-center justify-center transition-colors ${
                    isWished ? 'bg-accent/10' : 'hover:bg-muted'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isWished ? 'fill-accent text-accent' : 'text-foreground'}`} />
                </button>
              </div>

              {/* Trust badges */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-6 border-t border-border">
                {[
                  { icon: Truck, label: 'Free Shipping', sub: 'On orders ₹999+' },
                  { icon: RotateCcw, label: '7-Day Returns', sub: 'Easy exchange' },
                  { icon: Shield, label: 'Secure Payment', sub: 'UPI, Cards, COD' },
                ].map(({ icon: Icon, label, sub }) => (
                  <div key={label} className="text-center">
                    <Icon className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                    <div className="font-accent text-[10px] font-semibold text-foreground">{label}</div>
                    <div className="font-body text-[10px] text-muted-foreground">{sub}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
