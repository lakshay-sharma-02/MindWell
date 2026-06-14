import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Target, Sparkles, CheckCircle, TrendingUp, Plus, Loader2, Calendar, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Goal {
  id: string;
  title: string;
  description: string;
  category: 'daily' | 'weekly' | 'milestone';
  targetValue: number;
  currentValue: number;
  deadline: string;
  aiGenerated: boolean;
  completed: boolean;
}

interface AIGoalSetterProps {
  userId: string;
  moodData: {
    averageMood: string;
    consistency: number;
    recentPatterns: string[];
  };
}

export function AIGoalSetter({ userId, moodData }: AIGoalSetterProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [customGoal, setCustomGoal] = useState("");

  useEffect(() => {
    loadGoals();
  }, [userId]);

  const loadGoals = async () => {
    // For now, load from localStorage (can be moved to Supabase later)
    const stored = localStorage.getItem(`goals_${userId}`);
    if (stored) {
      setGoals(JSON.parse(stored));
    }
  };

  const saveGoals = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem(`goals_${userId}`, JSON.stringify(updatedGoals));
  };

  const generateAIGoals = async () => {
    setLoading(true);
    try {
      // Generate smart goals based on user's current state
      const aiGoals: Goal[] = [];

      // Daily goals based on consistency
      if (moodData.consistency < 50) {
        aiGoals.push({
          id: `goal_${Date.now()}_1`,
          title: "Build Daily Check-in Habit",
          description: "Log your mood at least 5 times this week",
          category: 'weekly',
          targetValue: 5,
          currentValue: 0,
          deadline: getWeekFromNow(),
          aiGenerated: true,
          completed: false,
        });
      }

      // Mood improvement goal
      if (moodData.averageMood === 'sad' || moodData.averageMood === 'anxious') {
        aiGoals.push({
          id: `goal_${Date.now()}_2`,
          title: "Try 3 Coping Strategies",
          description: "Use the AI coping strategies tool at least 3 times this week",
          category: 'weekly',
          targetValue: 3,
          currentValue: 0,
          deadline: getWeekFromNow(),
          aiGenerated: true,
          completed: false,
        });
      }

      // Engagement goal
      aiGoals.push({
        id: `goal_${Date.now()}_3`,
        title: "7-Day Wellness Streak",
        description: "Maintain a 7-day engagement streak",
        category: 'milestone',
        targetValue: 7,
        currentValue: 0,
        deadline: getWeekFromNow(),
        aiGenerated: true,
        completed: false,
      });

      // Journaling goal
      aiGoals.push({
        id: `goal_${Date.now()}_4`,
        title: "Express Through Writing",
        description: "Write 3 gratitude or journal entries this week",
        category: 'weekly',
        targetValue: 3,
        currentValue: 0,
        deadline: getWeekFromNow(),
        aiGenerated: true,
        completed: false,
      });

      // Self-care goal
      aiGoals.push({
        id: `goal_${Date.now()}_5`,
        title: "Practice Mindful Breathing",
        description: "Complete breathing exercises 5 times this week",
        category: 'weekly',
        targetValue: 5,
        currentValue: 0,
        deadline: getWeekFromNow(),
        aiGenerated: true,
        completed: false,
      });

      saveGoals([...goals, ...aiGoals]);
      toast.success(`${aiGoals.length} personalized goals created!`);
    } catch (error) {
      console.error('Failed to generate AI goals:', error);
      toast.error('Failed to generate goals');
    } finally {
      setLoading(false);
    }
  };

  const addCustomGoal = () => {
    if (!customGoal.trim()) return;

    const newGoal: Goal = {
      id: `goal_${Date.now()}_custom`,
      title: customGoal,
      description: "Custom goal",
      category: 'weekly',
      targetValue: 1,
      currentValue: 0,
      deadline: getWeekFromNow(),
      aiGenerated: false,
      completed: false,
    };

    saveGoals([...goals, newGoal]);
    setCustomGoal("");
    setShowAddCustom(false);
    toast.success('Goal added!');
  };

  const updateProgress = (goalId: string, increment: number) => {
    const updated = goals.map(g => {
      if (g.id === goalId) {
        const newValue = Math.min(g.currentValue + increment, g.targetValue);
        return {
          ...g,
          currentValue: newValue,
          completed: newValue >= g.targetValue,
        };
      }
      return g;
    });
    saveGoals(updated);

    const goal = updated.find(g => g.id === goalId);
    if (goal?.completed && !goals.find(g => g.id === goalId)?.completed) {
      toast.success('🎉 Goal completed!');
    }
  };

  const deleteGoal = (goalId: string) => {
    saveGoals(goals.filter(g => g.id !== goalId));
    toast.success('Goal removed');
  };

  const getWeekFromNow = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'daily': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'weekly': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'milestone': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
      default: return 'bg-primary/10 text-primary border-primary/20';
    }
  };

  const activeGoals = goals.filter(g => !g.completed);
  const completedGoals = goals.filter(g => g.completed);

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 via-purple-500/5 to-transparent border-primary/20">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Mental Health Goals</h3>
            <p className="text-xs text-muted-foreground">AI-powered personalized goals</p>
          </div>
        </div>
        {activeGoals.length > 0 && (
          <Badge variant="secondary">
            {activeGoals.length} Active
          </Badge>
        )}
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Let AI create personalized mental health goals based on your current patterns and needs.
          </p>
          <Button onClick={generateAIGoals} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Smart Goals
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                In Progress
              </h4>
              <AnimatePresence>
                {activeGoals.map((goal, idx) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 bg-background/50 rounded-xl border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-semibold text-sm">{goal.title}</h5>
                          {goal.aiGenerated && (
                            <Badge variant="outline" className="text-xs gap-1">
                              <Sparkles className="w-3 h-3" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{goal.description}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className={`${getCategoryColor(goal.category)} border text-xs`}>
                        {goal.category}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">
                          {goal.currentValue} / {goal.targetValue}
                        </span>
                      </div>
                      <Progress
                        value={(goal.currentValue / goal.targetValue) * 100}
                        className="h-2"
                      />
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateProgress(goal.id, 1)}
                          className="flex-1 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Log Progress
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteGoal(goal.id)}
                          className="text-xs text-muted-foreground"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Completed ({completedGoals.length})
              </h4>
              <div className="space-y-2">
                {completedGoals.slice(0, 3).map((goal) => (
                  <div
                    key={goal.id}
                    className="p-3 bg-green-500/5 border border-green-500/20 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium line-through opacity-60">
                        {goal.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Goal */}
          {showAddCustom ? (
            <div className="p-4 bg-secondary/20 rounded-xl border-2 border-dashed border-border">
              <Input
                placeholder="Enter your custom goal..."
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomGoal()}
                className="mb-2"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={addCustomGoal} className="flex-1">
                  Add Goal
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowAddCustom(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddCustom(true)}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Goal
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={generateAIGoals}
                disabled={loading}
                className="flex-1"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                More AI Goals
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
