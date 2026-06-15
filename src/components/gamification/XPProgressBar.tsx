import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, TrendingUp, Star, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface XPData {
  total_xp: number;
  current_level: number;
  xp_to_next_level: number;
  level_title: string;
  current_level_xp: number;
}

interface XPProgressBarProps {
  variant?: "fixed" | "inline";
  showDetails?: boolean;
}

export function XPProgressBar({ variant = "fixed", showDetails = true }: XPProgressBarProps) {
  const { user } = useAuth();
  const [xpData, setXpData] = useState<XPData | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentXP, setRecentXP] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      fetchXPData();

      // Subscribe to real-time XP updates
      const channel = supabase
        .channel('xp_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'user_xp',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchXPData();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchXPData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_user_xp', {
        p_user_id: user.id,
      });

      if (error) throw error;

      if (data && data.length > 0) {
        setXpData(data[0]);
      }
    } catch (error) {
      console.error('Error fetching XP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const showXPGain = (amount: number) => {
    setRecentXP(amount);
    setTimeout(() => setRecentXP(null), 3000);
  };

  // Expose method to parent components
  useEffect(() => {
    if (user) {
      (window as any).showXPGain = showXPGain;
    }
  }, [user]);

  if (loading || !xpData || !user) return null;

  const progressPercentage = (xpData.current_level_xp / xpData.xp_to_next_level) * 100;
  const isCloseToLevelUp = progressPercentage >= 80;

  if (variant === "inline") {
    return (
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-semibold">Level {xpData.current_level}</span>
            <span className="text-muted-foreground">• {xpData.level_title}</span>
          </div>
          <span className="text-muted-foreground">
            {xpData.current_level_xp} / {xpData.xp_to_next_level} XP
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 border-b border-border/50 backdrop-blur-xl z-40",
        variant === "fixed" && "sticky top-16 lg:top-[4.5rem]"
      )}
    >
      <div className="container-wide py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Level Info */}
          <div className="flex items-center gap-3">
            <motion.div
              animate={isCloseToLevelUp ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                "p-2 rounded-xl bg-gradient-to-br shadow-lg",
                isCloseToLevelUp
                  ? "from-amber-500 to-orange-500 animate-pulse"
                  : "from-primary to-purple-600"
              )}
            >
              {xpData.current_level >= 25 ? (
                <Trophy className="w-5 h-5 text-white" />
              ) : (
                <Star className="w-5 h-5 text-white" />
              )}
            </motion.div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">Level {xpData.current_level}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {xpData.level_title}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {xpData.total_xp.toLocaleString()} Total XP
              </p>
            </div>

            {/* Mobile: Compact */}
            <div className="sm:hidden">
              <span className="text-sm font-bold">Lv.{xpData.current_level}</span>
            </div>
          </div>

          {/* Center: Progress Bar */}
          <div className="flex-1 max-w-md space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="hidden sm:inline">
                {xpData.current_level_xp} / {xpData.xp_to_next_level} XP
              </span>
              <span className="sm:hidden">{Math.round(progressPercentage)}%</span>
              {showDetails && (
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {xpData.xp_to_next_level - xpData.current_level_xp} to Level {xpData.current_level + 1}
                </span>
              )}
            </div>

            <div className="relative">
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={cn(
                    "h-full rounded-full relative",
                    isCloseToLevelUp
                      ? "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 animate-shimmer"
                      : "bg-gradient-to-r from-primary via-purple-500 to-primary"
                  )}
                  style={{
                    backgroundSize: "200% 100%",
                  }}
                >
                  {/* Glow effect when close to level up */}
                  {isCloseToLevelUp && (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-white/30 blur-sm"
                    />
                  )}
                </motion.div>
              </div>

              {/* Sparkle effect at end */}
              {isCloseToLevelUp && (
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute right-1 top-1/2 -translate-y-1/2"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                </motion.div>
              )}
            </div>
          </div>

          {/* Right: Next Level Preview (Desktop only) */}
          {showDetails && (
            <div className="hidden lg:flex items-center gap-2 text-xs">
              <div className="text-right">
                <p className="text-muted-foreground">Next Level</p>
                <p className="font-bold text-primary">Level {xpData.current_level + 1}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center border-2 border-dashed border-primary/30">
                <span className="text-lg">🎁</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating XP Gain Notification */}
      <AnimatePresence>
        {recentXP && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: -40, scale: 1 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ duration: 0.5 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-primary to-purple-600 text-white font-bold shadow-xl flex items-center gap-2">
              <Zap className="w-4 h-4" />
              +{recentXP} XP
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
