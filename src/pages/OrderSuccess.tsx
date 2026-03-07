import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const OrderSuccess = () => {
  const { orderId } = useParams();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
          </motion.div>

          <h1 className="font-heading text-3xl font-bold text-foreground mb-3">Order Confirmed! 🎉</h1>
          <p className="text-muted-foreground font-accent mb-2">Thank you for your purchase</p>

          {orderId && (
            <p className="font-accent text-xs text-muted-foreground mb-8">
              Order ID: <span className="font-mono">{orderId.slice(0, 12)}...</span>
            </p>
          )}

          <div className="bg-card rounded-xl border border-border p-6 mb-8">
            <Package className="w-8 h-8 mx-auto mb-3 text-secondary" />
            <p className="font-accent text-sm text-foreground font-medium">Your order is being processed</p>
            <p className="font-accent text-xs text-muted-foreground mt-1">You'll receive updates via email</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 bg-accent text-accent-foreground px-8 py-3 rounded-full font-accent font-semibold text-sm"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-muted text-foreground px-8 py-3 rounded-full font-accent font-semibold text-sm"
            >
              Go Home
            </Link>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderSuccess;
