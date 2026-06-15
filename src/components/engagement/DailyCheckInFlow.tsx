import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from "framer-motion";
import { Sunrise, Moon, Target, Heart, Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { aiService } from "@/lib/ai-services";

interface CheckInData {
  // Morning
  sleepQuality?: string;
  intention?: string;
  mood?: string;

  // Evening
  dayRating?: number;
  whatWentWell?: string;
  tomorrowFocus?: string;
}

interface DailyCheckInFlowProps {
  type: 'morning' | 'evening';
  onComplete?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function DailyCheckInFlow({ type, onComplete, isOpen, onClose }: DailyCheckInFlowProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<CheckInData>({});
  const [loading, setLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState<string>("");

  const totalSteps = 3;
  const isMorning = type === 'morning';

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setLoading(true);

    try {
      // Generate AI insight
      const prompt = isMorning
        ? `User's morning check-in: Sleep quality: ${data.sleepQuality}, Mood: ${data.mood}, Intention: ${data.intention}. Give a brief encouraging insight (1-2 sentences).`
        : `User's evening check-in: Day rating: ${data.dayRating}/10, What went well: ${data.whatWentWell}, Tomorrow's focus: ${data.tomorrowFocus}. Give a brief reflective insight (1-2 sentences).`;

      const insight = await aiService.generateText(prompt);
      setAiInsight(insight);

      // Save to database
      const { error } = await supabase.from('daily_checkins').insert({
        user_id: user.id,
        checkin_type: type,
        sleep_quality: data.sleepQuality,
        intention: data.intention,
        mood: data.mood,
        day_rating: data.dayRating,
        what_went_well: data.whatWentWell,
        tomorrow_focus: data.tomorrowFocus,
        ai_insight: insight,
      });

      if (error) throw error;

      // Update streak
      const currentStreak = parseInt(localStorage.getItem(`streak_${user.id}`) || "0");
      const lastCheckIn = localStorage.getItem(`last_checkin_${user.id}`);
      const today = new Date().toDateString();

      if (lastCheckIn !== today) {
        const newStreak = currentStreak + 1;
        localStorage.setItem(`streak_${user.id}`, newStreak.toString());
        localStorage.setItem(`last_checkin_${user.id}`, today);

        const longestStreak = parseInt(localStorage.getItem(`longest_streak_${user.id}`) || "0");
        if (newStreak > longestStreak) {
          localStorage.setItem(`longest_streak_${user.id}`, newStreak.toString());
        }
      }

      setStep(4); // Show completion screen

      // Store memory insights for AI companion
      if (data.intention || data.whatWentWell) {
        const memoryKey = isMorning ? 'daily_intention' : 'daily_reflection';
        const memoryValue = isMorning ? data.intention : data.whatWentWell;

        await supabase.from('companion_memory').upsert({
          user_id: user.id,
          memory_type: 'pattern',
          memory_key: memoryKey,
          memory_value: memoryValue || '',
          last_referenced_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,memory_key'
        });
      }

      setTimeout(() => {
        onComplete?.();
        onClose();
      }, 3000);

    } catch (error) {
      console.error('Error saving check-in:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="max-w-lg w-full"
        >
          <Card className="p-8 relative overflow-hidden">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex p-4 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full mb-4"
              >
                {isMorning ? (
                  <Sunrise className="w-8 h-8 text-primary" />
                ) : (
                  <Moon className="w-8 h-8 text-purple-500" />
                )}
              </motion.div>
              <h2 className="text-2xl font-display font-bold mb-2">
                {isMorning ? 'Morning Check-In' : 'Evening Reflection'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {step < 4 ? `Step ${step} of ${totalSteps}` : 'Complete! 🎉'}
              </p>
            </div>

            {/* Progress Bar */}
            {step < 4 && (
              <div className="mb-8">
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / totalSteps) * 100}%` }}
                    className="h-full bg-gradient-to-r from-primary to-purple-600"
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            )}

            {/* Steps */}
            <AnimatePresence mode="wait">
              {/* Morning Steps */}
              {isMorning && step === 1 && (
                <motion.div
                  key="morning-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Label htmlFor="sleep">How did you sleep last night?</Label>
                  <RadioGroup
                    value={data.sleepQuality}
                    onValueChange={(val) => setData({ ...data, sleepQuality: val })}
                  >
                    {['😴 Great', '😊 Good', '😐 Okay', '😔 Poor', '😫 Terrible'].map((option) => (
                      <div key={option} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="cursor-pointer flex-1">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </motion.div>
              )}

              {isMorning && step === 2 && (
                <motion.div
                  key="morning-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Label htmlFor="intention">What's your intention for today?</Label>
                  <Textarea
                    id="intention"
                    value={data.intention}
                    onChange={(e) => setData({ ...data, intention: e.target.value })}
                    placeholder="I intend to..."
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Keep it simple and achievable
                  </p>
                </motion.div>
              )}

              {isMorning && step === 3 && (
                <motion.div
                  key="morning-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Label>How are you feeling right now?</Label>
                  <RadioGroup
                    value={data.mood}
                    onValueChange={(val) => setData({ ...data, mood: val })}
                  >
                    {['😊 Happy', '😌 Calm', '😐 Neutral', '😟 Anxious', '😢 Sad', '😤 Angry'].map((option) => (
                      <div key={option} className="flex items-center space-x-2 p-3 rounded-lg hover:bg-secondary/50 cursor-pointer">
                        <RadioGroupItem value={option} id={option} />
                        <Label htmlFor={option} className="cursor-pointer flex-1">{option}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </motion.div>
              )}

              {/* Evening Steps */}
              {!isMorning && step === 1 && (
                <motion.div
                  key="evening-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Label htmlFor="rating">How was your day overall? (1-10)</Label>
                  <div className="space-y-4">
                    <Input
                      id="rating"
                      type="range"
                      min="1"
                      max="10"
                      value={data.dayRating || 5}
                      onChange={(e) => setData({ ...data, dayRating: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <div className="text-center">
                      <span className="text-4xl font-bold text-primary">{data.dayRating || 5}</span>
                      <span className="text-muted-foreground">/10</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {!isMorning && step === 2 && (
                <motion.div
                  key="evening-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Label htmlFor="wellbeing">What went well today?</Label>
                  <Textarea
                    id="wellbeing"
                    value={data.whatWentWell}
                    onChange={(e) => setData({ ...data, whatWentWell: e.target.value })}
                    placeholder="Today, I'm grateful for..."
                    className="min-h-[120px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    💡 Even small wins matter!
                  </p>
                </motion.div>
              )}

              {!isMorning && step === 3 && (
                <motion.div
                  key="evening-3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Label htmlFor="tomorrow">What's one thing you'll focus on tomorrow?</Label>
                  <Textarea
                    id="tomorrow"
                    value={data.tomorrowFocus}
                    onChange={(e) => setData({ ...data, tomorrowFocus: e.target.value })}
                    placeholder="Tomorrow, I will..."
                    className="min-h-[120px]"
                  />
                </motion.div>
              )}

              {/* Completion Screen */}
              {step === 4 && (
                <motion.div
                  key="complete"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-8"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }}
                    className="inline-flex p-6 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-full"
                  >
                    <CheckCircle2 className="w-16 h-16 text-green-500" />
                  </motion.div>

                  <div>
                    <h3 className="text-2xl font-display font-bold mb-2">
                      Check-in Complete! 🎉
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Your streak has been updated
                    </p>

                    {aiInsight && (
                      <Card className="p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
                        <div className="flex items-start gap-3">
                          <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-left">{aiInsight}</p>
                        </div>
                      </Card>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            {step < 4 && (
              <div className="flex gap-3 mt-8">
                {step > 1 && (
                  <Button variant="outline" onClick={handleBack} className="flex-1">
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  disabled={loading || !isStepValid()}
                  className="flex-1 bg-gradient-to-r from-primary to-purple-600"
                >
                  {loading ? 'Saving...' : step === totalSteps ? 'Complete' : 'Next'}
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  function isStepValid(): boolean {
    if (isMorning) {
      if (step === 1) return !!data.sleepQuality;
      if (step === 2) return !!data.intention?.trim();
      if (step === 3) return !!data.mood;
    } else {
      if (step === 1) return !!data.dayRating;
      if (step === 2) return !!data.whatWentWell?.trim();
      if (step === 3) return !!data.tomorrowFocus?.trim();
    }
    return true;
  }
}
