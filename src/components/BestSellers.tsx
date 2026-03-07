import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { products } from '@/lib/products';
import { Link } from 'react-router-dom';

const BestSellers = () => {
  const bestSellers = products.filter((p) => p.badge === 'bestseller' || p.badge === 'trending').slice(0, 4);
  // Fill with more if needed
  const displayProducts = bestSellers.length < 4
    ? [...bestSellers, ...products.filter(p => !bestSellers.includes(p))].slice(0, 4)
    : bestSellers;

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-3">Best Sellers</h2>
            <p className="text-muted-foreground font-body text-lg">Our most loved styles</p>
          </div>
          <Link
            to="/shop"
            className="hidden md:inline-block font-accent text-sm font-semibold text-accent hover:underline"
          >
            View All →
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            to="/shop"
            className="font-accent text-sm font-semibold text-accent hover:underline"
          >
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
