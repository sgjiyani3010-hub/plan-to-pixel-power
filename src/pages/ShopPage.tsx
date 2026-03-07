import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import { supabase } from '@/integrations/supabase/client';
import type { Product } from '@/lib/store';

const categories = ['all', 'plain', 'graphic', 'polo', 'custom'] as const;
const sortOptions = ['Newest', 'Price: Low to High', 'Price: High to Low', 'Popularity'] as const;

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<string>('Newest');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);

      if (data) {
        setProducts(data.map((p) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          originalPrice: p.original_price ? Number(p.original_price) : undefined,
          image: p.image,
          category: p.category as Product['category'],
          badge: p.badge as Product['badge'],
          colors: p.colors,
          sizes: p.sizes,
          description: p.description,
        })));
      }
      setLoading(false);
    };
    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    let result = selectedCategory === 'all' ? products : products.filter((p) => p.category === selectedCategory);
    switch (sortBy) {
      case 'Price: Low to High':
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case 'Price: High to Low':
        result = [...result].sort((a, b) => b.price - a.price);
        break;
    }
    return result;
  }, [selectedCategory, sortBy, products]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-2">Shop</h1>
            <p className="text-muted-foreground font-body">{filtered.length} products</p>
          </motion.div>

          <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-5 py-2 rounded-full font-accent text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat === 'all' ? 'All' : cat}
                </button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-2 font-accent text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              {sortOptions.map((opt) => (
                <option key={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground font-body text-lg">No products found in this category.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShopPage;
