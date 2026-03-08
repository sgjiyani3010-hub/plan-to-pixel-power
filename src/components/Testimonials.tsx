import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Arjun Mehta',
    location: 'Mumbai',
    rating: 5,
    text: 'The quality of the fabric is amazing! Bought 3 graphic tees and they\'re super comfortable. Will definitely order again.',
  },
  {
    name: 'Priya Sharma',
    location: 'Delhi',
    rating: 5,
    text: 'Ordered a custom t-shirt with my artwork and it came out perfect. The print quality is top-notch!',
  },
  {
    name: 'Rahul Verma',
    location: 'Bangalore',
    rating: 4,
    text: 'Great collection and fast delivery. The polo tees are premium quality. Love the vibrant colors!',
  },
];

const Testimonials = () => {
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
            What Our Customers Say
          </h2>
          <p className="text-muted-foreground font-body text-lg">Real reviews from real people</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ delay: i * 0.15, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -5, boxShadow: '0 20px 40px -15px hsl(var(--primary) / 0.12)' }}
              className="bg-card rounded-2xl p-6 border border-border relative transition-all duration-300"
            >
              <Quote className="w-8 h-8 text-accent/20 absolute top-4 right-4" />
              <div className="flex gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + j * 0.05 }}
                  >
                    <Star className={`w-4 h-4 ${j < t.rating ? 'fill-highlight text-highlight' : 'text-border'}`} />
                  </motion.div>
                ))}
              </div>
              <p className="font-body text-foreground/80 mb-6 leading-relaxed">"{t.text}"</p>
              <div>
                <div className="font-accent text-sm font-semibold text-foreground">{t.name}</div>
                <div className="font-body text-xs text-muted-foreground">{t.location}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
