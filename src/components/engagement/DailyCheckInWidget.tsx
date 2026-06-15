import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Calendar, Bell, Clock } from "lucide-react";
import { DailyCheckInFlow } from "./DailyCheckInFlow";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function DailyCheckInWidget() {
  const { user } = useAuth();
  const [showMorning, setShowMorning] = useState(false);
  const [showEvening, setShowEvening] = useState(false);
  const [hasMorningCheckIn, setHasMorningCheckIn] = useState(false);
  const [hasEveningCheckIn, setHasEveningCheckIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkTodayStatus();
      scheduleNotifications();
    }
  }, [user]);

  const checkTodayStatus = async () => {
    if (!user) return;

    try {
      // Check morning
      const { data: morningData } = await supabase.rpc('has_completed_checkin_today', {
        p_user_id: user.id,
        p_checkin_type: 'morning',
      });

      // Check evening
      const { data: eveningData } = await supabase.rpc('has_completed_checkin_today', {
        p_user_id: user.id,
        p_checkin_type: 'evening',
      });

      setHasMorningCheckIn(morningData || false);
      setHasEveningCheckIn(eveningData || false);
    } catch (error) {
      console.error('Error checking check-in status:', error);
    } finally {
      setLoading(false);
    }
  };

  const scheduleNotifications = () => {
    // Get user's preferred times from profile
    const now = new Date();
    const currentHour = now.getHours();

    // Auto-prompt morning check-in between 6am-11am if not done
    if (currentHour >= 6 && currentHour < 11 && !hasMorningCheckIn) {
      setTimeout(() => {
        if (!hasMorningCheckIn) {
          setShowMorning(true);
        }
      }, 5000); // Show after 5 seconds on dashboard
    }

    // Auto-prompt evening check-in between 7pm-11pm if not done
    if (currentHour >= 19 && currentHour < 23 && !hasEveningCheckIn) {
      setTimeout(() => {
        if (!hasEveningCheckIn) {
          setShowEvening(true);
        }
      }, 5000);
    }
  };

  if (loading) return null;

  const bothComplete = hasMorningCheckIn && hasEveningCheckIn;

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/5 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />

        <div className="relative space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-lg">Daily Check-Ins</h3>
            </div>
            <Bell className="w-4 h-4 text-muted-foreground" />
          </div>

          {bothComplete ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-4"
            >
              <div className="text-4xl mb-2">🎉</div>
              <p className="font-semibold text-lg mb-1">All Done for Today!</p>
              <p className="text-sm text-muted-foreground">
                You've completed both check-ins. Great job! 💪
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {/* Morning Check-in */}
              <div
                className={`p-4 rounded-lg border-2 transition-all ${
                  hasMorningCheckIn
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-amber-500/10 border-amber-500/30 hover:border-amber-500/50 cursor-pointer'
                }`}
                onClick={() => !hasMorningCheckIn && setShowMorning(true)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🌅</div>
                    <div>
                      <p className="font-semibold">Morning Check-In</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Best: 6am - 11am
                      </p>
                    </div>
                  </div>
                  {hasMorningCheckIn ? (
                    <div className="text-green-500 font-bold">✓</div>
                  ) : (
                    <Button size="sm" variant="outline">
                      Start
                    </Button>
                  )}
                </div>
              </div>

              {/* Evening Check-in */}
              <div
                className={`p-4 rounded-lg border-2 transition-all ${
                  hasEveningCheckIn
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-purple-500/10 border-purple-500/30 hover:border-purple-500/50 cursor-pointer'
                }`}
                onClick={() => !hasEveningCheckIn && setShowEvening(true)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🌙</div>
                    <div>
                      <p className="font-semibold">Evening Reflection</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Best: 7pm - 11pm
                      </p>
                    </div>
                  </div>
                  {hasEveningCheckIn ? (
                    <div className="text-green-500 font-bold">✓</div>
                  ) : (
                    <Button size="sm" variant="outline">
                      Start
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {!bothComplete && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground text-center">
                💡 Complete both check-ins to maintain your streak
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Check-in Modals */}
      <DailyCheckInFlow
        type="morning"
        isOpen={showMorning}
        onClose={() => setShowMorning(false)}
        onComplete={() => {
          setHasMorningCheckIn(true);
          setShowMorning(false);
        }}
      />

      <DailyCheckInFlow
        type="evening"
        isOpen={showEvening}
        onClose={() => setShowEvening(false)}
        onComplete={() => {
          setHasEveningCheckIn(true);
          setShowEvening(false);
        }}
      />
    </>
  );
}
