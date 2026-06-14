import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { aiService } from "@/lib/ai-services";
import { motion } from "framer-motion";

interface AIAffirmationWidgetProps {
  moodHistory?: Array<{ mood: string; note?: string; created_at: string }>;
  className?: string;
}

export function AIAffirmationWidget({ moodHistory, className = "" }: AIAffirmationWidgetProps) {
  const [affirmation, setAffirmation] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const generateAffirmation = async () => {
    setLoading(true);
    try {
      const result = await aiService.generatePersonalizedAffirmation(moodHistory);
      setAffirmation(result);
    } catch (error) {
      console.error('Failed to generate affirmation:', error);
      setAffirmation("You are worthy of peace, love, and happiness.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateAffirmation();
  }, []);

  return (
    <Card className={`p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 relative overflow-hidden ${className}`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />

      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display font-bold text-lg">AI Affirmation</h3>
        </div>
        <Button
          size="icon"
          variant="ghost"
          onClick={generateAffirmation}
          disabled={loading}
          className="rounded-full"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="relative">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <motion.p
            key={affirmation}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-medium text-foreground leading-relaxed"
          >
            "{affirmation}"
          </motion.p>
        )}
      </div>
    </Card>
  );
}
