import { motion } from 'framer-motion';
import { Truck, Clock, MapPin, CreditCard, Package, Shield } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ShippingPolicyPage = () => {
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
            <Truck className="w-12 h-12 text-accent mx-auto mb-4" />
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Shipping Policy</h1>
            <p className="font-body text-muted-foreground">Fast and reliable delivery across India</p>
          </motion.div>

          <div className="space-y-8">
            {/* Delivery Timeline */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Delivery Timelines
              </h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <h3 className="font-accent text-sm font-semibold text-foreground mb-2">Metro Cities</h3>
                    <p className="font-body text-2xl font-bold text-accent">3-5 Business Days</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">Mumbai, Delhi, Bangalore, Chennai, Kolkata, Hyderabad</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <h3 className="font-accent text-sm font-semibold text-foreground mb-2">Other Cities</h3>
                    <p className="font-body text-2xl font-bold text-accent">5-7 Business Days</p>
                    <p className="font-body text-xs text-muted-foreground mt-1">Tier 2 & Tier 3 cities across India</p>
                  </div>
                </div>
                <p className="font-body text-sm text-muted-foreground">
                  <strong className="text-foreground">Note:</strong> Delivery times are estimated and may vary during 
                  peak seasons, festivals, or due to unforeseen circumstances.
                </p>
              </div>
            </motion.div>

            {/* Shipping Partners */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-accent" />
                Our Shipping Partners
              </h2>
              <p className="font-body text-sm text-muted-foreground mb-4">
                We partner with leading logistics providers to ensure safe and timely delivery of your orders.
              </p>
              <div className="flex flex-wrap gap-4">
                {['Shiprocket', 'Delhivery', 'BlueDart', 'DTDC', 'Ecom Express'].map((partner) => (
                  <span key={partner} className="px-4 py-2 bg-muted rounded-lg font-accent text-sm text-foreground">
                    {partner}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Shipping Charges */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-accent" />
                Shipping Charges
              </h2>
              <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <h3 className="font-accent text-sm font-semibold text-green-600 mb-1">FREE Shipping</h3>
                  <p className="font-body text-sm text-foreground">On all prepaid orders above ₹499</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <h3 className="font-accent text-sm font-semibold text-foreground mb-2">Prepaid Orders (under ₹499)</h3>
                    <p className="font-body text-lg font-bold text-foreground">₹49</p>
                    <p className="font-body text-xs text-muted-foreground">Flat shipping fee</p>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <h3 className="font-accent text-sm font-semibold text-foreground mb-2">Cash on Delivery</h3>
                    <p className="font-body text-lg font-bold text-foreground">₹79</p>
                    <p className="font-body text-xs text-muted-foreground">COD handling fee applies</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* COD */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-accent" />
                Cash on Delivery (COD)
              </h2>
              <div className="font-body text-sm text-foreground space-y-3">
                <p>
                  COD is available for most pin codes across India. An additional handling fee of ₹79 applies 
                  to all COD orders.
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">COD Limits:</strong> Maximum order value for COD is ₹5,000. 
                  Orders above this amount must be prepaid.
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Verification:</strong> For first-time COD orders, we may call 
                  to verify the delivery address before dispatch.
                </p>
              </div>
            </motion.div>

            {/* Tracking */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.5 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-accent" />
                Order Tracking
              </h2>
              <div className="font-body text-sm text-foreground space-y-3">
                <p>
                  Once your order is shipped, you'll receive an SMS and email with your tracking number and 
                  courier details. You can track your order anytime using:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Our website's Track Order page</li>
                  <li>Direct courier website using AWB number</li>
                  <li>WhatsApp updates (if opted in)</li>
                </ul>
              </div>
            </motion.div>

            {/* Additional Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.6 }}
              className="bg-accent/10 rounded-2xl border border-accent/20 p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4">Important Information</h2>
              <ul className="font-body text-sm text-foreground space-y-2">
                <li>• We currently ship only within India</li>
                <li>• Custom/personalized orders may take 2-3 additional days for processing</li>
                <li>• Orders placed after 5 PM will be processed the next business day</li>
                <li>• Sundays and public holidays are not counted as business days</li>
                <li>• In case of delivery failure, 3 attempts will be made before return to origin</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ShippingPolicyPage;
