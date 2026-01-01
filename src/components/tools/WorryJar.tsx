import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { Flame, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// --- Types & Constants ---

interface FoldedItem {
    id: string;
    x: number;
    y: number;
    rotation: number;
    color: string;
    scale: number;
}

const PASTEL_COLORS = [
    "bg-yellow-200", // Yellow
    "bg-pink-200",   // Pink
    "bg-sky-200",    // Blue
    "bg-green-200",  // Green
    "bg-orange-200", // Orange
    "bg-violet-200", // Purple
];

// --- Sub-Components ---

const DraggablePaper = ({
    worry,
    setWorry,
    onToss,
    containerRef
}: {
    worry: string,
    setWorry: (v: string) => void,
    onToss: () => void,
    containerRef: React.RefObject<HTMLDivElement>
}) => {
    const controls = useDragControls();

    return (
        <motion.div
            drag
            dragControls={controls}
            dragConstraints={containerRef}
            dragElastic={0.1}
            whileDrag={{ scale: 1.05, rotate: 5, boxShadow: "0px 20px 40px rgba(0,0,0,0.2)" }}
            initial={{ y: -200, opacity: 0, rotate: -5 }}
            animate={{ y: -150, opacity: 1, rotate: -2 }}
            exit={{ y: 200, scale: 0.1, opacity: 0, rotate: 45, transition: { duration: 0.4 } }}
            className="absolute z-[60] top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/3 touch-none"
        >
            <div className="relative w-80 h-80 bg-[#fdfbf7] dark:bg-[#1a1614] shadow-xl rotate-1 rounded-sm overflow-hidden border border-stone-200 dark:border-stone-800">
                {/* Paper Visuals */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] opacity-50" />
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-yellow-200/50 -rotate-1 skew-x-12 blur-[1px]" /> {/* Tape look */}

                {/* Drag Handle */}
                <div
                    className="absolute top-2 right-2 p-2 cursor-grab active:cursor-grabbing text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors z-20"
                    onPointerDown={(e) => controls.start(e)}
                >
                    <Move className="w-5 h-5" />
                </div>

                <div className="p-8 h-full flex flex-col justify-between relative z-10">
                    <textarea
                        value={worry}
                        onChange={(e) => setWorry(e.target.value)}
                        placeholder="Write what's weighing on you..."
                        className="w-full h-48 bg-transparent border-none resize-none font-handwriting text-3xl leading-relaxed text-stone-800 dark:text-stone-200 focus:outline-none text-center placeholder:text-stone-300 dark:placeholder:text-stone-600"
                        autoFocus
                    />

                    <div className="flex justify-center pb-2">
                        <Button
                            onClick={onToss}
                            disabled={!worry.trim()}
                            className="rounded-full w-full py-6 bg-stone-800 hover:bg-black text-stone-100 dark:bg-stone-200 dark:text-stone-900 font-display text-lg shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100"
                        >
                            Toss In Jar
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Realistic Fire System ---

const RealisticFireSystem = ({ intensity }: { intensity: number }) => {
    // Determine fire scale based on intensity (number of items)
    const scale = Math.min(1 + (intensity * 0.1), 2); // Cap at 2x size

    return (
        <div className="relative w-full h-[120%] -bottom-10 pointer-events-none flex justify-center">
            {/* 1. Smoke (Rise high and fade) */}
            <div className="absolute inset-0 flex justify-center">
                {Array.from({ length: 12 }).map((_, i) => (
                    <motion.div
                        key={`smoke-${i}`}
                        initial={{ opacity: 0, y: 50, x: 0, scale: 0.5 }}
                        animate={{
                            opacity: [0, 0.4, 0],
                            y: -250,
                            x: (Math.random() - 0.5) * 100,
                            scale: 2 + Math.random()
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            ease: "easeOut",
                            delay: Math.random() * 2
                        }}
                        className="absolute bottom-10 w-20 h-20 rounded-full bg-stone-700/30 blur-[30px]"
                    />
                ))}
            </div>

            {/* 2. Outer Flame (Orange loops) */}
            <div className="absolute bottom-0 w-full flex justify-center mix-blend-screen">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={`flame-outer-${i}`}
                        initial={{ height: 10, opacity: 0 }}
                        animate={{
                            height: [20, 100 + Math.random() * 80, 20],
                            opacity: [0.2, 0.8, 0.2],
                            x: (Math.random() - 0.5) * 60,
                            scaleX: [1, 0.8, 1]
                        }}
                        transition={{
                            duration: 0.6 + Math.random() * 0.4,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: Math.random()
                        }}
                        style={{ transformOrigin: "bottom" }}
                        className="absolute bottom-4 w-12 bg-gradient-to-t from-orange-600 via-red-500 to-transparent blur-[8px] rounded-t-full"
                    />
                ))}
            </div>

            {/* 3. Core Flame (Bright Yellow/White) */}
            <motion.div
                animate={{ scale: [1, 1.1, 0.95, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 0.2, repeat: Infinity }}
                className="absolute bottom-4 w-24 h-32 bg-gradient-to-t from-yellow-200 via-orange-400 to-transparent blur-[15px] rounded-full mix-blend-hard-light"
            />

            {/* 4. Sparks (Fast erratic dots) */}
            {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={`spark-${i}`}
                    initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
                    animate={{
                        y: -300,
                        x: (Math.random() - 0.5) * 200,
                        opacity: 0,
                        scale: 0
                    }}
                    transition={{
                        duration: 1 + Math.random(),
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: Math.random() * 2
                    }}
                    className="absolute bottom-10 w-1 h-1 bg-yellow-100 rounded-full shadow-[0_0_5px_#fff]"
                />
            ))}
        </div>
    );
};

// --- Main Component ---

export const WorryJar = () => {
    const [worry, setWorry] = useState("");
    const [items, setItems] = useState<FoldedItem[]>([]);
    const [isBurning, setIsBurning] = useState(false);
    const [showAsh, setShowAsh] = useState(false);
    const [burnCount, setBurnCount] = useState(0);
    const [isInputOpen, setIsInputOpen] = useState(true); // Is the paper currently available to write on?

    // Drag constraints reference
    const containerRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Load persisted count
    useEffect(() => {
        const saved = localStorage.getItem("mindwell_burn_count");
        if (saved) setBurnCount(parseInt(saved));
    }, []);

    // Add a new worry to the jar
    const handleToss = () => {
        if (!worry.trim()) return;

        // Create a new "folded" visual item
        const newItem: FoldedItem = {
            id: Date.now().toString(),
            x: Math.random() * 60 - 30, // Random spread inside jar
            y: Math.random() * 40 - 20, // Vertical randomness
            rotation: Math.random() * 360,
            color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
            scale: 0.8 + Math.random() * 0.4
        };

        setItems(prev => [...prev, newItem]);
        setWorry("");

        // Brief animation reset for input
        setIsInputOpen(false);
        setTimeout(() => setIsInputOpen(true), 400);

        toast({
            title: "Tossed In",
            description: "It joins the others in the jar.",
            duration: 1000,
        });
    };

    // Ignite everything
    const handleBurnAll = () => {
        if (items.length === 0) return;
        setIsBurning(true);

        // Timeline:
        // 0s: Fire starts
        // 2.5s: Papers disappear (consumed) + Ash appears
        // 5s: Fire dies down

        setTimeout(() => {
            setItems([]);
            setShowAsh(true);
        }, 2500);

        setTimeout(() => {
            setIsBurning(false);
            const newCount = burnCount + items.length;
            setBurnCount(newCount);
            localStorage.setItem("mindwell_burn_count", newCount.toString());

            toast({
                title: "Released",
                description: "The fire has cleansed them. They are gone.",
            });

            // Fade ash eventually
            setTimeout(() => setShowAsh(false), 8000);
        }, 5500);
    };

    return (
        <div ref={containerRef} className="relative min-h-[700px] w-full flex flex-col items-center justify-center p-4 overflow-hidden">

            {/* Ambient Room Lighting */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-slate-200/50 dark:from-slate-900/50 dark:to-slate-950/80 -z-20" />

            {/* The Draggable Paper Input (Floating) */}
            <AnimatePresence>
                {isInputOpen && !isBurning && (
                    <DraggablePaper
                        worry={worry}
                        setWorry={setWorry}
                        onToss={handleToss}
                        containerRef={containerRef}
                    />
                )}
            </AnimatePresence>


            {/* --- THE JAR --- */}
            <div className="relative w-64 h-80 sm:w-72 sm:h-96 mt-20 group perspective-1000">

                {/* 1. Back Glass (Darker/Reflective) */}
                <div className="absolute inset-0 rounded-[3rem] rounded-t-[1rem] bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 shadow-2xl backdrop-blur-[2px] z-10" />

                {/* 2. Ash Pile (Bottom Layer) */}
                <AnimatePresence>
                    {showAsh && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, transition: { duration: 2 } }}
                            className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-24 z-20"
                        >
                            <div className="w-full h-full bg-stone-800 dark:bg-black blur-xl rounded-[100%] opacity-80" />
                            {/* Ash particles static */}
                            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-stone-600 rounded-full blur-[1px] translate-x-4 -translate-y-2" />
                            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-stone-700 rounded-full blur-[1px] -translate-x-6 translate-y-1" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. The Content Pile (Folded Chits) */}
                <div className="absolute bottom-4 inset-x-4 h-56 z-30 flex items-end justify-center pointer-events-none">
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layoutId={item.id}
                                initial={{ y: -400, x: 0, rotate: 0, scale: 1.2 }}
                                animate={{
                                    y: item.y,
                                    x: item.x,
                                    rotate: item.rotation,
                                    scale: item.scale
                                }}
                                exit={{
                                    scale: [item.scale, item.scale * 0.9, 0],
                                    rotate: item.rotation + 20,
                                    opacity: 0,
                                    filter: "brightness(0)", // Turning to char
                                    transition: { duration: 2, ease: "easeInOut" }
                                }}
                                transition={{ type: "spring", damping: 20 }}
                                className={cn(
                                    "absolute bottom-0 w-16 h-16 shadow-md border-[0.5px] border-black/10 flex items-center justify-center",
                                    item.color
                                )}
                                style={{
                                    borderRadius: "2px",
                                    clipPath: "polygon(0 0, 100% 0, 100% 80%, 80% 100%, 0 100%)" // Folded corner
                                }}
                            >
                                <div className="absolute bottom-0 right-0 w-[20%] h-[20%] bg-black/10 backdrop-brightness-75" />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* 4. Realistic Fire System */}
                <AnimatePresence>
                    {isBurning && (
                        <div className="absolute bottom-0 inset-x-0 h-full z-40 flex justify-center items-end pointer-events-none">
                            <RealisticFireSystem intensity={items.length} />
                        </div>
                    )}
                </AnimatePresence>

                {/* 5. Front Glass (Specular Highlights & Rim) */}
                <div className="absolute inset-0 rounded-[3rem] rounded-t-[1rem] border border-white/30 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-50 overflow-hidden">
                    {/* Highlights */}
                    <div className="absolute top-8 left-4 w-4 h-[70%] bg-gradient-to-b from-white/40 to-transparent blur-[3px] rounded-full opacity-70" />
                    <div className="absolute bottom-8 right-6 w-16 h-16 bg-white/10 blur-[20px] rounded-full" />
                </div>

                {/* Lid / Rim */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-48 h-8 bg-slate-100/90 dark:bg-slate-800/90 border border-white/50 shadow-md rounded-full z-40 backdrop-blur-sm" />

                {/* Burn All Trigger */}
                <AnimatePresence>
                    {items.length > 0 && !isBurning && (
                        <motion.div
                            initial={{ scale: 0, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -bottom-20 left-1/2 -translate-x-1/2 z-50"
                        >
                            <Button
                                onClick={handleBurnAll}
                                className="bg-red-600 hover:bg-red-700 text-white font-display text-lg px-8 py-6 rounded-full shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:scale-105 transition-all"
                            >
                                <Flame className="w-5 h-5 mr-2 fill-yellow-200 animate-pulse" />
                                Burn All
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

            </div>

            {/* Stats Footer */}
            <div className="absolute bottom-8 text-center opacity-60">
                <p className="font-display font-medium text-sm">
                    {burnCount > 0 ? `${burnCount} burdens released into the ashes` : "Start by writing a worry above"}
                </p>
            </div>
        </div>
    );
};
