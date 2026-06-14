import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { aiService } from "@/lib/ai-services";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AIJournalAnalysisProps {
  onAnalysisComplete?: (needsSupport: boolean) => void;
}

export function AIJournalAnalysis({ onAnalysisComplete }: AIJournalAnalysisProps) {
  const [entry, setEntry] = useState("");
  const [analysis, setAnalysis] = useState<{
    sentiment: string;
    themes: string[];
    suggestions: string[];
    needsSupport: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const analyzeEntry = async () => {
    if (!entry.trim() || loading) return;

    setLoading(true);
    try {
      const result = await aiService.analyzeJournalEntry(entry);
      setAnalysis(result);

      if (result.needsSupport) {
        onAnalysisComplete?.(true);
      }
    } catch (error) {
      console.error('Journal analysis failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const sentimentColors = {
    positive: "bg-green-500/10 text-green-600 border-green-200",
    neutral: "bg-blue-500/10 text-blue-600 border-blue-200",
    negative: "bg-amber-500/10 text-amber-600 border-amber-200",
    crisis: "bg-red-500/10 text-red-600 border-red-200",
  };

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-display font-bold text-lg">AI Journal Analysis</h3>
          <Badge variant="secondary" className="text-xs">Beta</Badge>
        </div>

        <Textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Write your thoughts here... The AI will help identify patterns and provide supportive suggestions."
          className="min-h-[150px] mb-4"
          disabled={loading}
        />

        <Button
          onClick={analyzeEntry}
          disabled={!entry.trim() || loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Analyze Entry
            </>
          )}
        </Button>
      </Card>

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {analysis.needsSupport && (
            <Alert className="bg-red-500/10 border-red-200">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-600">
                <strong>We're concerned about you.</strong> Please consider reaching out for professional support:
                <ul className="mt-2 space-y-1 text-sm">
                  <li>• 988 Suicide & Crisis Lifeline</li>
                  <li>• Text "HELLO" to 741741 (Crisis Text Line)</li>
                  <li>• Contact a mental health professional</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="font-semibold">Emotional Tone</h4>
              <Badge className={sentimentColors[analysis.sentiment as keyof typeof sentimentColors]}>
                {analysis.sentiment}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium mb-2 text-muted-foreground">Themes Identified</h5>
                <div className="flex flex-wrap gap-2">
                  {analysis.themes.map((theme, idx) => (
                    <Badge key={idx} variant="outline">
                      {theme}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-sm font-medium mb-3 text-muted-foreground">Supportive Suggestions</h5>
                <div className="space-y-2">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg border border-border/50"
                    >
                      <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <p className="text-sm">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
