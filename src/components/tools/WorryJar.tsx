import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, History, Trash2, Sparkles, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface CrumpledItem {
    id: string;
    x: number;
    rotation: number;
    delay: number;
}

export const WorryJar = () => {
    const [worry, setWorry] = useState("");
    const [crumpledItems, setCrumpledItems] = useState<CrumpledItem[]>([]);
    const [isBurning, setIsBurning] = useState(false);
    const [showAsh, setShowAsh] = useState(false);
    const [burnCount, setBurnCount] = useState(0);
    const { toast } = useToast();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load initial burn count
    useEffect(() => {
        const savedCount = localStorage.getItem("mindwell_burn_count");
        if (savedCount) setBurnCount(parseInt(savedCount));
    }, []);

    const handleTossWorry = () => {
        if (!worry.trim()) return;

        const newItem: CrumpledItem = {
            id: Date.now().toString(),
            x: Math.random() * 80 - 40, // Random pile position
            rotation: Math.random() * 360,
            delay: 0
        };

        setCrumpledItems(prev => [...prev, newItem]);
        setWorry(""); // Clear input for next worry
        toast({
            title: "Tossed In",
            description: "Worry added to the pile.",
            duration: 1500,
        });
    };

    const handleBurnAll = () => {
        if (crumpledItems.length === 0) return;

        setIsBurning(true);

        // 1. Fire sequence starts immediately
        // 2. Papers burn away
        setTimeout(() => {
            setCrumpledItems([]); // Remove papers visually
            setShowAsh(true); // Show ash residue
        }, 2000);

        // 3. Cleanup fire and ash
        setTimeout(() => {
            setIsBurning(false);
            const newCount = burnCount + crumpledItems.length;
            setBurnCount(newCount);
            localStorage.setItem("mindwell_burn_count", newCount.toString());

            toast({
                title: "Worries Released",
                description: "The fire has cleansed them into ash. Let them go.",
            });

            // Fade out ash slowly
            setTimeout(() => setShowAsh(false), 3000);
        }, 4500);
    };

    return (
        <div className="relative min-h-[600px] w-full flex flex-col items-center justify-center p-4 perspective-1000">

            {/* Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-orange-50/30 to-slate-900/5 dark:from-orange-950/10 dark:to-slate-950/50 rounded-3xl -z-10" />

            {/* The Jar Container */}
            <div className="relative w-full max-w-sm aspect-[3/4] group flex items-end justify-center pb-4 transition-transform duration-500">

                {/* 1. Jar Back Layer */}
                <div className="absolute inset-x-0 bottom-0 top-12 rounded-b-[40px] rounded-t-[10px] bg-gradient-to-b from-white/10 to-white/20 dark:from-white/5 dark:to-white/10 border-x-2 border-b-4 border-white/30 dark:border-white/10 shadow-2xl z-10 backdrop-blur-[1px]" />

                {/* 2. Ashes Layer (Bottom of Jar) */}
                <AnimatePresence>
                    {showAsh && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 1.5 } }}
                            className="absolute bottom-4 w-3/4 h-12 z-15"
                        >
                            <div className="w-full h-full bg-stone-800/80 dark:bg-black/60 blur-xl rounded-[50%]" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-stone-500/50 text-xs font-handwriting">ashes of the past</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. The Pile of Crumpled Papers */}
                <div className="absolute bottom-6 inset-x-6 h-48 z-20 flex items-end justify-center pointer-events-none">
                    <AnimatePresence>
                        {crumpledItems.map((item, index) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ y: -400, x: 0, scale: 1, opacity: 0, rotate: 0 }} // Start from top
                                animate={{
                                    y: 0,
                                    x: item.x,
                                    scale: 0.25,
                                    opacity: 1,
                                    rotate: item.rotation
                                }}
                                exit={{
                                    scale: 0,
                                    opacity: 0,
                                    transition: { duration: 1.5, ease: "circIn" } // Burn away
                                }}
                                transition={{
                                    type: "spring",
                                    damping: 15,
                                    stiffness: 100,
                                    layout: { duration: 0.3 }
                                }}
                                className="absolute bottom-0 w-32 h-32 flex-shrink-0"
                            >
                                {/* The Paper Ball Visual */}
                                <div className="w-full h-full bg-[#fdfbf7] dark:bg-[#1a1614] rounded-full shadow-md flex items-center justify-center border border-stone-300 dark:border-stone-700">
                                    <div className="w-full h-full border-2 border-slate-200 dark:border-slate-800 rounded-full bg-[radial-gradient(circle_at_30%_30%,_transparent_50%,_rgba(0,0,0,0.05))]" />
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* 4. Realistic Fire Effect (Covers the pile) */}
                <AnimatePresence>
                    {isBurning && (
                        <div className="absolute bottom-4 inset-x-8 h-64 z-25 flex justify-center items-end pointer-events-none">
                            <FireParticles intensity={crumpledItems.length > 5 ? 2 : 1} />
                        </div>
                    )}
                </AnimatePresence>

                {/* 5. Jar Front Glass Layer (Reflections) */}
                <div className="absolute inset-x-0 bottom-0 top-12 rounded-b-[40px] rounded-t-[10px] border-x border-b border-white/40 bg-gradient-to-tr from-white/10 via-transparent to-transparent backdrop-blur-[0.5px] z-30 pointer-events-none overflow-hidden">
                    <div className="absolute top-4 left-4 w-3 h-3/4 bg-white/40 blur-[4px] rounded-full opacity-60" />
                    <div className="absolute bottom-8 right-8 w-32 h-32 bg-orange-500/10 blur-[40px] rounded-full mix-blend-overlay" />
                    {/* Rim Highlight */}
                    <div className="absolute top-0 inset-x-4 h-[1px] bg-white/60 blur-[1px]" />
                </div>

                {/* 6. Jar Rim/Lid Area */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-8 bg-slate-200/40 dark:bg-slate-800/40 rounded-full border-2 border-white/40 shadow-sm z-30 backdrop-blur-md" />


                {/* 7. Active Input Layer (The Chit) */}
                <AnimatePresence mode="wait">
                    {!isBurning && (
                        <motion.div
                            key="input-chit"
                            initial={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0, transition: { duration: 0.2 } }}
                            className="absolute z-50 bottom-8 w-64 h-64"
                        >
                            <div className="relative w-full h-full group">
                                {/* The Paper Chit */}
                                <div className="absolute inset-0 bg-[#fff9e6] dark:bg-[#1c1917] rounded-sm shadow-xl transform rotate-1 transition-transform group-hover:rotate-0 duration-300 border border-stone-200 dark:border-stone-800">
                                    <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')]" />

                                    <textarea
                                        ref={textareaRef}
                                        value={worry}
                                        onChange={(e) => setWorry(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleTossWorry();
                                            }
                                        }}
                                        placeholder="Write a worry here..."
                                        className="relative w-full h-full p-6 bg-transparent border-none resize-none focus:ring-0 text-stone-800 dark:text-stone-200 font-handwriting text-2xl leading-relaxed text-center placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:outline-none z-10"
                                    />

                                    {/* Action Button: Toss */}
                                    <div className="absolute -bottom-5 right-1/2 translate-x-1/2 z-20 flex gap-2">
                                        <Button
                                            onClick={handleTossWorry}
                                            disabled={!worry.trim()}
                                            size="sm"
                                            className="rounded-full px-6 bg-stone-700 hover:bg-stone-800 text-stone-100 shadow-lg transition-all hover:scale-105 active:scale-95 border-2 border-white dark:border-stone-900 font-display"
                                        >
                                            Toss In
                                        </Button>
                                    </div>
                                </div>

                                {/* Tape */}
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/20 rounded-full blur-[1px] shadow-sm" />
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-red-500/80 -rotate-2 shadow-sm" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 8. Ignition Control (Only visible if item in jar) */}
                <AnimatePresence>
                    {crumpledItems.length > 0 && !isBurning && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute -right-20 bottom-20 z-40"
                        >
                            <Button
                                onClick={handleBurnAll}
                                size="lg"
                                className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-orange-500/50 transition-all hover:scale-110 active:scale-95 border-4 border-white/20"
                            >
                                <Flame className="w-8 h-8 fill-yellow-200 text-yellow-100 animate-pulse" />
                            </Button>
                            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-xs font-bold text-orange-600 dark:text-orange-400 whitespace-nowrap bg-white/80 dark:bg-black/80 px-2 py-1 rounded-full shadow-sm backdrop-blur-sm">
                                Burn All
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            <div className="mt-16 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 z-10 w-full max-w-md">
                <p className="font-display font-medium text-xl text-muted-foreground flex items-center justify-center gap-2">
                    <History className="w-4 h-4" />
                    {burnCount} worries burned
                </p>
                {crumpledItems.length > 0 && (
                    <p className="text-sm text-stone-500 mt-2 animate-pulse">
                        {crumpledItems.length} waiting to be burned...
                    </p>
                )}
            </div>
        </div>
    );
};

// Enhanced Fire Component
const FireParticles = ({ intensity = 1 }: { intensity?: number }) => {
    const particleCount = 40 * intensity;
    const particles = Array.from({ length: particleCount });

    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* Core Glow */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-40 bg-orange-600/30 blur-[60px] rounded-full mix-blend-screen"
            />

            {particles.map((_, i) => (
                <Particle key={i} index={i} />
            ))}
        </div>
    );
};

const Particle = ({ index }: { index: number }) => {
    const randomXStart = Math.random() * 120 - 60;
    const delay = Math.random() * 2;
    const duration = 0.8 + Math.random() * 1.2;
    const scale = Math.random() > 0.8 ? 1.8 : 1;

    return (
        <motion.div
            initial={{
                y: 120,
                x: randomXStart,
                opacity: 0,
                scale: 0
            }}
            animate={{
                y: -180,
                x: randomXStart + (Math.random() * 80 - 40),
                opacity: [0, 1, 0.8, 0],
                scale: [0, scale, scale * 0.4, 0],
                rotate: Math.random() * 360
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "easeOut"
            }}
            className={cn(
                "absolute bottom-0 left-1/2 rounded-full blur-[1px]",
                index % 4 === 0 ? "w-4 h-4 bg-yellow-300/90" :
                    index % 4 === 1 ? "w-6 h-6 bg-orange-500/80" :
                        index % 4 === 2 ? "w-3 h-3 bg-red-600/70" :
                            "w-2 h-2 bg-stone-700/60" // Smoke particles included
            )}
        />
    );
};
