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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
                <motion.div
                    key={currentStep} // Key changes to trigger re-animation on step change
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: -10 }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                    }}
                    className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden"
                >
                    {/* Progress Bar */}
                    <div className="h-1.5 bg-secondary w-full">
                        <motion.div
                            className="h-full bg-primary"
                            initial={{ width: `${(currentStep / steps.length) * 100}%` }}
                            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>

                    <div className="p-8 text-center space-y-6">
                        <div className="flex justify-end">
                            <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground hover:text-foreground">
                                Skip Tour
                            </Button>
                        </div>

                        <div className="space-y-6 min-h-[220px] flex flex-col justify-center">
                            <div className="flex justify-center">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
                                    transition={{ delay: 0.2, duration: 0.5 }}
                                    className="p-4 bg-secondary/30 rounded-full"
                                >
                                    {steps[currentStep].icon}
                                </motion.div>
                            </div>

                            <div>
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-2xl font-display font-bold text-foreground mb-3"
                                >
                                    {steps[currentStep].title}
                                </motion.h2>
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-muted-foreground leading-relaxed"
                                >
                                    {steps[currentStep].description}
                                </motion.p>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center justify-between">
                            <div className="flex gap-1">
                                {steps.map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`w-2 h-2 rounded-full transition-colors duration-300 ${idx === currentStep ? "bg-primary" : "bg-border"}`}
                                    />
                                ))}
                            </div>

                            <Button onClick={handleNext} className="gap-2 group">
                                {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
