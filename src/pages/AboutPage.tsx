import { motion } from 'framer-motion';
import { Heart, Leaf, Sparkles, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6 } }),
};

const values = [
  { icon: Heart, title: 'Quality First', desc: 'Premium 100% combed cotton. Every stitch, every thread — obsessively checked.' },
  { icon: Leaf, title: 'Sustainability', desc: 'Eco-friendly dyes, minimal waste production, and recyclable packaging.' },
  { icon: Sparkles, title: 'Self-Expression', desc: 'Your style, your rules. From classic plains to wild custom prints.' },
  { icon: Users, title: 'Community', desc: 'Built by a young Indian team who lives and breathes street culture.' },
];

const team = [
  { name: 'Arjun Mehta', role: 'Founder & Creative Director', avatar: '🎨' },
  { name: 'Priya Sharma', role: 'Head of Design', avatar: '✂️' },
  { name: 'Rohan Patel', role: 'Operations Lead', avatar: '📦' },
  { name: 'Ananya Iyer', role: 'Marketing & Growth', avatar: '📣' },
];

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="container mx-auto px-4 relative">
          <motion.div initial="hidden" animate="visible" className="max-w-3xl mx-auto text-center">
            <motion.span variants={fadeUp} custom={0} className="inline-block font-accent text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
              Our Story
            </motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Fashion That Speaks <span className="text-gradient">Your Language</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="font-body text-lg text-muted-foreground leading-relaxed">
              Born in the streets of Mumbai, Stylique is more than a t-shirt brand — it's a movement. 
              We believe everyone deserves premium quality fashion that doesn't break the bank or the planet.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Brand Story */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <img src="/assets/about-craft.jpg" alt="Premium fabric craftsmanship" className="rounded-2xl shadow-xl w-full aspect-square object-cover" />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <span className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-accent">The Beginning</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3 mb-6">
                From a College Dorm to Your Wardrobe
              </h2>
              <div className="space-y-4 font-body text-muted-foreground leading-relaxed">
                <p>
                  It started in 2023 with a simple frustration: why do great-looking tees always cost a fortune? 
                  Our founder Arjun couldn't find affordable, high-quality graphic tees that matched his vibe.
                </p>
                <p>
                  So he started designing his own. What began as custom prints for friends quickly became 
                  a full-blown brand — fueled by Instagram DMs, late-night screen printing, and a relentless 
                  obsession with getting the perfect cotton weight.
                </p>
                <p>
                  Today, Stylique serves thousands of customers across India with plain essentials, 
                  bold graphics, and fully customizable designs. Same obsession. Same quality. Zero compromises.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-accent">What We Stand For</span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3">Our Values</h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="bg-card rounded-2xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-5">
                  <v.icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">{v.title}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <span className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-accent">The Crew</span>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mt-3 mb-8">
                Meet the Team
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {team.map((t, i) => (
                  <motion.div
                    key={t.name}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={i}
                    variants={fadeUp}
                    className="bg-muted rounded-xl p-5 text-center"
                  >
                    <div className="text-4xl mb-3">{t.avatar}</div>
                    <h4 className="font-heading text-sm font-bold text-foreground">{t.name}</h4>
                    <p className="font-body text-xs text-muted-foreground mt-1">{t.role}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <img src="/assets/about-team.jpg" alt="Stylique team at work" className="rounded-2xl shadow-xl w-full aspect-square object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '50K+', label: 'Happy Customers' },
              { num: '200+', label: 'Unique Designs' },
              { num: '15+', label: 'Cities Delivered' },
              { num: '4.8★', label: 'Average Rating' },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="font-heading text-3xl md:text-4xl font-bold">{s.num}</div>
                <div className="font-body text-sm text-primary-foreground/60 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
