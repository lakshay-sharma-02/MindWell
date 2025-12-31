import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Sparkles, History, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export const WorryJar = () => {
    const [worry, setWorry] = useState("");
    const [isBurning, setIsBurning] = useState(false);
    const [burnCount, setBurnCount] = useState(0);
    const [showFire, setShowFire] = useState(false);
    const { toast } = useToast();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const savedCount = localStorage.getItem("mindwell_burn_count");
        if (savedCount) setBurnCount(parseInt(savedCount));
    }, []);

    const handleBurn = () => {
        if (!worry.trim()) return;

        setIsBurning(true);

        // Sequence: Crumple -> Drop -> Fire -> Done
        setTimeout(() => setShowFire(true), 600); // Start fire as it drops

        setTimeout(() => {
            setWorry("");
            setIsBurning(false);
            setShowFire(false);
            const newCount = burnCount + 1;
            setBurnCount(newCount);
            localStorage.setItem("mindwell_burn_count", newCount.toString());
            toast({
                title: "Worry Released",
                description: "It looks beautiful when it burns, doesn't it?",
            });
        }, 3500);
    };

    return (
        <div className="relative min-h-[600px] w-full flex flex-col items-center justify-center p-4 perspective-1000">

            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 to-slate-900/5 dark:from-orange-950/10 dark:to-slate-950/50 rounded-3xl -z-10" />

            {/* The Jar Container */}
            <div className="relative w-full max-w-sm aspect-[3/4] group flex items-end justify-center pb-4">

                {/* 1. Jar Back Layer (Behind interactions) */}
                <div className="absolute inset-x-0 bottom-0 top-12 rounded-b-[40px] rounded-t-[10px] bg-gradient-to-b from-white/5 to-white/10 border-x-2 border-b-4 border-white/20 dark:border-white/10 shadow-2xl z-10" />

                {/* 2. Fire Effect (Inside Jar) */}
                <AnimatePresence>
                    {showFire && (
                        <div className="absolute bottom-4 inset-x-8 h-48 z-20 flex justify-center items-end pointer-events-none fade-up-enter">
                            <FireParticles />
                        </div>
                    )}
                </AnimatePresence>

                {/* 3. Falling Crumpled Ball (Inside/Behind Glass) */}
                <AnimatePresence>
                    {isBurning && (
                        <motion.div
                            key="crumpled-paper"
                            initial={{ y: -300, scale: 1, rotate: 0, zIndex: 50 }}
                            animate={{
                                y: 150,
                                scale: 0.2,
                                rotate: 720,
                                opacity: [1, 1, 0],
                                zIndex: 15 // Drops "inside"
                            }}
                            transition={{
                                duration: 1.5,
                                ease: "easeIn",
                                times: [0, 0.6, 1],
                                opacity: { delay: 1, duration: 0.5 }
                            }}
                            className="absolute top-0 w-32 h-32 bg-[#fdfbf7] dark:bg-[#1a1614] rounded-full shadow-lg flex items-center justify-center pointer-events-none"
                        >
                            <div className="w-full h-full border-2 border-slate-200 dark:border-slate-800 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-100 to-slate-300 dark:from-slate-800 dark:to-slate-900" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 4. Jar Front Glass Layer (Reflections & Blur) - z-30 */}
                <div className="absolute inset-x-0 bottom-0 top-12 rounded-b-[40px] rounded-t-[10px] border-x border-b border-white/30 bg-gradient-to-tr from-white/10 to-transparent backdrop-blur-[1px] z-30 pointer-events-none overflow-hidden">
                    <div className="absolute top-4 left-4 w-2 h-full bg-gradient-to-b from-white/30 to-transparent opacity-50 blur-[2px] rounded-full" />
                    <div className="absolute bottom-4 right-8 w-24 h-24 bg-orange-500/10 blur-[30px] rounded-full" />
                </div>

                {/* Jar Rim */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-8 bg-slate-200/50 dark:bg-slate-800/50 rounded-full border-2 border-slate-300/50 dark:border-slate-700/50 shadow-sm z-30 backdrop-blur-sm" />


                {/* 5. Active Input Layer (Outside/Front of Jar) - z-50 */}
                <AnimatePresence>
                    {!isBurning && (
                        <motion.div
                            key="input-chit"
                            initial={{ opacity: 0, y: 50, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{
                                opacity: 0,
                                scale: 0.5,
                                y: 100,
                                rotate: 10,
                                transition: { duration: 0.3 }
                            }}
                            className="absolute z-50 bottom-12 w-64 h-64"
                        >
                            <div className="relative w-full h-full group">
                                {/* The Paper Chit */}
                                <div className="absolute inset-0 bg-[#fff9e6] dark:bg-[#1c1917] rounded-sm shadow-xl transform rotate-1 transition-transform group-hover:rotate-0 duration-300 border border-stone-200 dark:border-stone-800">
                                    {/* Texture */}
                                    <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

                                    <textarea
                                        ref={textareaRef}
                                        value={worry}
                                        onChange={(e) => setWorry(e.target.value)}
                                        placeholder="Write your worry on this chit..."
                                        className="relative w-full h-full p-6 bg-transparent border-none resize-none focus:ring-0 text-stone-800 dark:text-stone-200 font-handwriting text-2xl leading-relaxed text-center placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none z-10"
                                    />

                                    {/* Action Button (Sticker style) */}
                                    <div className="absolute -bottom-6 -right-6 z-20">
                                        <Button
                                            onClick={handleBurn}
                                            disabled={!worry.trim()}
                                            size="icon"
                                            className="h-14 w-14 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg hover:shadow-orange-500/40 transition-all hover:scale-110 active:scale-95 border-4 border-white dark:border-slate-950"
                                        >
                                            <Flame className="w-6 h-6 fill-orange-100 text-orange-100" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Pin/Tape visual */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-black/10 rounded-full blur-[1px]" />
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-red-500/80 -rotate-2 transform shadow-sm" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 z-10">
                <p className="font-display font-medium text-xl text-muted-foreground flex items-center justify-center gap-2">
                    <History className="w-4 h-4" />
                    {burnCount} worries burned away
                </p>
                <div className="h-1 w-24 mx-auto bg-gradient-to-r from-transparent via-orange-300 to-transparent mt-4 opacity-50" />
            </div>
        </div>
    );
};

// Realistic Fire Component
const FireParticles = () => {
    // Generate static particle definitions to avoid re-renders causing jumps
    const particles = Array.from({ length: 40 });

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Glow base */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-32 bg-orange-500/40 blur-[50px] rounded-full"
            />

            {particles.map((_, i) => (
                <Particle key={i} index={i} />
            ))}
        </div>
    );
};

const Particle = ({ index }: { index: number }) => {
    // Randomize physics for each particle
    const randomXStart = Math.random() * 100 - 50; // -50 to 50
    const delay = Math.random() * 2;
    const duration = 1 + Math.random() * 1.5;
    const scaleConfig = Math.random() > 0.7 ? 1.5 : 1; // Some large flames

    return (
        <motion.div
            initial={{
                y: 100,
                x: randomXStart,
                opacity: 0,
                scale: 0
            }}
            animate={{
                y: -150,
                x: randomXStart + (Math.random() * 60 - 30), // Drift
                opacity: [0, 1, 0.8, 0],
                scale: [0, scaleConfig, scaleConfig * 0.5, 0],
                rotate: Math.random() * 360
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "easeOut"
            }}
            className={cn(
                "absolute bottom-0 left-1/2 rounded-full blur-[2px]",
                index % 3 === 0 ? "w-6 h-6 bg-orange-500/80" : // Core flame
                    index % 3 === 1 ? "w-4 h-4 bg-yellow-400/80" : // Highlights
                        "w-3 h-3 bg-red-600/60" // Smoke/Embers
            )}
            style={{
                boxShadow: index % 3 === 0 ? "0 0 20px 5px rgba(249, 115, 22, 0.4)" : "none"
            }}
        />
    );
};
