import { motion } from 'framer-motion';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useStore, type Product } from '@/lib/store';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const badgeColors = {
  new: 'bg-secondary text-secondary-foreground',
  trending: 'bg-accent text-accent-foreground',
  bestseller: 'bg-highlight text-highlight-foreground',
};

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const { toggleWishlist, wishlist, addToCart } = useStore();
  const isWished = wishlist.includes(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      className="group relative"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted shadow-sm transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-primary/10">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          {/* Badge */}
          {product.badge && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-accent font-bold uppercase tracking-wider ${badgeColors[product.badge]}`}
            >
              {product.badge}
            </motion.span>
          )}

          {/* Discount badge */}
          {discount > 0 && (
            <span className="absolute top-3 right-3 bg-accent text-accent-foreground px-2 py-1 rounded-md text-[10px] font-accent font-bold">
              -{discount}%
            </span>
          )}

          {/* Quick actions overlay */}
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all duration-300 flex items-end justify-center pb-4 opacity-0 group-hover:opacity-100">
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => {
                e.preventDefault();
                addToCart({ product, quantity: 1, size: product.sizes[1] || product.sizes[0], color: product.colors[0] });
              }}
              className="bg-card text-foreground px-6 py-2.5 rounded-full font-accent text-xs font-semibold flex items-center gap-2 hover:bg-accent hover:text-accent-foreground transition-colors shadow-lg"
            >
              <ShoppingBag className="w-4 h-4" />
              Quick Add
            </motion.button>
          </div>
        </div>
      </Link>

      {/* Wishlist */}
      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={() => toggleWishlist(product.id)}
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors"
        style={{ display: product.originalPrice && discount > 0 ? 'none' : undefined }}
      >
        <motion.div
          animate={isWished ? { scale: [1, 1.4, 1] } : { scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Heart className={`w-4 h-4 transition-colors duration-200 ${isWished ? 'fill-accent text-accent' : 'text-foreground'}`} />
        </motion.div>
      </motion.button>

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
            <motion.span
              key={c}
              whileHover={{ scale: 1.3 }}
              className="w-4 h-4 rounded-full border border-border transition-shadow hover:shadow-md"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
