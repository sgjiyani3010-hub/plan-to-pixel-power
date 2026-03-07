import { motion } from 'framer-motion';
import { useState } from 'react';
import { toast } from 'sonner';

const Newsletter = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast.success('Welcome! Check your inbox for a 15% discount code 🎉');
      setEmail('');
    }
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto text-center"
        >
          <span className="inline-block bg-accent/10 text-accent px-4 py-1.5 rounded-full font-accent text-xs font-bold uppercase tracking-widest mb-4">
            Get 15% Off
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-3">
            Join the Stylique Club
          </h2>
          <p className="text-muted-foreground font-body mb-8">
            Subscribe for exclusive drops, flash sales & early access to new collections.
          </p>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 bg-card border border-border rounded-full px-5 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 rounded-full font-accent font-semibold text-sm transition-all shrink-0"
            >
              Subscribe
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
};

export default Newsletter;
