import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface BadgeUnlockAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  badge: {
    name: string;
    description: string;
    icon: string;
    rarity: "common" | "rare" | "legendary";
  } | null;
}

export function BadgeUnlockAnimation({
  isOpen,
  onClose,
  badge,
}: BadgeUnlockAnimationProps) {
  useEffect(() => {
    if (isOpen && badge) {
      // Trigger confetti based on rarity
      setTimeout(() => {
        if (badge.rarity === "legendary") {
          confetti({
            particleCount: 200,
            spread: 120,
            origin: { y: 0.6 },
            colors: ["#9333ea", "#ec4899", "#f59e0b"],
          });
        } else if (badge.rarity === "rare") {
          confetti({
            particleCount: 100,
            spread: 80,
            origin: { y: 0.6 },
            colors: ["#f59e0b", "#f97316"],
          });
        } else {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      }, 300);
    }
  }, [isOpen, badge]);

  if (!badge) return null;

  const getRarityGradient = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "from-purple-500 via-pink-500 to-amber-500";
      case "rare":
        return "from-amber-500 to-orange-500";
      default:
        return "from-blue-500 to-cyan-500";
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "border-purple-500/50";
      case "rare":
        return "border-amber-500/50";
      default:
        return "border-blue-500/50";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, rotateY: -180, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            exit={{ scale: 0.5, rotateY: 180, opacity: 0 }}
            transition={{ type: "spring", duration: 0.7, bounce: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-md w-full"
          >
            {/* Card */}
            <div
              className={`relative overflow-hidden rounded-3xl p-8 backdrop-blur-xl border-2 ${getRarityBorder(
                badge.rarity
              )} bg-gradient-to-br ${getRarityGradient(badge.rarity)}/20 shadow-2xl`}
            >
              {/* Animated rays for legendary */}
              {badge.rarity === "legendary" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 opacity-20"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-2 h-full bg-gradient-to-b from-amber-500 to-transparent"
                      style={{
                        transform: `rotate(${i * 30}deg) translateX(-50%)`,
                        transformOrigin: "top",
                      }}
                    />
                  ))}
                </motion.div>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors z-10"
              >
                <X className="w-5 h-5 text-white" />
              </button>

              {/* Content */}
              <div className="relative z-10 text-center space-y-6">
                {/* Badge Icon with flip animation */}
                <motion.div
                  initial={{ scale: 0, rotateY: -180 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 150 }}
                  className="flex justify-center"
                >
                  <div
                    className={`inline-flex items-center justify-center w-32 h-32 rounded-full shadow-2xl bg-gradient-to-br ${getRarityGradient(
                      badge.rarity
                    )}`}
                  >
                    <span className="text-6xl">{badge.icon}</span>
                  </div>
                </motion.div>

                {/* Rarity badge */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex justify-center"
                >
                  <span
                    className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${
                      badge.rarity === "legendary"
                        ? "bg-gradient-to-r from-purple-500 to-amber-500 text-white"
                        : badge.rarity === "rare"
                        ? "bg-amber-500 text-white"
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    {badge.rarity} Badge
                  </span>
                </motion.div>

                {/* Badge Name */}
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-3xl font-display font-bold"
                >
                  {badge.name}
                </motion.h2>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="text-muted-foreground"
                >
                  {badge.description}
                </motion.p>

                {/* CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <Button
                    onClick={onClose}
                    size="lg"
                    className={`w-full text-lg font-bold shadow-xl bg-gradient-to-r ${getRarityGradient(
                      badge.rarity
                    )}`}
                  >
                    Awesome! 🎉
                  </Button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
