import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle, Heart, Sparkles } from "lucide-react";
import { Confetti } from "@/components/effects/Confetti";
import { QuizFlow, QuizResultValues } from "@/components/quiz/QuizFlow";

const Quiz = () => {
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [resultData, setResultData] = useState<QuizResultValues | null>(null);

  const result = resultData;

  return (
    <Layout>
      <SEOHead
        title="Mental Wellness Assessment"
        description="Take our free mental wellness self-assessment quiz to understand your emotional well-being and receive personalized recommendations."
        keywords="mental health quiz, wellness assessment, anxiety test, depression screening, self-assessment"
      />

      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />

      <section className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-background via-secondary/20 to-background py-12 md:py-20">
        <div className="container-narrow">
          <AnimatePresence mode="wait">
            {!isComplete ? (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <QuizFlow
                  onComplete={(data) => {
                    // We need to reconstruct the result object expected by the existing UI or update the UI
                    // The existing UI uses 'getQuizResult(totalScore)' which returns { level, title, description, ... }
                    // Our QuizFlow returns this same data structure in 'data'
                    // So we just need to set state to show results
                    setIsComplete(true);
                    setShowConfetti(true);
                    setResultData(data); // We need a new state for this or just rely on 'result' variable if refactored enough
                  }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                {/* Result Card */}
                <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-soft mb-8 relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 rounded-full blur-3xl" />
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl" />

                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", delay: 0.2 }}
                      className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center ${result?.level === "low"
                        ? "bg-green-500/10 text-green-500"
                        : result?.level === "moderate"
                          ? "bg-yellow-500/10 text-yellow-500"
                          : "bg-primary/10 text-primary"
                        }`}
                    >
                      <Sparkles className="w-10 h-10" />
                    </motion.div>

                    <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
                      {result?.title}
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-8">
                      {result?.description}
                    </p>

                    {/* Recommendations */}
                    <div className="bg-muted/50 rounded-2xl p-6 mb-8 text-left max-w-md mx-auto">
                      <h3 className="font-semibold text-foreground mb-4">
                        Our Recommendations:
                      </h3>
                      <ul className="space-y-3">
                        {result?.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-3 text-sm">
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button variant="hero" size="lg" asChild>
                        <Link to={result?.cta.link || "/resources"}>
                          {result?.cta.text}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="lg" asChild>
                        <Link to="/resources">View All Resources</Link>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Disclaimer */}
                <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                  This assessment is for informational purposes only and is not a
                  substitute for professional diagnosis or treatment. If you're
                  experiencing a mental health crisis, please contact a healthcare
                  provider or crisis helpline immediately.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </Layout>
  );
};

export default Quiz;
