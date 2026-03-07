import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import heroBanner from '@/assets/hero-banner.jpg';

const HeroSection = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroBanner} alt="Stylique Fashion Hero" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto h-full flex items-center px-4">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="inline-block bg-accent px-4 py-1.5 rounded-full mb-6"
          >
            <span className="font-accent text-sm font-semibold text-accent-foreground">
              🔥 Flat 40% Off — Limited Time
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="font-heading text-5xl md:text-7xl font-bold text-primary-foreground leading-tight mb-6"
          >
            Style That
            <br />
            <span className="text-gradient">Speaks You</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-primary-foreground/80 text-lg md:text-xl mb-8 font-body max-w-md"
          >
            Discover trendy, vibrant t-shirts for every mood. Plain, printed, or custom — make it yours.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex gap-4"
          >
            <Link
              to="/shop"
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3.5 rounded-full font-accent font-semibold text-sm transition-all hover:shadow-lg hover:shadow-accent/30"
            >
              Shop Now
            </Link>
            <Link
              to="/shop?category=custom"
              className="border-2 border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 px-8 py-3.5 rounded-full font-accent font-semibold text-sm transition-all"
            >
              Customize
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="w-6 h-10 border-2 border-primary-foreground/40 rounded-full flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-1.5 bg-primary-foreground/60 rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
