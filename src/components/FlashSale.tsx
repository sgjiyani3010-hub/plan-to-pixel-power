import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const FlashSale = () => {
  const endTime = new Date();
  endTime.setHours(endTime.getHours() + 12);

  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();
      if (diff <= 0) return;
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, '0');

  const timerBlocks = [
    { value: pad(timeLeft.hours), label: 'Hours' },
    { value: pad(timeLeft.minutes), label: 'Mins' },
    { value: pad(timeLeft.seconds), label: 'Secs' },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-primary via-secondary to-primary overflow-hidden relative">
      {/* Floating particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-primary-foreground/10 rounded-full"
          style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
        />
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.span
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-block bg-highlight text-highlight-foreground px-4 py-1 rounded-full font-accent text-xs font-bold uppercase tracking-widest mb-4"
          >
            ⚡ Flash Sale
          </motion.span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-primary-foreground mb-2">
            Up to 50% Off Everything
          </h2>
          <p className="text-primary-foreground/70 font-body mb-8">Hurry! Sale ends soon</p>

          <div className="flex items-center justify-center gap-3 mb-8">
            {timerBlocks.map((t, i) => (
              <motion.div
                key={t.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl px-4 py-3 min-w-[70px]"
              >
                <motion.div
                  key={t.value}
                  initial={{ rotateX: -90, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="font-accent text-3xl font-bold text-primary-foreground"
                  style={{ perspective: '200px' }}
                >
                  {t.value}
                </motion.div>
                <div className="font-accent text-[10px] uppercase tracking-wider text-primary-foreground/60">{t.label}</div>
              </motion.div>
            ))}
          </div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/shop"
              className="inline-block bg-accent hover:bg-accent/90 text-accent-foreground px-10 py-3.5 rounded-full font-accent font-semibold text-sm transition-all hover:shadow-lg hover:shadow-accent/30"
            >
              Shop the Sale
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default FlashSale;
