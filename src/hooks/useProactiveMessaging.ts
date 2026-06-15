import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to generate proactive messages for inactive users
 * Runs periodically to check user activity patterns
 */
export function useProactiveMessaging() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkAndGenerateMessages = async () => {
      try {
        // Get user's last active time
        const { data: profile } = await supabase
          .from('profiles')
          .select('last_active_at, companion_name, checkin_notifications')
          .eq('id', user.id)
          .single();

        if (!profile || !profile.checkin_notifications) return;

        const lastActive = profile.last_active_at ? new Date(profile.last_active_at) : new Date();
        const hoursSinceActive = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);

        // Check if there's already an undelivered message
        const { data: existingMessages } = await supabase
          .from('proactive_messages')
          .select('id')
          .eq('user_id', user.id)
          .eq('delivered', false)
          .limit(1);

        if (existingMessages && existingMessages.length > 0) {
          // Already has a pending message
          return;
        }

        // Generate proactive messages based on inactivity
        if (hoursSinceActive >= 72) {
          // 3+ days inactive
          await supabase.from('proactive_messages').insert({
            user_id: user.id,
            message: `Hey! I noticed you've been quiet for a few days. Everything okay? I'm here if you want to talk. 💙`,
            message_type: 'concern',
            priority: 8,
          });
        } else if (hoursSinceActive >= 24) {
          // 1+ day inactive
          await supabase.from('proactive_messages').insert({
            user_id: user.id,
            message: `Hi there! Just checking in. How have you been? 😊`,
            message_type: 'check_in',
            priority: 5,
          });
        }

        // Check streak and celebrate milestones
        const currentStreak = parseInt(localStorage.getItem(`streak_${user.id}`) || '0');
        const lastCelebrated = parseInt(localStorage.getItem(`last_celebrated_${user.id}`) || '0');

        if (currentStreak > 0 && currentStreak !== lastCelebrated) {
          const milestones = [7, 14, 30, 50, 100, 365];
          if (milestones.includes(currentStreak)) {
            await supabase.from('proactive_messages').insert({
              user_id: user.id,
              message: `🎉 Amazing! You've hit a ${currentStreak}-day streak! Your dedication to mental wellness is inspiring. Keep it up! 💪`,
              message_type: 'celebration',
              priority: 9,
            });
            localStorage.setItem(`last_celebrated_${user.id}`, currentStreak.toString());
          }
        }

      } catch (error) {
        console.error('Error generating proactive messages:', error);
      }
    };

    // Check immediately
    checkAndGenerateMessages();

    // Check every 6 hours
    const interval = setInterval(checkAndGenerateMessages, 6 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);
}
