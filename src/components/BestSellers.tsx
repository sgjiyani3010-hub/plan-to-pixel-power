import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard from './ProductCard';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/lib/store';
import { Link } from 'react-router-dom';

const BestSellers = () => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .in('badge', ['bestseller', 'trending'])
        .limit(4);

      if (data) {
        setProducts(data.map((p) => ({
          id: p.id, name: p.name, price: Number(p.price),
          originalPrice: p.original_price ? Number(p.original_price) : undefined,
          image: p.image, category: p.category as Product['category'],
          badge: p.badge as Product['badge'], colors: p.colors, sizes: p.sizes, description: p.description,
        })));
      }
    };
    fetch();
  }, []);

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
          <motion.div whileHover={{ x: 5 }}>
            <Link to="/shop" className="hidden md:inline-block font-accent text-sm font-semibold text-accent hover:underline">
              View All →
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link to="/shop" className="font-accent text-sm font-semibold text-accent hover:underline">
            View All Products →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
