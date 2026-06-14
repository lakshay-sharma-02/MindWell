import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, AlertTriangle, Heart, Loader2 } from "lucide-react";
import { aiService, AIInsight } from "@/lib/ai-services";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

interface AIMoodInsightsProps {
  moodEntries: Array<{
    mood: string;
    note?: string;
    created_at: string;
  }>;
}

const iconMap = {
  pattern: TrendingUp,
  suggestion: Sparkles,
  warning: AlertTriangle,
  celebration: Heart,
};

const severityColors = {
  low: "bg-blue-500/10 text-blue-600 border-blue-200",
  medium: "bg-amber-500/10 text-amber-600 border-amber-200",
  high: "bg-red-500/10 text-red-600 border-red-200",
};

export function AIMoodInsights({ moodEntries }: AIMoodInsightsProps) {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzePatterns = async () => {
    setLoading(true);
    setError(null);

    try {
      const results = await aiService.analyzeMoodPattern(moodEntries);
      setInsights(results);
    } catch (err) {
      console.error('Failed to analyze mood patterns:', err);
      setError('Unable to generate insights right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (moodEntries.length >= 3) {
      analyzePatterns();
    }
  }, []);

  if (moodEntries.length < 3) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">AI Insights Coming Soon</h3>
            <p className="text-sm text-muted-foreground">
              Track your mood for at least 3 days to unlock personalized AI-powered insights about your emotional patterns.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="p-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Analyzing your mood patterns...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 bg-destructive/5 border-destructive/20">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-2">Analysis Unavailable</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button size="sm" variant="outline" onClick={analyzePatterns}>
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg">AI Insights</h3>
          <Badge variant="secondary" className="text-xs">Powered by AI</Badge>
        </div>
        <Button size="sm" variant="ghost" onClick={analyzePatterns} disabled={loading}>
          Refresh
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {insights.map((insight, index) => {
          const Icon = iconMap[insight.type];
          const severityColor = severityColors[insight.severity || 'low'];

          return (
            <motion.div
              key={`${insight.title}-${index}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-5 border-2 ${severityColor} transition-all hover:shadow-md`}>
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${severityColor}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold mb-2">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      {insight.description}
                    </p>
                    {insight.actionable && (
                      <div className="flex items-start gap-2 p-3 bg-background/50 rounded-lg border border-border/50">
                        <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium">{insight.actionable}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
