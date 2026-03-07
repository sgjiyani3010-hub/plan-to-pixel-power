import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import categoryPlain from '@/assets/category-plain.jpg';
import categoryGraphic from '@/assets/category-graphic.jpg';
import categoryCustom from '@/assets/category-custom.jpg';
import categoryPolo from '@/assets/category-polo.jpg';

const categories = [
  { name: 'Plain Tees', image: categoryPlain, slug: 'plain' },
  { name: 'Graphic Prints', image: categoryGraphic, slug: 'graphic' },
  { name: 'Polo Collection', image: categoryPolo, slug: 'polo' },
  { name: 'Custom Design', image: categoryCustom, slug: 'custom' },
];

const CategorySection = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-3">
            Shop by Category
          </h2>
          <p className="text-muted-foreground font-body text-lg">Find your perfect fit</p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                to={`/shop?category=${cat.slug}`}
                className="group relative block aspect-square rounded-2xl overflow-hidden"
              >
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-accent text-sm md:text-base font-semibold text-primary-foreground">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
