import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, TrendingDown, Minus, Sparkles, Download, Loader2, Target, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { aiService, MoodEntry, JournalEntry } from "@/lib/ai-services";
import { Progress } from "@/components/ui/progress";

interface WeeklyReport {
  summary: string;
  moodTrend: 'improving' | 'stable' | 'declining';
  highlights: string[];
  concerns: string[];
  recommendations: string[];
  nextWeekGoals: string[];
  engagementScore: number;
}

interface AIWeeklyReportProps {
  moodLogs: MoodEntry[];
  journalEntries: JournalEntry[];
  streakDays: number;
  toolsUsed: string[];
}

export function AIWeeklyReport({
  moodLogs,
  journalEntries,
  streakDays,
  toolsUsed,
}: AIWeeklyReportProps) {
  const [report, setReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [weekStart] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  });

  const generateReport = async () => {
    setLoading(true);
    try {
      const weeklyData = {
        moodLogs: moodLogs.slice(0, 7),
        journalEntries: journalEntries.slice(0, 7),
        streakDays,
        toolsUsed,
        weekStartDate: weekStart,
      };

      const result = await aiService.generateWeeklyReport(weeklyData);
      setReport(result);
    } catch (error) {
      console.error('Failed to generate weekly report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return TrendingUp;
      case 'declining': return TrendingDown;
      default: return Minus;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 dark:text-green-400';
      case 'declining': return 'text-orange-600 dark:text-orange-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-blue-600 dark:text-blue-400';
    if (score >= 40) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-500/10 via-primary/5 to-transparent border-purple-500/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Calendar className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Weekly Mental Health Report</h3>
            <p className="text-xs text-muted-foreground">AI-powered insights & progress</p>
          </div>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Sparkles className="w-3 h-3" />
          AI Generated
        </Badge>
      </div>

      {!report ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground mb-4">
            Get a comprehensive analysis of your mental health journey this week, including mood trends, achievements, and personalized recommendations.
          </p>
          <Button onClick={generateReport} disabled={loading} size="lg">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Weekly Report
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
          {/* Summary */}
          <div className="p-4 bg-background/50 rounded-xl">
            <p className="text-sm leading-relaxed">{report.summary}</p>
          </div>

          {/* Mood Trend & Engagement Score */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-background/50 rounded-xl text-center">
              <p className="text-xs text-muted-foreground mb-2">Mood Trend</p>
              <div className="flex items-center justify-center gap-2">
                {(() => {
                  const Icon = getTrendIcon(report.moodTrend);
                  return <Icon className={`w-5 h-5 ${getTrendColor(report.moodTrend)}`} />;
                })()}
                <span className={`text-lg font-bold capitalize ${getTrendColor(report.moodTrend)}`}>
                  {report.moodTrend}
                </span>
              </div>
            </div>

            <div className="p-4 bg-background/50 rounded-xl text-center">
              <p className="text-xs text-muted-foreground mb-2">Engagement</p>
              <div className={`text-2xl font-bold ${getScoreColor(report.engagementScore)}`}>
                {report.engagementScore}
              </div>
              <Progress value={report.engagementScore} className="h-1.5 mt-2" />
            </div>
          </div>

          {/* Highlights */}
          {report.highlights.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                This Week's Wins
              </h4>
              <div className="space-y-2">
                {report.highlights.map((highlight, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-start gap-2 p-3 bg-green-500/5 border border-green-500/20 rounded-lg text-sm"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <p>{highlight}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Concerns */}
          {report.concerns.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                Areas for Attention
              </h4>
              <div className="space-y-2">
                {report.concerns.map((concern, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-3 bg-orange-500/5 border border-orange-500/20 rounded-lg text-sm"
                  >
                    <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                    <p>{concern}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {report.recommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Recommended Actions
              </h4>
              <div className="space-y-2">
                {report.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-3 bg-primary/5 rounded-lg text-sm"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <p>{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Week Goals */}
          {report.nextWeekGoals.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" />
                Goals for Next Week
              </h4>
              <div className="space-y-2">
                {report.nextWeekGoals.map((goal, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 p-3 bg-purple-500/5 border border-purple-500/20 rounded-lg text-sm"
                  >
                    <Target className="w-4 h-4 text-purple-500 flex-shrink-0 mt-0.5" />
                    <p>{goal}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={generateReport} className="flex-1">
              <Sparkles className="w-4 h-4 mr-2" />
              Regenerate
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-2">
            Week of {weekStart} • Generated by AI
          </p>
        </motion.div>
      )}
    </Card>
  );
}
