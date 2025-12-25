import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, CheckCircle, Heart, Sparkles } from "lucide-react";
import { quizQuestions, getQuizResult } from "@/data/quizQuestions";
import { Confetti } from "@/components/effects/Confetti";

const Quiz = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const question = quizQuestions[currentQuestion];

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setIsComplete(true);
      setShowConfetti(true);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1] ?? null);
      setAnswers(answers.slice(0, -1));
    }
  };

  const totalScore = answers.reduce((sum, val) => sum + val, 0);
  const result = isComplete ? getQuizResult(totalScore) : null;

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
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
                  >
                    <Heart className="w-4 h-4" />
                    Mental Wellness Check-In
                  </motion.div>
                  <h1 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-2">
                    How Are You Really Feeling?
                  </h1>
                  <p className="text-muted-foreground">
                    Answer honestly - there are no right or wrong answers.
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                    <span>{Math.round(progress)}% complete</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>

                {/* Question Card */}
                <motion.div
                  key={currentQuestion}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card border border-border rounded-3xl p-6 md:p-8 shadow-soft mb-8"
                >
                  <h2 className="font-display text-xl md:text-2xl font-medium text-foreground mb-6">
                    {question.question}
                  </h2>

                  <div className="space-y-3">
                    {question.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedOption(option.value)}
                        className={`w-full p-4 rounded-xl text-left transition-all ${
                          selectedOption === option.value
                            ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-card"
                            : "bg-muted hover:bg-muted/80 text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <span
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              selectedOption === option.value
                                ? "border-primary-foreground bg-primary-foreground/20"
                                : "border-muted-foreground/40"
                            }`}
                          >
                            {selectedOption === option.value && (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </span>
                          {option.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </motion.div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentQuestion === 0}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                  <Button
                    variant="hero"
                    onClick={handleNext}
                    disabled={selectedOption === null}
                    className="gap-2"
                  >
                    {currentQuestion === quizQuestions.length - 1 ? "Get Results" : "Next"}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
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
                      className={`w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center ${
                        result?.level === "low"
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
