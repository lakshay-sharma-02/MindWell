import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Loader2, Lightbulb } from "lucide-react";
import { aiService } from "@/lib/ai-services";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export function AICopingStrategies() {
  const [situation, setSituation] = useState("");
  const [strategies, setStrategies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const generateStrategies = async () => {
    if (!situation.trim() || loading) return;

    setLoading(true);
    try {
      const results = await aiService.generateCopingStrategies(situation);
      setStrategies(results);
    } catch (error) {
      console.error('Failed to generate coping strategies:', error);
      setStrategies([
        'Practice deep breathing: inhale for 4, hold for 7, exhale for 8',
        'Try the 5-4-3-2-1 grounding technique',
        'Take a short walk or stretch',
        'Write your thoughts in a journal',
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      generateStrategies();
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Lightbulb className="w-5 h-5 text-primary" />
        </div>
        <h3 className="font-display font-bold text-lg">AI Coping Strategies</h3>
        <Badge variant="secondary" className="text-xs">Personalized</Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Describe what you're experiencing, and I'll suggest evidence-based coping strategies.
      </p>

      <div className="flex gap-2 mb-6">
        <Input
          value={situation}
          onChange={(e) => setSituation(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="e.g., feeling anxious about work presentation"
          disabled={loading}
          className="flex-1"
        />
        <Button
          onClick={generateStrategies}
          disabled={!situation.trim() || loading}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </>
          )}
        </Button>
      </div>

      <AnimatePresence mode="popLayout">
        {strategies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">
              Try these strategies:
            </h4>
            {strategies.map((strategy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-4 bg-background rounded-lg border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                  {index + 1}
                </div>
                <p className="text-sm flex-1">{strategy}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
