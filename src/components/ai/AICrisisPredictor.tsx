import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown, Heart, PhoneCall, MessageCircle, Loader2, Shield, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { aiService, MoodEntry } from "@/lib/ai-services";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CrisisRisk {
  level: 'low' | 'moderate' | 'high' | 'critical';
  score: number;
  confidence: number;
  triggers: string[];
  predictedTimeframe: string;
  recommendations: string[];
  supportResources: {
    title: string;
    contact: string;
    description: string;
  }[];
}

interface AICrisisPredictorProps {
  moodHistory: MoodEntry[];
  userId: string;
}

export function AICrisisPredictor({ moodHistory, userId }: AICrisisPredictorProps) {
  const [analysis, setAnalysis] = useState<CrisisRisk | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastAnalyzed, setLastAnalyzed] = useState<Date | null>(null);

  useEffect(() => {
    // Auto-analyze if we have sufficient data and haven't analyzed recently
    const lastAnalysis = localStorage.getItem(`last_crisis_analysis_${userId}`);
    const shouldAutoAnalyze = moodHistory.length >= 7 &&
      (!lastAnalysis || Date.now() - new Date(lastAnalysis).getTime() > 24 * 60 * 60 * 1000);

    if (shouldAutoAnalyze) {
      analyzeCrisisRisk();
    } else if (lastAnalysis) {
      setLastAnalyzed(new Date(lastAnalysis));
    }
  }, [moodHistory.length]);

  const analyzeCrisisRisk = async () => {
    if (moodHistory.length < 7) {
      return;
    }

    setLoading(true);
    try {
      const risk = await aiService.predictCrisisRisk(moodHistory);
      setAnalysis(risk);
      setLastAnalyzed(new Date());
      localStorage.setItem(`last_crisis_analysis_${userId}`, new Date().toISOString());
    } catch (error) {
      console.error('Crisis prediction failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 dark:text-red-400';
      case 'high': return 'text-orange-600 dark:text-orange-400';
      case 'moderate': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-green-600 dark:text-green-400';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500/10 border-red-500/30';
      case 'high': return 'bg-orange-500/10 border-orange-500/30';
      case 'moderate': return 'bg-yellow-500/10 border-yellow-500/30';
      default: return 'bg-green-500/10 border-green-500/30';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return AlertTriangle;
      case 'moderate':
        return TrendingDown;
      default:
        return Shield;
    }
  };

  if (moodHistory.length < 7) {
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-bold text-lg mb-2">Crisis Prevention System</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Track moods for at least 7 days to unlock AI-powered early warning detection.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex-1 bg-secondary/50 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(moodHistory.length / 7) * 100}%` }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {moodHistory.length}/7
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${analysis ? getRiskBg(analysis.level) : 'bg-card'} border-2 transition-all duration-300`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${analysis ? getRiskBg(analysis.level) : 'bg-primary/10'}`}>
            {analysis ? (
              (() => {
                const Icon = getRiskIcon(analysis.level);
                return <Icon className={`w-5 h-5 ${getRiskColor(analysis.level)}`} />;
              })()
            ) : (
              <Shield className="w-5 h-5 text-primary" />
            )}
          </div>
          <div>
            <h3 className="font-display font-bold text-lg">Early Warning System</h3>
            <p className="text-xs text-muted-foreground">AI-powered crisis prediction</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-xs">
          {lastAnalyzed ? `Last: ${lastAnalyzed.toLocaleDateString()}` : 'New'}
        </Badge>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Analyzing patterns...</p>
        </div>
      ) : analysis ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={analysis.level}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Risk Level */}
            <div className="flex items-center justify-between p-4 bg-background/50 rounded-xl">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Current Risk Level</p>
                <p className={`text-2xl font-bold capitalize ${getRiskColor(analysis.level)}`}>
                  {analysis.level}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Confidence</p>
                <p className="text-2xl font-bold">{Math.round(analysis.confidence * 100)}%</p>
              </div>
            </div>

            {/* Critical Alert */}
            {(analysis.level === 'critical' || analysis.level === 'high') && (
              <Alert className="bg-red-500/10 border-red-500/30">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-sm">
                  We detected concerning patterns. Please consider reaching out to a mental health professional or crisis support immediately.
                </AlertDescription>
              </Alert>
            )}

            {/* Predicted Timeframe */}
            {analysis.predictedTimeframe && (
              <div className="flex items-center gap-2 p-3 bg-background/50 rounded-lg">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Risk Window</p>
                  <p className="text-sm font-medium">{analysis.predictedTimeframe}</p>
                </div>
              </div>
            )}

            {/* Triggers */}
            {analysis.triggers.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Identified Patterns</h4>
                <div className="space-y-2">
                  {analysis.triggers.map((trigger, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-background/50 rounded-lg text-sm">
                      <TrendingDown className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                      <p>{trigger}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2">Recommended Actions</h4>
                <div className="space-y-2">
                  {analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-background/50 rounded-lg text-sm">
                      <Heart className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Support Resources */}
            {analysis.supportResources.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <h4 className="text-sm font-semibold mb-3">Immediate Support</h4>
                <div className="space-y-2">
                  {analysis.supportResources.map((resource, idx) => (
                    <a
                      key={idx}
                      href={resource.contact.startsWith('http') ? resource.contact : `tel:${resource.contact}`}
                      className="flex items-center gap-3 p-3 bg-primary/5 hover:bg-primary/10 rounded-lg transition-colors group"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg">
                        {resource.contact.includes('988') || resource.contact.includes('tel') ? (
                          <PhoneCall className="w-4 h-4 text-primary" />
                        ) : (
                          <MessageCircle className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors">
                          {resource.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{resource.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={analyzeCrisisRisk}
              className="w-full mt-2"
            >
              <Shield className="w-4 h-4 mr-2" />
              Re-analyze
            </Button>
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground mb-4">
            Run a predictive analysis to identify potential risk patterns based on your mood history.
          </p>
          <Button onClick={analyzeCrisisRisk}>
            <Shield className="w-4 h-4 mr-2" />
            Analyze Risk
          </Button>
        </div>
      )}

      <div className="mt-4 pt-4 border-t text-xs text-muted-foreground text-center">
        This is an AI-powered early warning tool, not a diagnosis. If you're in crisis, call 988 immediately.
      </div>
    </Card>
  );
}
