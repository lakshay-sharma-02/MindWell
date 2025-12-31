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
            <div className="relative w-full max-w-sm aspect-[3/4] group">
                
                {/* Jar Glass Effect */}
                <div className="absolute inset-0 rounded-t-[50px] rounded-b-[30px] border-4 border-white/30 dark:border-white/10 bg-gradient-to-br from-white/20 to-white/5 dark:from-white/10 dark:to-transparent backdrop-blur-sm shadow-2xl overflow-hidden z-20 pointer-events-none">
                    {/* Glass Reflections */}
                    <div className="absolute top-8 left-4 w-4 h-32 rounded-full bg-gradient-to-b from-white/40 to-transparent" />
                    <div className="absolute top-8 right-6 w-2 h-16 rounded-full bg-gradient-to-b from-white/20 to-transparent" />
                </div>

                {/* Jar Lid/Rim Area */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-slate-200 dark:bg-slate-800 rounded-full border border-slate-300 dark:border-slate-700 shadow-lg z-10" />

                {/* Content Area Inside Jar */}
                <div className="absolute inset-2 rounded-t-[45px] rounded-b-[25px] flex flex-col items-center justify-end pb-8 overflow-hidden z-10">
                    
                    {/* Interaction Layer */}
                    <AnimatePresence mode="wait">
                        {!isBurning ? (
                            <motion.div
                                key="paper-input"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.3 } }}
                                className="w-full h-full flex flex-col items-center p-6 pt-16"
                            >
                                <div className="relative w-full aspect-[4/5] max-h-[300px]">
                                    {/* Paper Visual */}
                                    <textarea
                                        ref={textareaRef}
                                        value={worry}
                                        onChange={(e) => setWorry(e.target.value)}
                                        placeholder="Write your worry on this paper..."
                                        className="w-full h-full p-6 text-lg bg-[#fdfbf7] dark:bg-[#1a1614] text-slate-800 dark:text-slate-200 font-handwriting leading-relaxed resize-none shadow-md rotate-1 border-none focus:ring-0 focus:outline-none [mask-image:url('https://grainy-gradients.vercel.app/noise.svg')] paper-texture"
                                        style={{
                                            boxShadow: "1px 2px 4px rgba(0,0,0,0.1)",
                                            clipPath: "polygon(0% 0%, 100% 2%, 98% 100%, 2% 98%)"
                                        }}
                                    />
                                    {/* Paper Lines Overlay */}
                                    <div className="absolute inset-0 pointer-events-none p-6 pt-[3.5rem] bg-[linear-gradient(transparent_27px,#94a3b8_28px)] bg-[length:100%_28px] opacity-20" />
                                </div>

                                <Button
                                    onClick={handleBurn}
                                    disabled={!worry.trim()}
                                    className="mt-8 rounded-full px-8 py-6 bg-orange-600 hover:bg-orange-700 text-white font-display text-lg shadow-lg hover:shadow-orange-500/30 transition-all hover:scale-105 z-50 pointer-events-auto"
                                >
                                    <Flame className="w-5 h-5 mr-2 fill-orange-200" />
                                    Cast into Fire
                                </Button>
                            </motion.div>
                        ) : (
                            // The Crumpled Paper Falling
                            <motion.div
                                key="crumpled-paper"
                                initial={{ y: -100, scale: 1, rotate: 0 }}
                                animate={{ 
                                    y: 200, 
                                    scale: 0.2, 
                                    rotate: 720,
                                    opacity: [1, 1, 0]
                                }}
                                transition={{ 
                                    duration: 2,
                                    ease: "easeIn",
                                    opacity: { delay: 1.5, duration: 0.5 }
                                }}
                                className="absolute top-20 w-32 h-32 bg-[#fdfbf7] dark:bg-[#1a1614] rounded-full shadow-lg flex items-center justify-center z-20"
                            >
                                <div className="w-full h-full border-2 border-slate-200 dark:border-slate-800 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-100 to-slate-300 dark:from-slate-800 dark:to-slate-900" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Fire Effect */}
                    <AnimatePresence>
                        {showFire && (
                            <div className="absolute bottom-0 inset-x-0 h-64 z-30 flex justify-center items-end pointer-events-none">
                                <FireParticles />
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="mt-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
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
