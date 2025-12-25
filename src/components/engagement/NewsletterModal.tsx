import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { sendNewsletterSubscription } from "@/lib/email";

export function NewsletterModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if already shown
    const hasShown = localStorage.getItem("newsletter-shown");
    if (hasShown) return;

    // Show after 30 seconds or 50% scroll
    const timer = setTimeout(() => {
      setIsOpen(true);
      localStorage.setItem("newsletter-shown", "true");
    }, 30000);

    const handleScroll = () => {
      const scrollPercent =
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercent > 50 && !localStorage.getItem("newsletter-shown")) {
        setIsOpen(true);
        localStorage.setItem("newsletter-shown", "true");
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);

    try {
      const result = await sendNewsletterSubscription(email);

      if (!result.success) throw new Error(result.error);

      toast({
        title: "Welcome to MindWell! 🎉",
        description: "You'll receive our latest insights and resources.",
      });

      setEmail("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error subscribing:", error);
      toast({
        title: "Subscription failed",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={() => setIsOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-md max-h-[calc(100vh-2rem)] overflow-auto bg-card border border-border rounded-3xl shadow-2xl">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>

              {/* Content */}
              <div className="relative p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Mail className="w-8 h-8 text-primary" />
                </div>

                <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
                  Join Our Community
                </h2>
                <p className="text-muted-foreground mb-6">
                  Get weekly insights, mental health tips, and exclusive resources delivered to your inbox.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-center"
                    required
                  />
                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      "Subscribing..."
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Subscribe for Free
                      </>
                    )}
                  </Button>
                </form>

                <p className="text-xs text-muted-foreground mt-4">
                  No spam, ever. Unsubscribe anytime.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
