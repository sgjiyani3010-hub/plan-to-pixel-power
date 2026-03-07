import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Heart, Search, Menu, X, User, LogOut } from 'lucide-react';
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
    { to: '/shop?category=custom', label: 'Customize' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
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
                className="relative hover:opacity-80 transition-opacity after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all hover:after:w-full"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className={`flex items-center gap-4 ${textColor}`}>
            <Search className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" />
            <Heart className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity hidden sm:block" />
            {user ? (
              <button onClick={() => signOut()} title="Sign out">
                <LogOut className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity hidden sm:block" />
              </button>
            ) : (
              <Link to="/auth">
                <User className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity hidden sm:block" />
              </Link>
            )}
            <Link to="/cart" className="relative">
              <ShoppingBag className="w-5 h-5 cursor-pointer hover:opacity-70 transition-opacity" />
              {cartCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-accent-foreground rounded-full text-[10px] font-accent font-bold flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              )}
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
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-[60] bg-card"
          >
            <div className="flex items-center justify-between p-4">
              <span className="font-heading text-2xl font-bold text-foreground">STYLIQUE</span>
              <button onClick={() => setMobileOpen(false)}>
                <X className="w-6 h-6 text-foreground" />
              </button>
            </div>
            <div className="flex flex-col gap-6 p-8 font-accent text-lg">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-foreground hover:text-accent transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
