import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, BookOpen, Headphones } from "lucide-react";

const proofItems = [
  {
    icon: Calendar,
    message: "Emma from Portland just booked a consultation",
    time: "2 minutes ago",
  },
  {
    icon: BookOpen,
    message: "Michael downloaded the Anxiety Relief Workbook",
    time: "5 minutes ago",
  },
  {
    icon: Headphones,
    message: "Sarah is listening to 'Healing Through Connection'",
    time: "8 minutes ago",
  },
  {
    icon: Calendar,
    message: "David just scheduled his first session",
    time: "12 minutes ago",
  },
  {
    icon: BookOpen,
    message: "Jennifer started the Mindfulness Starter Guide",
    time: "15 minutes ago",
  },
];

export function SocialProofToast() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (dismissed) return;

    // Initial delay before first toast
    const initialDelay = setTimeout(() => {
      setIsVisible(true);
    }, 15000);

    return () => clearTimeout(initialDelay);
  }, [dismissed]);

  useEffect(() => {
    if (dismissed || !isVisible) return;

    // Auto-hide after 5 seconds
    const hideTimeout = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(hideTimeout);
  }, [isVisible, dismissed]);

  useEffect(() => {
    if (dismissed || isVisible) return;

    // Show next toast after interval
    const nextTimeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % proofItems.length);
      setIsVisible(true);
    }, 45000);

    return () => clearTimeout(nextTimeout);
  }, [isVisible, dismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);
  };

  const currentItem = proofItems[currentIndex];
  const Icon = currentItem.icon;

  return (
    <AnimatePresence>
      {isVisible && !dismissed && (
        <motion.div
          initial={{ opacity: 0, x: -100, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ type: "spring", damping: 20, stiffness: 200 }}
          className="fixed bottom-4 left-4 z-40 max-w-xs"
        >
          <div className="bg-card border border-border rounded-xl shadow-lg p-4 flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">
                {currentItem.message}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {currentItem.time}
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-muted rounded-full transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
