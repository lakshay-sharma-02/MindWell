import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Flame, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// --- Types & Constants ---

interface CrumpledPaper {
    id: string;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    seed: number; // For randomizing the SVG noise
}

// --- Procedural Assets ---

const ProceduralCrumpledPaper = ({ seed, className }: { seed: number, className?: string }) => {
    // Unique IDs for SVG gradients/filters to prevent conflicts
    const paperId = `paper-${seed}`;
    const foldId = `folds-${seed}`;

    return (
        <div className={className}>
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-md">
                <defs>
                    {/* 1. Micro-texture (Grain) - High frequency noise */}
                    <filter id={paperId}>
                        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed={seed} result="texture" />
                        <feColorMatrix type="saturate" values="0" in="texture" />
                        <feComponentTransfer>
                            {/* Make it subtle */}
                            <feFuncA type="linear" slope="0.4" />
                        </feComponentTransfer>
                        <feComposite operator="in" in2="SourceGraphic" result="texturedSource" />
                    </filter>

                    {/* 2. Macro-structure (Deep Folds) - Low frequency displacement */}
                    <filter id={foldId}>
                        <feTurbulence type="turbulence" baseFrequency="0.04" numOctaves="2" seed={seed + 100} result="folds" />
                        <feDisplacementMap in="SourceGraphic" in2="folds" scale="12" xChannelSelector="R" yChannelSelector="G" />
                        <feComposite operator="in" in2="SourceGraphic" />
                    </filter>
                </defs>

                <g filter={`url(#${foldId})`}>
                    {/* Base Shape with Grain */}
                    <path
                        filter={`url(#${paperId})`}
                        d="M50 8 L85 25 L92 65 L70 92 L30 92 L8 65 L15 25 Z"
                        fill="#fdfdfc"
                        stroke="#d4d4d4"
                        strokeWidth="0.5"
                    />

                    {/* Structural Creases - manually defined "random" lines that get deformed by the displacement map */}
                    <path d="M25 25 L75 75" stroke="#a3a3a3" strokeWidth="0.5" fill="none" opacity="0.4" />
                    <path d="M75 25 L25 75" stroke="#a3a3a3" strokeWidth="0.5" fill="none" opacity="0.4" />
                    <path d="M50 10 L50 90" stroke="#a3a3a3" strokeWidth="0.5" fill="none" opacity="0.3" />
                    <path d="M10 50 L90 50" stroke="#a3a3a3" strokeWidth="0.5" fill="none" opacity="0.3" />

                    {/* Scribbles */}
                    <path d="M30 40 Q50 35 70 45" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.5" />
                    <path d="M25 55 Q45 60 75 50" stroke="#94a3b8" strokeWidth="2" fill="none" opacity="0.5" />
                </g>
            </svg>
        </div>
    );
};

const ProceduralAshPile = () => {
    return (
        <svg viewBox="0 0 200 120" className="w-full h-full overflow-visible drop-shadow-xl">
            <defs>
                {/* Ash Noise - rough and crumbly edges */}
                <filter id="ash-roughness" x="-20%" y="-20%" width="140%" height="140%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" seed="5" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" />
                </filter>

                {/* Stratified Gradients */}
                <linearGradient id="ash-dark" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#1c1917" />
                    <stop offset="100%" stopColor="#44403c" />
                </linearGradient>
                <linearGradient id="ash-medium" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#292524" />
                    <stop offset="100%" stopColor="#57534e" />
                </linearGradient>
                <linearGradient id="ash-light" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0%" stopColor="#78716c" />
                    <stop offset="100%" stopColor="#a8a29e" />
                </linearGradient>
            </defs>

            <g filter="url(#ash-roughness)">
                {/* Stratum 1: Base (Wide, dark) */}
                <path
                    d="M10 115 Q50 100 100 110 Q150 100 190 115 Z"
                    fill="url(#ash-dark)"
                    opacity="0.9"
                />

                {/* Stratum 2: Mid-pile (Irregular, chunky) */}
                <path
                    d="M30 115 Q60 80 90 95 Q140 60 170 115 Z"
                    fill="url(#ash-medium)"
                    opacity="0.8"
                />

                {/* Stratum 3: Peak (Lighter ash, collapsed structure) */}
                <path
                    d="M70 115 L85 70 L95 85 L115 50 L125 115 Z"
                    fill="url(#ash-light)"
                    opacity="0.7"
                />

                {/* Loose debris particles for granularity */}
                <circle cx="50" cy="110" r="4" fill="#57534e" />
                <circle cx="160" cy="105" r="5" fill="#44403c" />
                <path d="M120 100 L130 95 L125 110 Z" fill="#292524" />
            </g>
        </svg>
    );
};

// --- Sub-Components ---

const WorryInput = ({
    onToss,
    containerRef
}: {
    onToss: (text: string) => void,
    containerRef: React.RefObject<HTMLDivElement>
}) => {
    const [text, setText] = useState("");

    const handleToss = () => {
        if (!text.trim()) return;
        onToss(text);
        setText("");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute z-50 top-[5%] sm:top-[10%] left-1/2 -translate-x-1/2 w-full max-w-md px-4"
        >
            <div className="bg-white dark:bg-zinc-900 shadow-2xl rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 transform rotate-1 transition-transform hover:rotate-0">
                {/* Header / Tape effect */}
                <div className="bg-yellow-100 dark:bg-yellow-900/30 h-3 w-32 mx-auto mt-2 mb-4 opacity-50 rotate-1 relative">
                    <div className="absolute inset-0 bg-yellow-200/40 opacity-50 blur-[1px]" />
                </div>

                <div className="p-6">
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write your worry here..."
                        className="w-full h-32 bg-transparent border-none resize-none font-handwriting text-2xl leading-relaxed text-zinc-800 dark:text-zinc-200 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                        autoFocus
                    />

                    <div className="flex justify-end pt-4">
                        <Button
                            onClick={handleToss}
                            disabled={!text.trim()}
                            className="rounded-full px-6 bg-zinc-800 hover:bg-black text-zinc-100 dark:bg-zinc-200 dark:text-zinc-900 shadow-lg hover:shadow-xl hover:scale-105 transition-all group"
                        >
                            <span className="mr-2">Toss it away</span>
                            <Send className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Realistic Fire System ---

const RealisticFireSystem = ({ intensity }: { intensity: number }) => {
    // Dynamic intensity scaling
    const safeIntensity = Math.max(1, intensity);
    const flameCount = Math.min(8 + safeIntensity, 25);
    const heightScale = Math.min(1 + safeIntensity * 0.15, 2.0);

    // Generate randomized flame parameters to break periodicity and look chaotic
    const flames = useMemo(() => Array.from({ length: flameCount }).map((_, i) => ({
        id: i,
        // Chaotic motion paths using keyframes
        xKeyframes: Array.from({ length: 5 }, () => (Math.random() - 0.5) * (60 * heightScale)),
        heightKeyframes: Array.from({ length: 5 }, () => (40 + Math.random() * 100) * heightScale),
        duration: 0.8 + Math.random() * 0.6,
        delay: Math.random() * 0.5
    })), [flameCount, heightScale]);

    return (
        <div className="relative w-full h-[140%] -bottom-4 pointer-events-none flex justify-center z-50">
            {/* 1. Smoke (Darker, more turbulent) */}
            <div className="absolute inset-0 flex justify-center">
                {Array.from({ length: 6 }).map((_, i) => (
                    <motion.div
                        key={`smoke-${i}`}
                        initial={{ opacity: 0, y: 50, scale: 0.5 }}
                        animate={{
                            opacity: [0, 0.4, 0],
                            y: -350 - (safeIntensity * 25),
                            x: (Math.random() - 0.5) * 120,
                            scale: 3,
                            rotate: Math.random() * 360
                        }}
                        transition={{
                            duration: 3 + Math.random(),
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: "easeOut"
                        }}
                        className="absolute bottom-20 w-32 h-32 rounded-full bg-stone-900/30 blur-[50px]"
                    />
                ))}
            </div>

            {/* 2. Flames (Chaotic & Hot) */}
            {flames.map((flame) => (
                <motion.div
                    key={`flame-${flame.id}`}
                    animate={{
                        height: flame.heightKeyframes,
                        opacity: [0.6, 1, 0.6],
                        scaleX: [0.9, 1.2, 0.8, 1],
                        x: flame.xKeyframes
                    }}
                    transition={{
                        duration: flame.duration,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                        delay: flame.delay
                    }}
                    style={{ transformOrigin: "bottom center" }}
                    // Gradient: Blue core -> Orange body -> Transparent tip
                    className="absolute bottom-4 w-12 bg-gradient-to-t from-blue-500 via-orange-500 to-transparent blur-[8px] rounded-full mix-blend-screen"
                />
            ))}

            {/* 3. Core Heat (Intense) */}
            <motion.div
                animate={{
                    scale: [1, 1.1 + (safeIntensity * 0.05), 0.95, 1],
                    opacity: [0.8, 0.9, 0.8]
                }}
                transition={{ duration: 0.3, repeat: Infinity }}
                className="absolute bottom-4 w-28 h-32 bg-gradient-to-t from-blue-200 via-orange-300 to-transparent blur-[25px] rounded-full mix-blend-add"
            />

            {/* 4. Embers/Sparks (Fast & erratic) */}
            {Array.from({ length: 10 + safeIntensity * 2 }).map((_, i) => (
                <motion.div
                    key={`ember-${i}`}
                    initial={{ y: 0, x: 0, opacity: 1, scale: 1 }}
                    animate={{
                        y: -400 - (safeIntensity * 30),
                        x: (Math.random() - 0.5) * 400,
                        opacity: [1, 1, 0],
                        scale: [1, 0.5, 0]
                    }}
                    transition={{
                        duration: 1 + Math.random(),
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "easeOut"
                    }}
                    className="absolute bottom-10 w-1 h-1 bg-gradient-to-t from-yellow-200 to-white rounded-full shadow-[0_0_10px_#fbbf24] z-50"
                />
            ))}
        </div>
    );
};

// --- Main Component ---

export const WorryJar = () => {
    const [items, setItems] = useState<CrumpledPaper[]>([]);
    const [isBurning, setIsBurning] = useState(false);
    const [showAsh, setShowAsh] = useState(false);
    const [burnCount, setBurnCount] = useState(0);
    const [showInput, setShowInput] = useState(true);

    const containerRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // 3D Tilt Effect
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { damping: 15, stiffness: 100 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { damping: 15, stiffness: 100 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { width, height, left, top } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
    };

    useEffect(() => {
        const saved = localStorage.getItem("mindwell_burn_count");
        if (saved) setBurnCount(parseInt(saved));
    }, []);

    const handleToss = (text: string) => {
        // Add new paper with randomized properties
        const newItem: CrumpledPaper = {
            id: Date.now().toString(),
            x: Math.random() * 40 - 20, // Spread within jar width percent
            y: -10 + Math.random() * 10, // Slight vertical pile variation
            rotation: Math.random() * 360,
            scale: 0.9 + Math.random() * 0.2,
            seed: Math.floor(Math.random() * 1000)
        };

        setItems(prev => [...prev, newItem]);

        // Feedback
        toast({
            title: "Tossed In",
            description: "Your worry is in the jar now.",
            duration: 1500,
        });
    };

    const handleBurnAll = () => {
        if (items.length === 0) return;

        setShowInput(false);
        setIsBurning(true);

        // Sequence: Fire -> Papers vanish -> Ash appears -> Fire dies -> Reset

        // 2s: Papers consume visuals
        setTimeout(() => {
            setItems([]);
            setShowAsh(true);
        }, 2500);

        // 5s: Fire stops
        setTimeout(() => {
            setIsBurning(false);
            const newCount = burnCount + items.length;
            setBurnCount(newCount);
            localStorage.setItem("mindwell_burn_count", newCount.toString());

            toast({
                title: "Gone",
                description: "The fire has cleansed them.",
            });
        }, 6000);

        // 8s: Restore input, hide ash slowly
        setTimeout(() => {
            setShowInput(true);
            setShowAsh(false);
        }, 9000);
    };

    return (
        <div
            ref={containerRef}
            className="relative min-h-[700px] w-full flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-50 dark:bg-slate-950/50"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >

            {/* Input Area */}
            <AnimatePresence>
                {showInput && !isBurning && (
                    <WorryInput onToss={handleToss} containerRef={containerRef} />
                )}
            </AnimatePresence>

            {/* --- JAR ASSEMBLY --- */}
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative w-72 h-96 mt-32 sm:mt-24 group z-10 transition-all duration-700"
            >

                {/* 1. Back Glass */}
                <div
                    className="absolute inset-0 rounded-[3rem] rounded-t-[1rem] bg-gradient-to-br from-white/20 to-white/5 border border-white/20 shadow-2xl backdrop-blur-[1px] z-10"
                    style={{ transform: "translateZ(-20px)" }}
                />

                {/* 2. Ash Pile */}
                <AnimatePresence>
                    {showAsh && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, duration: 2 }}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-48 h-28 z-20 pointer-events-none"
                            style={{ transform: "translateZ(0px)" }}
                        >
                            <ProceduralAshPile />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* 3. Paper Pile */}
                <div
                    className="absolute bottom-4 inset-x-4 h-64 z-30 flex items-end justify-center pointer-events-none"
                    style={{ transform: "translateZ(10px)" }}
                >
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ y: -600, x: 0, rotate: item.rotation * 0.1, scale: 1 }}
                                animate={{
                                    y: item.y,
                                    x: item.x,
                                    rotate: item.rotation,
                                    scale: item.scale
                                }}
                                exit={{
                                    scale: [item.scale, item.scale * 0.8, 0],
                                    opacity: [1, 1, 0],
                                    filter: ["brightness(1)", "brightness(0.3)", "brightness(0)"], // Charring
                                    transition: { duration: 2, ease: "anticipate" }
                                }}
                                transition={{
                                    type: "spring",
                                    damping: 20,
                                    stiffness: 120,
                                    mass: 0.8
                                }}
                                className="absolute bottom-0 w-24 h-24 flex items-center justify-center origin-center"
                            >
                                <ProceduralCrumpledPaper
                                    seed={item.seed}
                                    className="w-full h-full"
                                />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* 4. Fire System */}
                <AnimatePresence>
                    {isBurning && (
                        <div
                            className="absolute bottom-0 inset-x-0 h-full z-40 pointer-events-none"
                            style={{ transform: "translateZ(30px)" }}
                        >
                            <RealisticFireSystem intensity={items.length} />
                        </div>
                    )}
                </AnimatePresence>

                {/* 5. Front Glass - with reflection */}
                <div
                    className="absolute inset-0 rounded-[3rem] rounded-t-[1rem] border border-white/20 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none z-50 overflow-hidden"
                    style={{ transform: "translateZ(50px)" }}
                >
                    <div className="absolute top-6 left-6 w-8 h-[60%] bg-gradient-to-b from-white/40 to-transparent blur-md rounded-full opacity-60" />
                    <div className="absolute bottom-8 right-6 w-16 h-16 bg-white/10 blur-[20px] rounded-full" />
                </div>

                {/* Lid/Rim */}
                <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 w-52 h-8 bg-slate-200/50 dark:bg-slate-700/50 border border-white/40 shadow-sm rounded-full z-[45] backdrop-blur-md"
                    style={{ transform: "translateZ(20px)" }}
                />

            </motion.div>

            {/* Burn Button */}
            <AnimatePresence>
                {items.length > 0 && !isBurning && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-20 z-50"
                    >
                        <Button
                            onClick={handleBurnAll}
                            size="lg"
                            className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white font-display text-xl px-12 py-7 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_50px_rgba(239,68,68,0.6)] hover:scale-110 transition-all border border-red-400/30 active:scale-95"
                        >
                            <Flame className="w-6 h-6 mr-2 fill-yellow-200 animate-pulse" />
                            Burn It All
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer Stats */}
            <div className="absolute bottom-6 text-center opacity-40 hover:opacity-100 transition-opacity">
                <p className="font-display text-sm tracking-wide text-zinc-500 dark:text-zinc-400">
                    {burnCount > 0 ? `${burnCount} burdens released` : "The jar awaits"}
                </p>
                {burnCount > 0 && <Button variant="link" size="sm" onClick={() => { setBurnCount(0); localStorage.removeItem("mindwell_burn_count"); }} className="text-xs h-auto p-0 text-red-500">Reset Count</Button>}
            </div>

        </div>
    );
};
