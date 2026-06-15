import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Target, Trophy, TrendingUp, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Challenge {
  challenge_id: string;
  challenge_title: string;
  challenge_description: string;
  challenge_type: string;
  goal_count: number;
  goal_description: string;
  icon: string;
  current_count: number;
  progress_percentage: number;
  completed: boolean;
  days_remaining: number;
  reward_xp: number;
}

export function WeeklyChallengeCard() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchChallenges();
    }
  }, [user]);

  const fetchChallenges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_user_challenge_progress', {
        p_user_id: user.id,
      });

      if (error) throw error;

      setChallenges(data || []);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/2"></div>
          <div className="h-20 bg-muted rounded"></div>
        </div>
      </Card>
    );
  }

  if (challenges.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No active challenges right now</p>
        <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
      </Card>
    );
  }

  const activeChallenge = challenges[0]; // Show first active challenge

  return (
    <Card className="relative overflow-hidden p-6 bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/5 border-primary/20">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

      <div className="relative space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10">
              <span className="text-2xl">{activeChallenge.icon}</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-lg">
                {activeChallenge.challenge_title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {activeChallenge.challenge_description}
              </p>
            </div>
          </div>

          {/* Days remaining badge */}
          <div className="flex-shrink-0 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {activeChallenge.days_remaining}d left
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{activeChallenge.goal_description}</span>
            <span className="text-muted-foreground">
              {activeChallenge.current_count} / {activeChallenge.goal_count}
            </span>
          </div>

          <div className="relative">
            <Progress
              value={activeChallenge.progress_percentage}
              className="h-3"
            />
            {activeChallenge.progress_percentage >= 80 && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                <TrendingUp className="w-3 h-3 text-primary" />
              </motion.div>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{activeChallenge.progress_percentage}% complete</span>
            <span className="flex items-center gap-1">
              <Target className="w-3 h-3" />
              {activeChallenge.goal_count - activeChallenge.current_count} more to go
            </span>
          </div>
        </div>

        {/* Reward & Status */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-2 text-sm">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-semibold text-amber-600">
              {activeChallenge.reward_xp} XP Reward
            </span>
          </div>

          {activeChallenge.completed ? (
            <div className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-bold flex items-center gap-1">
              ✓ Completed
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => {
                // Navigate to relevant tool based on challenge type
                const toolMap: Record<string, string> = {
                  gratitude: '/tools?tab=gratitude',
                  breathing: '/tools?tab=breathing',
                  mood_tracking: '/tools?tab=mood',
                  consistency: '/dashboard',
                };
                window.location.href = toolMap[activeChallenge.challenge_type] || '/tools';
              }}
            >
              Start Now →
            </Button>
          )}
        </div>

        {/* Motivational message */}
        {!activeChallenge.completed && activeChallenge.progress_percentage >= 50 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-lg bg-primary/5 border border-primary/20"
          >
            <p className="text-xs text-center font-medium">
              🎉 You're over halfway there! Keep going!
            </p>
          </motion.div>
        )}
      </div>
    </Card>
  );
}
