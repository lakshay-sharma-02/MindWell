import { useState } from "react";
import { X, Phone, HeartHandshake } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CrisisBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="bg-destructive/10 border-b border-destructive/20 relative z-50"
      >
        <div className="container-wide py-2 px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm">
          <div className="flex items-center gap-2 text-destructive font-medium text-center sm:text-left">
            <HeartHandshake className="w-4 h-4 shrink-0" />
            <span>
              If you or someone you know is in immediate danger, please call emergency services.
            </span>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a 
              href="tel:988" 
              className="flex items-center gap-1.5 font-bold text-destructive hover:underline"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call 988 (US)</span>
            </a>
             <span className="text-muted-foreground/50 hidden sm:inline">|</span>
            <button 
              onClick={() => setIsVisible(false)}
              className="p-1 hover:bg-destructive/10 rounded-full transition-colors text-muted-foreground"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
