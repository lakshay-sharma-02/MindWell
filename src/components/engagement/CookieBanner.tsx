import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      // Delay showing the banner
      const timer = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="fixed bottom-0 left-0 right-0 z-40 p-4"
        >
          <div className="container-wide">
            <div className="bg-card border border-border rounded-2xl shadow-lg p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Cookie className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">We value your privacy</h3>
                  <p className="text-sm text-muted-foreground">
                    We use cookies to enhance your browsing experience and analyze site traffic.{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                      Learn more
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDecline}
                  className="flex-1 md:flex-none"
                >
                  Decline
                </Button>
                <Button
                  variant="calm"
                  size="sm"
                  onClick={handleAccept}
                  className="flex-1 md:flex-none"
                >
                  Accept
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
