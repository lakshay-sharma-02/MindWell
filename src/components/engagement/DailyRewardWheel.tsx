import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, Sparkles, Trophy, Heart, Star, Zap, Crown, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import confetti from "canvas-confetti";
import { useXP, XP_AMOUNTS } from "@/hooks/useXP";

interface Reward {
  id: string;
  type: string;
  rarity: 'common' | 'rare' | 'legendary';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const REWARD_POOL: Reward[] = [
  // Common (60%)
  {
    id: 'affirmation_1',
    type: 'affirmation',
    rarity: 'common',
    title: 'Daily Affirmation',
    description: 'You are stronger than you think 💪',
    icon: <Heart className="w-6 h-6" />,
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  },
  {
    id: 'affirmation_2',
    type: 'affirmation',
    rarity: 'common',
    title: 'Positive Vibes',
    description: 'Your progress matters, no matter how small ✨',
    icon: <Sparkles className="w-6 h-6" />,
    color: 'from-purple-500/20 to-violet-500/20 border-purple-500/30',
  },
  {
    id: 'quote_1',
    type: 'quote',
    rarity: 'common',
    title: 'Wisdom Quote',
    description: '"The only way out is through." - Robert Frost',
    icon: <Star className="w-6 h-6" />,
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  },
  {
    id: 'affirmation_3',
    type: 'affirmation',
    rarity: 'common',
    title: 'Self-Love',
    description: 'You deserve kindness, especially from yourself 💙',
    icon: <Heart className="w-6 h-6" />,
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  },
  {
    id: 'quote_2',
    type: 'quote',
    rarity: 'common',
    title: 'Motivation',
    description: '"You are braver than you believe." - A.A. Milne',
    icon: <Star className="w-6 h-6" />,
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  },
  {
    id: 'hug',
    type: 'hug',
    rarity: 'common',
    title: 'Virtual Hug',
    description: '🤗 Sending you warmth and support',
    icon: <Heart className="w-6 h-6" />,
    color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  },

  // Rare (30%)
  {
    id: 'badge_early_bird',
    type: 'badge',
    rarity: 'rare',
    title: '🌅 Early Bird Badge',
    description: 'Unlocked: The Early Riser achievement!',
    icon: <Trophy className="w-6 h-6" />,
    color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
  },
  {
    id: 'unlock_breathing',
    type: 'unlock',
    rarity: 'rare',
    title: '🎁 Premium Unlocked',
    description: 'Advanced Breathing Exercise unlocked for 24h!',
    icon: <Gift className="w-6 h-6" />,
    color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30',
  },
  {
    id: 'xp_boost',
    type: 'xp_boost',
    rarity: 'rare',
    title: '⚡ XP Boost',
    description: '2x XP for the next 24 hours!',
    icon: <Zap className="w-6 h-6" />,
    color: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30',
  },

  // Legendary (10%)
  {
    id: 'therapy_voucher',
    type: 'voucher',
    rarity: 'legendary',
    title: '👑 Therapy Voucher',
    description: '$50 off your next therapy session!',
    icon: <Crown className="w-6 h-6" />,
    color: 'from-purple-500/20 via-pink-500/20 to-amber-500/20 border-purple-500/40',
  },
];

export function DailyRewardWheel() {
  const { user } = useAuth();
  const { awardXP } = useXP();
  const [hasClaimed, setHasClaimed] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [wonReward, setWonReward] = useState<Reward | null>(null);
  const [showReward, setShowReward] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkIfClaimed();
  }, [user]);

  const checkIfClaimed = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('has_claimed_reward_today', {
        p_user_id: user.id,
      });

      if (!error) {
        setHasClaimed(data);
      }
    } catch (error) {
      console.error('Error checking reward status:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectReward = (): Reward => {
    const random = Math.random() * 100;

    if (random < 10) {
      // 10% legendary
      return REWARD_POOL.find((r) => r.rarity === 'legendary')!;
    } else if (random < 40) {
      // 30% rare
      const rareRewards = REWARD_POOL.filter((r) => r.rarity === 'rare');
      return rareRewards[Math.floor(Math.random() * rareRewards.length)];
    } else {
      // 60% common
      const commonRewards = REWARD_POOL.filter((r) => r.rarity === 'common');
      return commonRewards[Math.floor(Math.random() * commonRewards.length)];
    }
  };

  const spinWheel = async () => {
    if (!user || spinning || hasClaimed) return;

    setSpinning(true);

    // Simulate spin animation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const reward = selectReward();
    setWonReward(reward);

    // Save to database
    try {
      const { error } = await supabase.from('daily_rewards').insert({
        user_id: user.id,
        reward_type: reward.type,
        reward_data: {
          id: reward.id,
          title: reward.title,
          description: reward.description,
        },
        rarity: reward.rarity,
      });

      if (!error) {
        setHasClaimed(true);
        setShowReward(true);

        // Award XP for spinning wheel
        await awardXP(
          XP_AMOUNTS.REWARD_WHEEL,
          'reward_wheel',
          `Daily reward: ${reward.title}`
        );

        // Trigger confetti
        if (reward.rarity === 'legendary') {
          confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#9333ea', '#ec4899', '#f59e0b'],
          });
        } else if (reward.rarity === 'rare') {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } else {
          confetti({
            particleCount: 50,
            spread: 50,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (error) {
      console.error('Error saving reward:', error);
    } finally {
      setSpinning(false);
    }
  };

  if (loading) {
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Main Reward Card */}
      <AnimatePresence>
        {!hasClaimed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="p-8 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 border-primary/30 relative overflow-hidden">
              {/* Animated background */}
              <div className="absolute inset-0 opacity-30">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                  }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl"
                />
              </div>

              <div className="relative z-10 text-center space-y-6">
                <motion.div
                  animate={
                    spinning
                      ? {
                          rotate: [0, 360],
                          scale: [1, 1.1, 1],
                        }
                      : {}
                  }
                  transition={
                    spinning
                      ? {
                          rotate: { duration: 1, repeat: 2, ease: 'easeInOut' },
                          scale: { duration: 0.5, repeat: 4, ease: 'easeInOut' },
                        }
                      : {}
                  }
                  className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-2xl"
                >
                  <Gift className="w-16 h-16 text-white" />
                </motion.div>

                <div>
                  <h3 className="text-2xl font-display font-bold mb-2 flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6 text-amber-500" />
                    Daily Surprise Gift
                    <Sparkles className="w-6 h-6 text-amber-500" />
                  </h3>
                  <p className="text-muted-foreground">
                    Spin once per day for a chance to win amazing rewards!
                  </p>
                </div>

                <Button
                  size="lg"
                  onClick={spinWheel}
                  disabled={spinning || hasClaimed}
                  className="px-8 py-6 text-lg font-bold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-xl"
                >
                  {spinning ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-5 h-5 mr-2" />
                      </motion.div>
                      Spinning...
                    </>
                  ) : (
                    <>
                      <Gift className="w-5 h-5 mr-2" />
                      Spin the Wheel!
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>60% Common</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>30% Rare</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-purple-500" />
                    <span>10% Legendary</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Reveal Modal */}
      <AnimatePresence>
        {showReward && wonReward && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setShowReward(false)}
          >
            <motion.div
              initial={{ scale: 0.5, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.5, y: 50, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.6 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full"
            >
              <Card className={`p-8 bg-gradient-to-br ${wonReward.color} border-2 relative overflow-hidden`}>
                {/* Animated rays for legendary */}
                {wonReward.rarity === 'legendary' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 opacity-20"
                  >
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div
                        key={i}
                        className="absolute top-1/2 left-1/2 w-1 h-full bg-gradient-to-b from-amber-500 to-transparent"
                        style={{
                          transform: `rotate(${i * 30}deg) translateX(-50%)`,
                          transformOrigin: 'top',
                        }}
                      />
                    ))}
                  </motion.div>
                )}

                <div className="relative z-10 text-center space-y-4">
                  {/* Rarity badge */}
                  <div className="flex justify-center">
                    <span
                      className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${
                        wonReward.rarity === 'legendary'
                          ? 'bg-gradient-to-r from-purple-500 to-amber-500 text-white'
                          : wonReward.rarity === 'rare'
                          ? 'bg-amber-500 text-white'
                          : 'bg-blue-500 text-white'
                      }`}
                    >
                      {wonReward.rarity}
                    </span>
                  </div>

                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="flex justify-center"
                  >
                    <div
                      className={`p-6 rounded-full ${
                        wonReward.rarity === 'legendary'
                          ? 'bg-gradient-to-br from-purple-500 to-amber-500'
                          : wonReward.rarity === 'rare'
                          ? 'bg-amber-500'
                          : 'bg-primary'
                      } text-white shadow-2xl`}
                    >
                      {wonReward.icon}
                    </div>
                  </motion.div>

                  {/* Title & Description */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <h3 className="text-2xl font-display font-bold mb-2">{wonReward.title}</h3>
                    <p className="text-muted-foreground">{wonReward.description}</p>
                  </motion.div>

                  {/* Close button */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      onClick={() => setShowReward(false)}
                      size="lg"
                      className="w-full bg-gradient-to-r from-primary to-purple-600"
                    >
                      Awesome! 🎉
                    </Button>
                  </motion.div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Claimed State - Small Widget */}
      <AnimatePresence>
        {hasClaimed && !showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <Card className="p-4 bg-muted/50 border-muted relative overflow-hidden">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Lock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">Daily Reward Claimed!</p>
                  <p className="text-xs text-muted-foreground">Come back tomorrow for more surprises</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
