import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import confetti from "canvas-confetti";
import { toast } from "sonner";

interface XPAwardResult {
  new_total_xp: number;
  new_level: number;
  leveled_up: boolean;
  old_level: number;
}

export function useXP() {
  const { user } = useAuth();
  const [awarding, setAwarding] = useState(false);

  const awardXP = useCallback(
    async (
      amount: number,
      source: string,
      description?: string,
      metadata?: any
    ): Promise<XPAwardResult | null> => {
      if (!user || awarding) return null;

      setAwarding(true);

      try {
        const { data, error } = await supabase.rpc("award_xp", {
          p_user_id: user.id,
          p_amount: amount,
          p_source: source,
          p_description: description || null,
          p_metadata: metadata || null,
        });

        if (error) throw error;

        const result = data[0] as XPAwardResult;

        // Show XP gain animation
        if (typeof (window as any).showXPGain === "function") {
          (window as any).showXPGain(amount);
        }

        // Show toast notification
        toast.success(`+${amount} XP earned!`, {
          description: description || `From ${source}`,
          icon: "⚡",
        });

        // Level up celebration
        if (result.leveled_up) {
          setTimeout(() => {
            confetti({
              particleCount: 150,
              spread: 100,
              origin: { y: 0.6 },
              colors: ["#10b981", "#8b5cf6", "#ec4899"],
            });

            // Show level up modal via global function
            if (typeof (window as any).showLevelUpModal === "function") {
              (window as any).showLevelUpModal(result.new_level, result.old_level);
            } else {
              toast.success(`🎉 Level Up! You're now Level ${result.new_level}!`, {
                duration: 5000,
              });
            }
          }, 500);
        }

        return result;
      } catch (error) {
        console.error("Error awarding XP:", error);
        return null;
      } finally {
        setAwarding(false);
      }
    },
    [user, awarding]
  );

  return {
    awardXP,
    awarding,
  };
}

// XP Award Amounts (Constants)
export const XP_AMOUNTS = {
  MOOD_LOG: 10,
  JOURNAL_ENTRY: 25,
  BREATHING_EXERCISE: 15,
  DAILY_CHECKIN: 20,
  REWARD_WHEEL: 5,
  AI_CHAT_MESSAGE: 5,
  COMMUNITY_ANSWER: 50,
  STORY_SHARE: 100,
  BADGE_UNLOCK: 0, // Handled by badge system
  CHALLENGE_COMPLETE: 0, // Handled by challenge system
} as const;
