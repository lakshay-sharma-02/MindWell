import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles, Trash2, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export const WorryJar = () => {
    const [worry, setWorry] = useState("");
    const [isBurning, setIsBurning] = useState(false);
    const [particles, setParticles] = useState<number[]>([]);
    const [burnCount, setBurnCount] = useState(0);
    const { toast } = useToast();

    useEffect(() => {
        const savedCount = localStorage.getItem("mindwell_burn_count");
        if (savedCount) setBurnCount(parseInt(savedCount));
    }, []);

    const handleBurn = () => {
        if (!worry.trim()) return;

        setIsBurning(true);

        // Generate particles
        const newParticles = Array.from({ length: 30 }, (_, i) => i);
        setParticles(newParticles);

        setTimeout(() => {
            setWorry("");
            setIsBurning(false);
            setParticles([]);
            const newCount = burnCount + 1;
            setBurnCount(newCount);
            localStorage.setItem("mindwell_burn_count", newCount.toString());
            toast({
                title: "Worry Released",
                description: "You've let it go. Take a deep breath.",
            });
        }, 2000);
    };

    return (
        <Card className="relative overflow-hidden border-none shadow-2xl bg-gradient-to-b from-orange-50/50 to-orange-100/30 dark:from-orange-950/20 dark:to-orange-900/10 p-8 min-h-[500px] flex flex-col items-center justify-center text-center">

            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-200/20 via-transparent to-transparent pointer-events-none animate-pulse" style={{ animationDuration: '4s' }} />

            <div className="max-w-md w-full relative z-10">
                <div className="mb-8">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-slow">
                        <Flame className="w-8 h-8 text-orange-500" />
                    </div>
                    <h2 className="text-3xl font-display font-bold mb-2">The Worry Jar</h2>
                    <p className="text-muted-foreground">
                        Type out what's troubling you. When you're ready, cast it into the fire and watch it fade away.
                    </p>
                </div>

                <div className="relative">
                    <AnimatePresence>
                        {!isBurning ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
                                transition={{ duration: 0.5 }}
                                className="relative"
                            >
                                <textarea
                                    value={worry}
                                    onChange={(e) => setWorry(e.target.value)}
                                    placeholder="I am worried about..."
                                    className="w-full h-40 p-6 rounded-2xl bg-background/50 backdrop-blur-sm border-2 border-orange-100 dark:border-orange-900/50 focus:border-orange-300 focus:ring-4 focus:ring-orange-100/50 transition-all resize-none text-lg text-center placeholder:text-muted-foreground/50 shadow-inner"
                                />
                                <div className="absolute -bottom-14 left-0 right-0 flex justify-center">
                                    <Button
                                        size="lg"
                                        onClick={handleBurn}
                                        disabled={!worry.trim()}
                                        className="rounded-full px-8 py-6 text-lg bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all hover:scale-105 active:scale-95"
                                    >
                                        <Flame className="w-5 h-5 mr-2" />
                                        Let it Go
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-40 flex items-center justify-center relative">
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-orange-500 font-display text-2xl font-bold"
                                >
                                    Releasing...
                                </motion.div>
                                {particles.map((_, i) => (
                                    <Particle key={i} index={i} />
                                ))}
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="mt-24 flex items-center justify-center gap-2 text-sm text-muted-foreground/60">
                    <History className="w-4 h-4" />
                    <span>{burnCount} worries released</span>
                </div>
            </div>
        </Card>
    );
};

// Particle Component for the burning effect
const Particle = ({ index }: { index: number }) => {
    const randomX = Math.random() * 200 - 100;
    const randomY = Math.random() * -150 - 50;
    const duration = 1 + Math.random();

    return (
        <motion.div
            initial={{
                opacity: 1,
                x: 0,
                y: 0,
                scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
                opacity: 0,
                x: randomX,
                y: randomY,
                rotate: Math.random() * 360
            }}
            transition={{
                duration: duration,
                ease: "easeOut"
            }}
            className="absolute w-3 h-3 bg-gradient-to-tr from-orange-400 to-red-500 rounded-full blur-[1px]"
        />
    );
};
