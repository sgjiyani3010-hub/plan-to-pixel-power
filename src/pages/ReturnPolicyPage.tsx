import { motion } from 'framer-motion';
import { RefreshCw, CheckCircle, XCircle, Clock, Mail, Phone } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ReturnPolicyPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <RefreshCw className="w-12 h-12 text-accent mx-auto mb-4" />
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Return & Exchange Policy</h1>
            <p className="font-body text-muted-foreground">Your satisfaction is our priority</p>
          </motion.div>

          <div className="space-y-8">
            {/* Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4">7-Day Easy Returns</h2>
              <p className="font-body text-muted-foreground leading-relaxed">
                We want you to love your purchase! If you're not completely satisfied, you can return or exchange 
                your order within <strong className="text-foreground">7 days of delivery</strong>. Simply ensure the 
                items are unworn, unwashed, and in their original packaging with tags attached.
              </p>
            </motion.div>

            {/* Eligibility */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4">What Can Be Returned?</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="flex items-center gap-2 font-accent text-sm font-semibold text-green-600 mb-3">
                    <CheckCircle className="w-5 h-5" />
                    Eligible for Return
                  </h3>
                  <ul className="space-y-2 font-body text-sm text-foreground">
                    <li>• Products in original condition with tags</li>
                    <li>• Unworn and unwashed items</li>
                    <li>• Items in original packaging</li>
                    <li>• Wrong size or color received</li>
                    <li>• Damaged or defective products</li>
                    <li>• Product different from description</li>
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 font-accent text-sm font-semibold text-red-600 mb-3">
                    <XCircle className="w-5 h-5" />
                    Not Eligible
                  </h3>
                  <ul className="space-y-2 font-body text-sm text-muted-foreground">
                    <li>• Custom printed/personalized t-shirts</li>
                    <li>• Items worn, washed or altered</li>
                    <li>• Products without original tags</li>
                    <li>• Items beyond 7-day return window</li>
                    <li>• Sale/discounted items (final sale)</li>
                    <li>• Items damaged by customer</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* Process */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-6">How to Return</h2>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { step: 1, title: 'Initiate Request', desc: 'Contact us via email or WhatsApp with your order ID' },
                  { step: 2, title: 'Get Approval', desc: 'We'll review and approve your request within 24 hours' },
                  { step: 3, title: 'Ship It Back', desc: 'Pack the item securely and ship via our pickup or self-ship' },
                  { step: 4, title: 'Refund/Exchange', desc: 'Get refund in 5-7 days or exchange shipped immediately' },
                ].map((item) => (
                  <div key={item.step} className="text-center">
                    <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center font-accent font-bold mx-auto mb-3">
                      {item.step}
                    </div>
                    <h3 className="font-accent text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="font-body text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Refund Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4">Refund Information</h2>
              <div className="space-y-4 font-body text-sm text-foreground">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <strong>Processing Time:</strong> Refunds are processed within 5-7 business days after we 
                    receive the returned item.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RefreshCw className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <strong>Refund Method:</strong> Refunds will be credited to the original payment method. 
                    COD orders will receive bank transfer refunds.
                  </div>
                </div>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Shipping charges are non-refundable unless 
                  the return is due to our error (wrong/defective product).
                </p>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.5 }}
              className="bg-accent/10 rounded-2xl border border-accent/20 p-6 text-center"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4">Need Help?</h2>
              <p className="font-body text-sm text-muted-foreground mb-4">
                Contact our support team for any return or exchange queries
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a href="mailto:returns@styliquefashion.com" className="flex items-center gap-2 text-accent font-accent text-sm hover:underline">
                  <Mail className="w-4 h-4" />
                  returns@styliquefashion.com
                </a>
                <a href="tel:+919876543210" className="flex items-center gap-2 text-accent font-accent text-sm hover:underline">
                  <Phone className="w-4 h-4" />
                  +91 98765 43210
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ReturnPolicyPage;
