import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    X,
    ArrowRight,
    LayoutDashboard,
    PenTool,
    Calendar,
    Users
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface FeatureTourProps {
    isOpen: boolean;
    onComplete: () => void;
    onSkip: () => void;
}

const steps = [
    {
        title: "Welcome to MindWell!",
        description: "Your personal sanctuary for mental wellness. Let us show you around your new possibilities.",
        icon: <div className="text-4xl">👋</div>,
        path: "/"
    },
    {
        title: "Your Dashboard",
        description: "Track your mood, get daily insights, and see personalized content just for you.",
        icon: <LayoutDashboard className="w-10 h-10 text-primary" />,
        path: "/dashboard"
    },
    {
        title: "Wellness Tools",
        description: "Discover our Gratitude Journal, Mood Tracker, and other tools designed to support your journey.",
        icon: <PenTool className="w-10 h-10 text-amber-500" />,
        path: "/tools"
    },
    {
        title: "Easy Booking",
        description: "Schedule sessions with our experts easily. Choose between virtual or in-person visits.",
        icon: <Calendar className="w-10 h-10 text-blue-500" />,
        path: "/book"
    },
    {
        title: "Community",
        description: "You're not alone. Join our supportive community to share and heal together.",
        icon: <Users className="w-10 h-10 text-purple-500" />,
        path: "/community"
    }
];

export function FeatureTour({ isOpen, onComplete, onSkip }: FeatureTourProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (isOpen) {
            // Navigate to the relevant page for the step, but give time for state to settle
            const step = steps[currentStep];
            if (step.path && window.location.pathname !== step.path) {
                navigate(step.path);
            }
        }
    }, [currentStep, isOpen, navigate]);

    if (!isOpen) return null;

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    return (

        <AnimatePresence mode="wait">
            <motion.div
                key="tour-card"
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-[100] w-auto md:w-full md:max-w-sm"
            >
                <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
                    {/* Progress Bar */}
                    <div className="h-1 bg-secondary w-full">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: `${(currentStep / steps.length) * 100}%` }}
                            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>

                    <div className="p-6 relative">
                        <button
                            onClick={onSkip}
                            className="absolute top-4 right-4 text-muted-foreground/50 hover:text-foreground transition-colors"
                            aria-label="Close tour"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-primary/10 rounded-xl">
                                        {steps[currentStep].icon}
                                    </div>
                                    <h2 className="text-lg font-bold font-display leading-tight">
                                        {steps[currentStep].title}
                                    </h2>
                                </div>

                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {steps[currentStep].description}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="pt-6 flex items-center justify-between mt-2">
                            <div className="flex gap-1.5">
                                {steps.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${idx === currentStep ? "bg-primary" : "bg-muted"}`}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-2">
                                {currentStep > 0 && (
                                    <Button variant="ghost" size="sm" onClick={() => setCurrentStep(prev => prev - 1)} className="text-xs h-8">
                                        Back
                                    </Button>
                                )}
                                <Button onClick={handleNext} size="sm" className="gap-2 h-8 text-xs font-semibold shadow-lg shadow-primary/20">
                                    {currentStep === steps.length - 1 ? "Finish" : "Next"}
                                    <ArrowRight className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
