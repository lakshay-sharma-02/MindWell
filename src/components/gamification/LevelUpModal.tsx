import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Trophy, Star, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  oldLevel: number;
  levelTitle: string;
}

export function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  oldLevel,
  levelTitle,
}: LevelUpModalProps) {
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Show rewards after a delay
      setTimeout(() => setShowRewards(true), 1000);

      // Continuous confetti for legendary levels
      if (newLevel % 10 === 0) {
        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#8b5cf6", "#ec4899", "#f59e0b"],
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#8b5cf6", "#ec4899", "#f59e0b"],
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
      }
    }
  }, [isOpen, newLevel]);

  const getUnlocks = (level: number) => {
    const unlocks = [];

    if (level === 5) unlocks.push({ icon: "🌊", text: "Ocean Breeze Theme unlocked!" });
    if (level === 10) unlocks.push({ icon: "🌲", text: "Forest Calm Theme unlocked!" });
    if (level === 15) unlocks.push({ icon: "🌅", text: "Sunset Glow Theme unlocked!" });
    if (level === 20) unlocks.push({ icon: "💰", text: "$25 Therapy Voucher unlocked!" });
    if (level === 25) unlocks.push({ icon: "🏆", text: "Exclusive Champion Badge unlocked!" });
    if (level === 30) unlocks.push({ icon: "👑", text: "Priority Support unlocked!" });
    if (level === 40) unlocks.push({ icon: "✨", text: "Beta Features Access unlocked!" });
    if (level === 50) unlocks.push({ icon: "🎉", text: "Lifetime Premium unlocked!" });

    return unlocks;
  };

  const unlocks = getUnlocks(newLevel);
  const isLegendary = newLevel % 10 === 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.5, rotateY: -180, opacity: 0 }}
          animate={{ scale: 1, rotateY: 0, opacity: 1 }}
          exit={{ scale: 0.5, rotateY: 180, opacity: 0 }}
          transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-w-lg w-full"
        >
          {/* Main Card */}
          <div
            className={`relative overflow-hidden rounded-3xl p-8 shadow-2xl ${
              isLegendary
                ? "bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-amber-500/20 border-2 border-purple-500/50"
                : "bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 border-2 border-primary/50"
            } backdrop-blur-xl`}
          >
            {/* Animated background rays for legendary */}
            {isLegendary && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-20"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-2 h-full bg-gradient-to-b from-amber-500 via-purple-500 to-transparent"
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
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="flex justify-center"
              >
                <div
                  className={`inline-flex items-center justify-center w-24 h-24 rounded-full shadow-2xl ${
                    isLegendary
                      ? "bg-gradient-to-br from-purple-500 via-pink-500 to-amber-500"
                      : newLevel >= 25
                      ? "bg-gradient-to-br from-amber-500 to-orange-500"
                      : "bg-gradient-to-br from-primary to-purple-600"
                  }`}
                >
                  {isLegendary ? (
                    <Crown className="w-12 h-12 text-white" />
                  ) : newLevel >= 25 ? (
                    <Trophy className="w-12 h-12 text-white" />
                  ) : (
                    <Star className="w-12 h-12 text-white" />
                  )}
                </div>
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-4xl font-display font-bold mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-500" />
                  Level Up!
                  <Sparkles className="w-6 h-6 text-amber-500" />
                </h2>
                <div className="flex items-center justify-center gap-3 text-2xl font-bold">
                  <span className="text-muted-foreground">Level {oldLevel}</span>
                  <motion.span
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                  <span
                    className={
                      isLegendary
                        ? "bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 bg-clip-text text-transparent"
                        : "text-primary"
                    }
                  >
                    Level {newLevel}
                  </span>
                </div>
                <p className="text-lg text-muted-foreground mt-2">{levelTitle}</p>
              </motion.div>

              {/* Unlocks */}
              <AnimatePresence>
                {showRewards && unlocks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                  >
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      🎁 Rewards Unlocked
                    </p>
                    {unlocks.map((unlock, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                      >
                        <span className="text-2xl">{unlock.icon}</span>
                        <span className="font-medium">{unlock.text}</span>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <Button
                  onClick={onClose}
                  size="lg"
                  className={`w-full text-lg font-bold shadow-xl ${
                    isLegendary
                      ? "bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500 hover:opacity-90"
                      : "bg-gradient-to-r from-primary to-purple-600"
                  }`}
                >
                  Continue Your Journey 🚀
                </Button>
              </motion.div>

              {/* Motivational message */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="text-sm text-muted-foreground italic"
              >
                "Every level is a testament to your commitment to mental wellness."
              </motion.p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
