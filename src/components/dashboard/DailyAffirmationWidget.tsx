import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Quote, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const AFFIRMATIONS = [
    "I am worthy of good things, and I attract positivity.",
    "Breathe. You are exactly where you need to be.",
    "I choose to be kind to myself today.",
    "My potential to succeed is infinite.",
    "I am stronger than my challenges.",
    "Peace begins with a conscious breath.",
    "I am allowed to take up space.",
    "My mind is calm, my heart is open.",
    "I trust the journey, even when I do not understand it.",
    "Today is a fresh start, and I embrace it."
];

export function DailyAffirmationWidget() {
    const [affirmation, setAffirmation] = useState("");
    const [claimed, setClaimed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        // Simple "daily" selection based on date, or random for now
        const today = new Date().getDate();
        const index = today % AFFIRMATIONS.length;
        setAffirmation(AFFIRMATIONS[index]);

        // Check local storage if already claimed today
        const lastClaimed = localStorage.getItem("last_affirmation_claim");
        if (lastClaimed === new Date().toDateString()) {
            setClaimed(true);
        }
    }, []);

    const handleClaim = () => {
        setClaimed(true);
        localStorage.setItem("last_affirmation_claim", new Date().toDateString());
        toast.success("Affirmation claimed! Keep shining.");
    };

    const handleRefresh = () => {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
        } while (AFFIRMATIONS[newIndex] === affirmation);

        setAffirmation(AFFIRMATIONS[newIndex]);
        setClaimed(false); // Reset claim for manual refresh
    };

    return (
        <Card
            className="relative overflow-hidden border-none shadow-lg bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 dark:from-violet-900/20 dark:to-fuchsia-900/20"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <CardContent className="relative p-6 md:p-8 flex flex-col items-center justify-center text-center min-h-[200px]">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-4"
                >
                    <div className="w-12 h-12 rounded-full bg-white/50 dark:bg-white/10 flex items-center justify-center shadow-sm backdrop-blur-sm">
                        <Quote className="w-5 h-5 text-primary/70" />
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.h3
                        key={affirmation}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.4 }}
                        className="text-xl md:text-2xl font-display font-bold text-foreground mb-2 max-w-lg leading-relaxed"
                    >
                        "{affirmation}"
                    </motion.h3>
                </AnimatePresence>

                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-6">Daily Affirmation</p>

                <div className="flex gap-3">
                    <Button
                        onClick={handleClaim}
                        disabled={claimed}
                        className={`
                            rounded-full transition-all duration-300
                            ${claimed
                                ? "bg-green-500/20 text-green-600 hover:bg-green-500/20 border-green-500/20 cursor-default"
                                : "bg-primary text-primary-foreground hover:shadow-lg hover:shadow-primary/25 btn-glow"}
                        `}
                        size="lg"
                    >
                        {claimed ? (
                            <>
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Claimed
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4 mr-2" />
                                Claim This Thought
                            </>
                        )}
                    </Button>

                    <motion.div
                        animate={{ opacity: isHovered ? 1 : 0.5 }}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            className="rounded-full hover:bg-background/50"
                            title="New Affirmation"
                        >
                            <RefreshCw className="w-4 h-4 text-muted-foreground" />
                        </Button>
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    );
}
