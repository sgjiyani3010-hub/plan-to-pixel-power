import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Search, Menu, X, User, LogOut, Shield } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import { useStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const cartCount = useStore((s) => s.cartCount());
  const { user, signOut } = useAuth();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  const navBg = scrolled || !isHome ? 'bg-card/95 backdrop-blur-md shadow-sm' : 'bg-transparent';
  const textColor = scrolled || !isHome ? 'text-foreground' : 'text-primary-foreground';

  const links = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/designer', label: 'Customize' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  const iconVariants = {
    hover: { scale: 1.15, rotate: 5 },
    tap: { scale: 0.9 },
  };

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="container mx-auto flex items-center justify-between py-4 px-4">
          <Link to="/" className={`font-heading text-2xl font-bold tracking-tight ${textColor}`}>
            STYLIQUE
          </Link>

          <div className={`hidden md:flex items-center gap-8 font-accent text-sm font-medium ${textColor}`}>
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={`relative hover:opacity-80 transition-opacity after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all after:duration-300 hover:after:w-full ${
                  location.pathname === l.to ? 'after:w-full' : ''
                }`}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className={`flex items-center gap-4 ${textColor}`}>
            <motion.div whileHover="hover" whileTap="tap" variants={iconVariants}>
              <Search className="w-5 h-5 cursor-pointer" />
            </motion.div>
            <Link to="/wishlist">
              <motion.div whileHover="hover" whileTap="tap" variants={iconVariants} className="hidden sm:block">
                <Heart className="w-5 h-5 cursor-pointer" />
              </motion.div>
            </Link>
            {user ? (
              <Link to="/profile" title="My Account">
                <motion.div whileHover="hover" whileTap="tap" variants={iconVariants} className="hidden sm:block">
                  <User className="w-5 h-5 cursor-pointer" />
                </motion.div>
              </Link>
            ) : (
              <Link to="/auth">
                <motion.div whileHover="hover" whileTap="tap" variants={iconVariants} className="hidden sm:block">
                  <User className="w-5 h-5 cursor-pointer" />
                </motion.div>
              </Link>
            )}
            <Link to="/cart" className="relative">
              <motion.div whileHover="hover" whileTap="tap" variants={iconVariants}>
                <ShoppingBag className="w-5 h-5 cursor-pointer" />
              </motion.div>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-accent-foreground rounded-full text-[10px] font-accent font-bold flex items-center justify-center"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <button className="md:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[55] bg-primary/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-[80%] max-w-sm z-[60] bg-card shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <span className="font-heading text-2xl font-bold text-foreground">STYLIQUE</span>
                <motion.button whileTap={{ scale: 0.8, rotate: 90 }} onClick={() => setMobileOpen(false)}>
                  <X className="w-6 h-6 text-foreground" />
                </motion.button>
              </div>
              <div className="flex flex-col p-8">
                {links.map((l, i) => (
                  <motion.div
                    key={l.to}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className={`block py-3 font-accent text-lg transition-colors border-b border-border/50 ${
                        location.pathname === l.to ? 'text-accent font-semibold' : 'text-foreground hover:text-accent'
                      }`}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
