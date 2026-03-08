import { motion } from 'framer-motion';
import { Shield, Eye, Cookie, Lock, Mail, FileText } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicyPage = () => {
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
            <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
            <p className="font-body text-muted-foreground">Last updated: January 2025</p>
          </motion.div>

          <div className="space-y-8">
            {/* Introduction */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.1 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <p className="font-body text-sm text-foreground leading-relaxed">
                At Stylique Fashion ("we," "our," or "us"), we are committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your information 
                when you visit our website or make a purchase. Please read this policy carefully. By using 
                our services, you consent to the practices described herein.
              </p>
            </motion.div>

            {/* Information We Collect */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.2 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-accent" />
                Information We Collect
              </h2>
              <div className="space-y-4 font-body text-sm text-foreground">
                <div>
                  <h3 className="font-accent font-semibold mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Name, email address, and phone number</li>
                    <li>Shipping and billing addresses</li>
                    <li>Payment information (processed securely via Razorpay)</li>
                    <li>Account login credentials</li>
                    <li>Order history and preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-accent font-semibold mb-2">Automatically Collected Information</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Device type, browser, and operating system</li>
                    <li>IP address and location data</li>
                    <li>Pages visited and time spent on our site</li>
                    <li>Referring website or source</li>
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* How We Use Information */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.3 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                How We Use Your Information
              </h2>
              <ul className="font-body text-sm text-muted-foreground space-y-2">
                <li>• <strong className="text-foreground">Process Orders:</strong> Fulfill your purchases, process payments, and arrange shipping</li>
                <li>• <strong className="text-foreground">Communication:</strong> Send order updates, shipping notifications, and customer support responses</li>
                <li>• <strong className="text-foreground">Marketing:</strong> Send promotional emails, offers, and newsletters (with your consent)</li>
                <li>• <strong className="text-foreground">Improve Services:</strong> Analyze usage patterns to enhance our website and products</li>
                <li>• <strong className="text-foreground">Security:</strong> Detect and prevent fraud, unauthorized access, and other illegal activities</li>
                <li>• <strong className="text-foreground">Legal Compliance:</strong> Comply with applicable laws, regulations, and legal requests</li>
              </ul>
            </motion.div>

            {/* Cookies */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Cookie className="w-5 h-5 text-accent" />
                Cookies & Tracking
              </h2>
              <div className="font-body text-sm text-muted-foreground space-y-3">
                <p>
                  We use cookies and similar tracking technologies to enhance your browsing experience. 
                  Cookies are small files stored on your device that help us:
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Remember your preferences and cart contents</li>
                  <li>Keep you logged into your account</li>
                  <li>Understand how you use our website</li>
                  <li>Provide personalized content and ads</li>
                </ul>
                <p>
                  You can manage cookie preferences through your browser settings. Disabling cookies may 
                  affect some features of our website.
                </p>
              </div>
            </motion.div>

            {/* Data Sharing */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.5 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-accent" />
                Data Sharing & Security
              </h2>
              <div className="font-body text-sm text-foreground space-y-4">
                <div>
                  <h3 className="font-accent font-semibold mb-2">We Share Data With:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Payment processors (Razorpay) for secure transactions</li>
                    <li>Shipping partners (Shiprocket, Delhivery, etc.) for order delivery</li>
                    <li>Analytics providers to improve our services</li>
                    <li>Legal authorities when required by law</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-accent font-semibold mb-2">We Do NOT:</h3>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1">
                    <li>Sell your personal information to third parties</li>
                    <li>Share data for purposes unrelated to your orders</li>
                    <li>Store payment card details on our servers</li>
                  </ul>
                </div>
                <p className="text-muted-foreground">
                  We implement industry-standard security measures including SSL encryption, secure 
                  servers, and regular security audits to protect your data.
                </p>
              </div>
            </motion.div>

            {/* Your Rights */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.6 }}
              className="bg-card rounded-2xl border border-border p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4">Your Rights</h2>
              <div className="font-body text-sm text-muted-foreground space-y-3">
                <p>You have the right to:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong className="text-foreground">Access:</strong> Request a copy of your personal data</li>
                  <li><strong className="text-foreground">Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong className="text-foreground">Deletion:</strong> Request deletion of your account and data</li>
                  <li><strong className="text-foreground">Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong className="text-foreground">Data Portability:</strong> Receive your data in a portable format</li>
                </ul>
                <p>
                  To exercise these rights, contact us at privacy@styliquefashion.com. We will respond 
                  within 30 days.
                </p>
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.7 }}
              className="bg-accent/10 rounded-2xl border border-accent/20 p-6"
            >
              <h2 className="font-accent text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-accent" />
                Contact Us
              </h2>
              <div className="font-body text-sm text-foreground space-y-2">
                <p>For privacy-related inquiries or to exercise your rights, contact us:</p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Email:</strong> privacy@styliquefashion.com
                </p>
                <p className="text-muted-foreground">
                  <strong className="text-foreground">Address:</strong> Stylique Fashion, Mumbai, Maharashtra, India
                </p>
                <p className="text-xs text-muted-foreground mt-4">
                  This policy may be updated from time to time. We encourage you to review it periodically.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
