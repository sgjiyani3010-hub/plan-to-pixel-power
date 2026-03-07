import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore, type Product } from '@/lib/store';

interface ProductCardProps {
  product: Product;
}

const badgeColors = {
  new: 'bg-secondary text-secondary-foreground',
  trending: 'bg-accent text-accent-foreground',
  bestseller: 'bg-highlight text-highlight-foreground',
};

const ProductCard = ({ product }: ProductCardProps) => {
  const { toggleWishlist, wishlist, addToCart } = useStore();
  const isWished = wishlist.includes(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badge */}
          {product.badge && (
            <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-accent font-bold uppercase tracking-wider ${badgeColors[product.badge]}`}>
              {product.badge}
            </span>
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <span className="absolute top-3 right-3 bg-accent text-accent-foreground px-2 py-1 rounded-md text-[10px] font-accent font-bold">
              -{discount}%
            </span>
          )}

          {/* Quick actions overlay */}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.preventDefault();
                addToCart({ product, quantity: 1, size: product.sizes[1] || product.sizes[0], color: product.colors[0] });
              }}
              className="bg-card text-foreground px-6 py-2.5 rounded-full font-accent text-xs font-semibold flex items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" />
              Quick Add
            </button>
          </div>
        </div>
      </Link>

      {/* Wishlist */}
      <button
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
        style={{ display: product.originalPrice && discount > 0 ? 'none' : undefined }}
      >
        <Heart className={`w-4 h-4 ${isWished ? 'fill-accent text-accent' : 'text-foreground'}`} />
      </button>

      {/* Info */}
      <div className="mt-3 px-1">
        <h3 className="font-body text-sm font-medium text-foreground truncate">{product.name}</h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-accent text-base font-bold text-foreground">₹{product.price}</span>
          {product.originalPrice && (
            <span className="font-body text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
          )}
        </div>
        {/* Color swatches */}
        <div className="flex gap-1 mt-2">
          {product.colors.slice(0, 4).map((c) => (
            <span key={c} className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
