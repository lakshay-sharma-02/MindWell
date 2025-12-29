import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Mail, Phone, MapPin, ArrowRight, Instagram, Linkedin, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { sendNewsletterSubscription } from "@/lib/email";

const footerLinks = {
  resources: [
    { name: "Blog", href: "/blog" },
    { name: "Podcasts", href: "/podcasts" },
    { name: "Free Resources", href: "/resources" },
    { name: "Self-Assessment", href: "/quiz" },
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Book a Session", href: "/book" },
    { name: "Contact", href: "/contact" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};


export function Footer() {
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { toast } = useToast();

  const socialLinks = [
    { name: "Instagram", icon: Instagram, href: settings.social_links.instagram },
    { name: "LinkedIn", icon: Linkedin, href: settings.social_links.linkedin },
    { name: "Twitter", icon: Twitter, href: settings.social_links.twitter },
    // YouTube not in settings schema yet, keeping default or could add
    { name: "YouTube", icon: Youtube, href: "#" },
  ];

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);

    try {
      const result = await sendNewsletterSubscription(email);

      if (!result.success) throw new Error(result.error);

      toast({
        title: "Welcome to MindWell! ✨",
        description: "You've been added to our newsletter.",
      });

      setEmail("");
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Subscription failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className="relative overflow-hidden bg-secondary/40 dark:bg-card/60 border-t border-border/50">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[250px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[200px] bg-accent/5 rounded-full blur-[100px]" />
        {/* Alive Morph Blob */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] morph opacity-20 pointer-events-none" />
      </div>

      <div className="container-wide relative py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 3 }}
                className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-glow"
              >
                <Heart className="w-6 h-6 text-primary-foreground" fill="currentColor" />
              </motion.div>
              <span className="font-display text-2xl font-semibold text-foreground">
                {settings.global_info.title}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-sm">
              {settings.global_info.description}
            </p>

            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a
                href={`mailto:${settings.global_info.contact_email}`}
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-card dark:bg-secondary/50 border border-border/50 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                  <Mail className="w-4 h-4" />
                </div>
                {settings.global_info.contact_email}
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors group"
              >
                <div className="w-9 h-9 rounded-xl bg-card dark:bg-secondary/50 border border-border/50 flex items-center justify-center group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                  <Phone className="w-4 h-4" />
                </div>
                (123) 456-7890
              </a>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <div className="w-9 h-9 rounded-xl bg-card dark:bg-secondary/50 border border-border/50 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                San Francisco, CA
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-card dark:bg-secondary/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="lg:col-span-2">
            <h3 className="font-display font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">
              Resources
            </h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span className="relative">
                      {link.name}
                      <span className="absolute left-0 bottom-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
                    </span>
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="font-display font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 group"
                  >
                    <span className="relative">
                      {link.name}
                      <span className="absolute left-0 bottom-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-300" />
                    </span>
                    <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-4">
            <h3 className="font-display font-semibold text-foreground mb-5 text-sm uppercase tracking-wider">
              Stay Connected
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Subscribe to receive mental wellness tips, exclusive resources, and updates.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-border bg-card dark:bg-secondary/50 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all pr-12"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full btn-glow"
                disabled={isSubscribing}
              >
                {isSubscribing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  />
                ) : (
                  <>
                    Subscribe to Newsletter
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground mt-3">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} {settings.global_info.title}. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
