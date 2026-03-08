import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ_SECTIONS = [
  {
    title: 'Orders & Payment',
    faqs: [
      {
        question: 'How do I place an order?',
        answer: 'Simply browse our collection, select your size and color, add items to cart, and proceed to checkout. You can pay using UPI, cards, net banking, or choose Cash on Delivery.'
      },
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit/debit cards (Visa, Mastercard, RuPay), UPI (GPay, PhonePe, Paytm), Net Banking, and Cash on Delivery (COD). All payments are processed securely via Razorpay.'
      },
      {
        question: 'Can I cancel my order?',
        answer: 'Yes, you can cancel your order before it is shipped. Once shipped, cancellation is not possible, but you can initiate a return after delivery. Contact our support team for cancellation requests.'
      },
      {
        question: 'How do I apply a coupon code?',
        answer: 'Enter your coupon code in the "Promo Code" field on the checkout page and click Apply. The discount will be reflected in your order total. Only one coupon can be used per order.'
      }
    ]
  },
  {
    title: 'Shipping & Delivery',
    faqs: [
      {
        question: 'How long does delivery take?',
        answer: 'Metro cities: 3-5 business days. Other cities: 5-7 business days. Custom printed t-shirts may take 2-3 additional days for production before shipping.'
      },
      {
        question: 'Do you offer free shipping?',
        answer: 'Yes! We offer FREE shipping on all prepaid orders above ₹499. For orders below ₹499, a flat ₹49 shipping fee applies. COD orders have a ₹79 handling fee.'
      },
      {
        question: 'How can I track my order?',
        answer: 'Once shipped, you\'ll receive tracking details via SMS and email. Use our Track Order page or the courier\'s website with your AWB number to track your package.'
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Currently, we only ship within India. We\'re working on expanding to international destinations soon. Stay tuned for updates!'
      }
    ]
  },
  {
    title: 'Returns & Exchanges',
    faqs: [
      {
        question: 'What is your return policy?',
        answer: 'We offer a 7-day easy return policy. Items must be unworn, unwashed, and in original packaging with tags attached. Custom printed t-shirts are not eligible for return unless defective.'
      },
      {
        question: 'How do I initiate a return?',
        answer: 'Contact us via email or WhatsApp with your order ID and reason for return. Once approved, you can either schedule a pickup or self-ship the item back to us.'
      },
      {
        question: 'How long does a refund take?',
        answer: 'Refunds are processed within 5-7 business days after we receive and inspect the returned item. The amount will be credited to your original payment method.'
      },
      {
        question: 'Can I exchange for a different size?',
        answer: 'Yes! Size exchanges are free. Contact us within 7 days of delivery, and we\'ll arrange pickup and send the correct size once we receive the original item.'
      }
    ]
  },
  {
    title: 'Sizing & Fit',
    faqs: [
      {
        question: 'How do I find my size?',
        answer: 'Check our size chart on each product page. Measure your chest and length, then compare with our chart. When in doubt, size up for a relaxed fit or contact us for personalized recommendations.'
      },
      {
        question: 'What is the fabric quality?',
        answer: 'Our t-shirts are made from premium 180 GSM cotton, ensuring softness, durability, and breathability. They\'re pre-shrunk and color-fast for long-lasting wear.'
      },
      {
        question: 'Are your t-shirts true to size?',
        answer: 'Yes, our t-shirts are designed for a regular/relaxed fit. The measurements on our size chart are accurate. For a slim fit, consider sizing down.'
      }
    ]
  },
  {
    title: 'Custom Prints',
    faqs: [
      {
        question: 'How does custom printing work?',
        answer: 'Use our T-Shirt Designer to upload your image, add text, choose colors, and position your design. We use high-quality DTF printing for vibrant, long-lasting prints.'
      },
      {
        question: 'What file formats do you accept?',
        answer: 'We accept PNG and JPG images up to 5MB. For best results, use high-resolution images (at least 300 DPI) with transparent backgrounds for logos and graphics.'
      },
      {
        question: 'Can I return a custom printed t-shirt?',
        answer: 'Custom t-shirts are made-to-order and cannot be returned unless there\'s a printing defect or damage. Please double-check your design before ordering.'
      },
      {
        question: 'How long do custom orders take?',
        answer: 'Custom t-shirts require 2-3 days for printing before shipping. Add this to the standard delivery time for your location.'
      }
    ]
  }
];

const FAQPage = () => {
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
            <HelpCircle className="w-12 h-12 text-accent mx-auto mb-4" />
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-2">Frequently Asked Questions</h1>
            <p className="font-body text-muted-foreground">Find answers to common questions about shopping with us</p>
          </motion.div>

          <div className="space-y-8">
            {FAQ_SECTIONS.map((section, sectionIdx) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * sectionIdx }}
                className="bg-card rounded-2xl border border-border p-6"
              >
                <h2 className="font-accent text-lg font-semibold text-foreground mb-4">{section.title}</h2>
                <Accordion type="single" collapsible className="space-y-2">
                  {section.faqs.map((faq, faqIdx) => (
                    <AccordionItem 
                      key={faqIdx} 
                      value={`${sectionIdx}-${faqIdx}`}
                      className="border border-border rounded-lg px-4"
                    >
                      <AccordionTrigger className="font-accent text-sm text-foreground hover:text-accent hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="font-body text-sm text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center bg-accent/10 rounded-2xl border border-accent/20 p-8"
          >
            <h2 className="font-accent text-lg font-semibold text-foreground mb-2">Still have questions?</h2>
            <p className="font-body text-sm text-muted-foreground mb-4">
              Our support team is here to help you
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-lg font-accent text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              Contact Us
            </a>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQPage;
