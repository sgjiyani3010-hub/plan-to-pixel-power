import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Facebook, Youtube, Mail, Phone, MapPin } from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground">
      <motion.div
        className="container mx-auto px-4 py-16"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <motion.div variants={itemVariants} className="md:col-span-1">
            <h3 className="font-heading text-2xl font-bold mb-4">STYLIQUE</h3>
            <p className="font-body text-sm text-primary-foreground/60 leading-relaxed mb-6">
              Trendy, vibrant & youthful fashion. Plain, graphic & custom t-shirts for every mood.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.2, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-accent text-sm font-bold uppercase tracking-wider mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              {['Shop All', 'New Arrivals', 'Best Sellers', 'Custom Design', 'Size Guide'].map((l) => (
                <Link key={l} to="/shop" className="font-body text-sm text-primary-foreground/60 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block">
                  {l}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Help */}
          <motion.div variants={itemVariants}>
            <h4 className="font-accent text-sm font-bold uppercase tracking-wider mb-4">Help</h4>
            <div className="flex flex-col gap-2.5">
              {['Track Order', 'Returns & Exchange', 'Shipping Policy', 'FAQ', 'Privacy Policy'].map((l) => (
                <Link key={l} to="/" className="font-body text-sm text-primary-foreground/60 hover:text-primary-foreground hover:translate-x-1 transition-all inline-block">
                  {l}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div variants={itemVariants}>
            <h4 className="font-accent text-sm font-bold uppercase tracking-wider mb-4">Contact Us</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2 text-primary-foreground/60">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="font-body text-sm">support@styliquefashion.com</span>
              </div>
              <div className="flex items-start gap-2 text-primary-foreground/60">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="font-body text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-start gap-2 text-primary-foreground/60">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="font-body text-sm">Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4"
        >
          <p className="font-body text-xs text-primary-foreground/40">
            © 2025 Stylique Fashion. All rights reserved. | GSTIN: 27XXXXX1234X1ZX
          </p>
          <div className="flex gap-4 font-body text-xs text-primary-foreground/40">
            {['Visa', 'Mastercard', 'UPI', 'RuPay', 'COD'].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
