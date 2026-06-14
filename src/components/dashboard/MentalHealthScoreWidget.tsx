import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface MentalHealthScore {
  overall: number;
  consistency: number;
  growth: number;
  engagement: number;
  insights: string[];
}

interface MentalHealthScoreProps {
  userId: string;
  moodLogs: number;
  journalEntries: number;
  daysActive: number;
  lastActiveDate: string;
}

export function MentalHealthScoreWidget({ userId, moodLogs, journalEntries, daysActive, lastActiveDate }: MentalHealthScoreProps) {
  const [score, setScore] = useState<MentalHealthScore | null>(null);
  const [loading, setLoading] = useState(false);

  const calculateScore = () => {
    setLoading(true);

    // Simulate calculation
    setTimeout(() => {
      const consistency = Math.min(100, (daysActive / 30) * 100);
      const growth = Math.min(100, ((moodLogs + journalEntries) / 50) * 100);
      const engagement = Math.min(100, (moodLogs / 30) * 100);
      const overall = Math.round((consistency + growth + engagement) / 3);

      const insights: string[] = [];

      if (consistency >= 80) {
        insights.push("Excellent consistency! You're building strong self-awareness habits.");
      } else if (consistency >= 50) {
        insights.push("Good progress. Try to check in daily for deeper insights.");
      } else {
        insights.push("Build momentum by checking in more regularly.");
      }

      if (growth >= 70) {
        insights.push("You're actively engaged in your mental health journey.");
      }

      if (moodLogs >= 7) {
        insights.push("Mood tracking unlocks powerful pattern recognition.");
      }

      setScore({
        overall,
        consistency: Math.round(consistency),
        growth: Math.round(growth),
        engagement: Math.round(engagement),
        insights,
      });
      setLoading(false);
    }, 1500);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-amber-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10 border-green-200";
    if (score >= 60) return "bg-blue-500/10 border-blue-200";
    if (score >= 40) return "bg-yellow-500/10 border-yellow-200";
    return "bg-amber-500/10 border-amber-200";
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Brain className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-display font-bold text-lg">Mental Health Score</h3>
          <p className="text-xs text-muted-foreground">Track your wellness journey progress</p>
        </div>
        <Badge variant="secondary" className="text-xs">New</Badge>
      </div>

      {!score ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">
            Calculate your mental health engagement score based on your activity, consistency, and growth.
          </p>
          <Button onClick={calculateScore} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculating...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Calculate Score
              </>
            )}
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Overall Score */}
          <div className={`p-6 rounded-2xl border-2 ${getScoreBg(score.overall)} text-center`}>
            <p className="text-sm font-medium text-muted-foreground mb-2">Overall Score</p>
            <div className={`text-5xl font-bold ${getScoreColor(score.overall)}`}>
              {score.overall}
            </div>
            <p className="text-xs text-muted-foreground mt-2">out of 100</p>
          </div>

          {/* Component Scores */}
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Consistency</span>
                <span className="text-sm font-bold">{score.consistency}%</span>
              </div>
              <Progress value={score.consistency} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Growth</span>
                <span className="text-sm font-bold">{score.growth}%</span>
              </div>
              <Progress value={score.growth} className="h-2" />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Engagement</span>
                <span className="text-sm font-bold">{score.engagement}%</span>
              </div>
              <Progress value={score.engagement} className="h-2" />
            </div>
          </div>

          {/* Insights */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-muted-foreground">Insights</h4>
            {score.insights.map((insight, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-3 bg-background rounded-lg border border-border/50"
              >
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={calculateScore}
            className="w-full"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Recalculate
          </Button>
        </motion.div>
      )}
    </Card>
  );
}
