import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Flame, Target } from "lucide-react";
import { motion } from "framer-motion";

interface StreakWidgetProps {
  userId: string;
}

export function StreakWidget({ userId }: StreakWidgetProps) {
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  useEffect(() => {
    // Get streak from localStorage for now
    const currentStreak = parseInt(localStorage.getItem(`streak_${userId}`) || "0");
    const longest = parseInt(localStorage.getItem(`longest_streak_${userId}`) || "0");

    setStreak(currentStreak);
    setLongestStreak(Math.max(currentStreak, longest));
  }, [userId]);

  const getStreakMessage = () => {
    if (streak === 0) return "Start your journey today!";
    if (streak === 1) return "Great start! Keep it going.";
    if (streak < 7) return "You're building momentum!";
    if (streak < 30) return "Strong commitment! 💪";
    if (streak < 100) return "Incredible dedication! 🌟";
    return "Mental health champion! 👑";
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent border-orange-500/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />

      <div className="relative">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <Flame className="w-5 h-5 text-orange-500" />
          </div>
          <h3 className="font-display font-bold text-lg">Daily Streak</h3>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="text-5xl font-bold text-orange-500">{streak}</div>
            <p className="text-xs text-muted-foreground mt-1">days</p>
          </motion.div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Best: {longestStreak} days</span>
            </div>
            <p className="text-sm font-medium">{getStreakMessage()}</p>
          </div>
        </div>

        {streak > 0 && (
          <div className="flex gap-1">
            {Array.from({ length: Math.min(streak, 7) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="w-8 h-8 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center justify-center"
              >
                <Calendar className="w-4 h-4 text-orange-500" />
              </motion.div>
            ))}
            {streak > 7 && (
              <div className="flex items-center justify-center px-2">
                <span className="text-sm font-bold text-orange-500">+{streak - 7}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
