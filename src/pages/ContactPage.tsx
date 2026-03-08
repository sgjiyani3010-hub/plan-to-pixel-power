import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  subject: z.string().trim().min(1, 'Subject is required').max(200),
  message: z.string().trim().min(1, 'Message is required').max(2000),
});

type ContactForm = z.infer<typeof contactSchema>;

const contactInfo = [
  { icon: Mail, label: 'Email', value: 'support@styliquefashion.com' },
  { icon: Phone, label: 'Phone', value: '+91 98765 43210' },
  { icon: MapPin, label: 'Address', value: 'Andheri West, Mumbai, Maharashtra 400058' },
  { icon: Clock, label: 'Hours', value: 'Mon–Sat, 10 AM – 7 PM IST' },
];

const ContactPage = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<ContactForm>({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactForm, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = contactSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0] as keyof ContactForm;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('contact_messages' as any).insert([result.data]);
    setSubmitting(false);

    if (error) {
      toast({ title: 'Something went wrong', description: 'Please try again later.', variant: 'destructive' });
      return;
    }

    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  const inputClass = (field: keyof ContactForm) =>
    `w-full bg-muted border ${errors[field] ? 'border-destructive' : 'border-border'} rounded-xl px-4 py-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block font-accent text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">
            Get in Touch
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-4">
            We'd Love to <span className="text-gradient">Hear From You</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="font-body text-muted-foreground">
            Questions about orders, sizing, custom prints, or just wanna say hi? Drop us a message.
          </motion.p>
        </div>
      </section>

      {/* Main */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-10 max-w-5xl mx-auto">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 bg-primary text-primary-foreground rounded-2xl p-8 flex flex-col justify-between"
            >
              <div>
                <h2 className="font-heading text-2xl font-bold mb-2">Contact Info</h2>
                <p className="font-body text-sm text-primary-foreground/60 mb-8">
                  Reach out through any of these channels.
                </p>
                <div className="space-y-6">
                  {contactInfo.map((c) => (
                    <div key={c.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center shrink-0">
                        <c.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-accent text-xs font-semibold uppercase tracking-wider text-primary-foreground/50">{c.label}</p>
                        <p className="font-body text-sm mt-0.5">{c.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-10 pt-6 border-t border-primary-foreground/10">
                <p className="font-body text-xs text-primary-foreground/40">
                  We typically respond within 24 hours on business days.
                </p>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              {submitted ? (
                <div className="bg-card rounded-2xl p-12 text-center shadow-sm">
                  <CheckCircle className="w-16 h-16 text-accent mx-auto mb-6" />
                  <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Message Sent!</h3>
                  <p className="font-body text-muted-foreground mb-6">
                    Thanks for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="font-accent text-sm font-semibold text-accent hover:underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 shadow-sm space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="font-accent text-xs font-semibold text-foreground mb-1.5 block">Name</label>
                      <input name="name" value={form.name} onChange={handleChange} placeholder="Your name" className={inputClass('name')} />
                      {errors.name && <p className="text-destructive text-xs mt-1 font-body">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="font-accent text-xs font-semibold text-foreground mb-1.5 block">Email</label>
                      <input name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className={inputClass('email')} />
                      {errors.email && <p className="text-destructive text-xs mt-1 font-body">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="font-accent text-xs font-semibold text-foreground mb-1.5 block">Subject</label>
                    <input name="subject" value={form.subject} onChange={handleChange} placeholder="What's this about?" className={inputClass('subject')} />
                    {errors.subject && <p className="text-destructive text-xs mt-1 font-body">{errors.subject}</p>}
                  </div>
                  <div>
                    <label className="font-accent text-xs font-semibold text-foreground mb-1.5 block">Message</label>
                    <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us more..." rows={5} className={inputClass('message')} />
                    {errors.message && <p className="text-destructive text-xs mt-1 font-body">{errors.message}</p>}
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-accent text-accent-foreground rounded-xl py-3.5 font-accent text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {submitting ? 'Sending…' : <><Send className="w-4 h-4" /> Send Message</>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="bg-muted">
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">Visit Us</p>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Our Studio</h2>
          <p className="font-body text-muted-foreground text-sm mb-8">Andheri West, Mumbai — by appointment only</p>
          <div className="rounded-2xl overflow-hidden shadow-md max-w-4xl mx-auto">
            <iframe
              title="Stylique Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3769.9!2d72.836!3d19.136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDA4JzEwLjAiTiA3MsKwNTAnMTAuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
