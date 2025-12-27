import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { quizQuestions, getQuizResult } from "@/data/quizQuestions";

export interface QuizResultValues {
    score: number;
    level: string;
    title: string;
    description: string;
    report: Array<{ question: string; answer: string }>;
    recommendations: string[];
    cta: { text: string; link: string };
}

interface QuizFlowProps {
    onComplete: (result: QuizResultValues) => void;
    onCancel?: () => void;
}

export const QuizFlow = ({ onComplete, onCancel }: QuizFlowProps) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

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
            // Calculate results
            const totalScore = newAnswers.reduce((sum, val) => sum + val, 0);
            const resultData = getQuizResult(totalScore);

            // Generate detailed report
            const report = newAnswers.map((score, index) => {
                const q = quizQuestions[index];
                // Find the selected option text
                const selectedOpt = q.options.find(opt => opt.value === score);
                return {
                    question: q.question,
                    answer: selectedOpt ? selectedOpt.text : "Unknown"
                };
            });

            onComplete({
                score: totalScore,
                level: resultData.level,
                title: resultData.title,
                description: resultData.description,
                report,
                recommendations: resultData.recommendations,
                cta: resultData.cta,
            });
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            // Restore previous selection
            setSelectedOption(answers[currentQuestion - 1] ?? null);
            setAnswers(answers.slice(0, -1));
        } else if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Question {currentQuestion + 1} of {quizQuestions.length}</span>
                    <span>{Math.round(progress)}%</span>
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

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    <h2 className="font-display text-xl md:text-2xl font-medium text-foreground">
                        {question.question}
                    </h2>

                    <div className="space-y-3">
                        {question.options.map((option, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedOption(option.value)}
                                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${selectedOption === option.value
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-transparent bg-muted/50 hover:bg-muted text-foreground"
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedOption === option.value ? "border-primary" : "border-muted-foreground/30"
                                        }`}>
                                        {selectedOption === option.value && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                                    </div>
                                    {option.text}
                                </div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-between mt-8">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="gap-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {currentQuestion === 0 ? "Cancel" : "Back"}
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={selectedOption === null}
                    className="gap-2"
                >
                    {currentQuestion === quizQuestions.length - 1 ? "Finish" : "Next"}
                    <ArrowRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
};
