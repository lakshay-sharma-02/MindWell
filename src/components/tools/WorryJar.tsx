import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import { Flame, Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// --- Types ---

interface CrumpledPaper {
    id: string;
    x: number;
    y: number;
    rotation: number;
    scale: number;
    seed: number;
    color: string;
}

interface AshParticle {
    id: string;
    x: number;
    y: number;
    scale: number;
    rotation: number;
    drift: number;
}

// --- SVG Assets (Filters & Defs) ---

const RitualAssets = () => (
    <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
            {/* 1. Heat Shimmer (Air Distortion) */}
            <filter id="heat-shimmer">
                <feTurbulence type="fractalNoise" baseFrequency="0.01 0.02" numOctaves="1" seed="1" result="noise">
                    <animate attributeName="baseFrequency" dur="2s" values="0.01 0.02;0.01 0.05;0.01 0.02" repeatCount="indefinite" />
                </feTurbulence>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" />
            </filter>

            {/* 2. Paper Char (Burnt Texture) */}
            <filter id="paper-char">
                <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
                <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0.33 0.33 0.33 0 0  0 0 0 1 0" in="noise" result="grayscale" />
                <feComposite operator="in" in="grayscale" in2="SourceGraphic" result="textured" />
                <feComponentTransfer in="textured">
                    <feFuncR type="linear" slope="0.5" intercept="0" />
                    <feFuncG type="linear" slope="0.5" intercept="0" />
                    <feFuncB type="linear" slope="0.5" intercept="0" />
                </feComponentTransfer>
            </filter>

            {/* 3. Soft Detail Glow */}
            <filter id="soft-glow" height="300%" width="300%" x="-75%" y="-75%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
    </svg>
);

// --- Components ---

const ProceduralCrumpledPaper = ({ seed, isBurning = false, color, className }: { seed: number, isBurning?: boolean, color: string, className?: string }) => {
    // Generate unique pattern ID for this instance to avoid conflicts
    const patternId = useMemo(() => `paper-pattern-${seed}`, [seed]);
    const foldId = useMemo(() => `paper-folds-${seed}`, [seed]);

    return (
        <div className={cn("relative w-full h-full", className)}>
            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-sm">
                <defs>
                    <filter id={foldId}>
                        <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="5" seed={seed} result="folds" />
                        <feDisplacementMap in="SourceGraphic" in2="folds" scale="10" />
                    </filter>
                </defs>

                <g filter={`url(#${foldId})`}>
                    <path
                        d="M50 5 L90 25 L95 70 L70 95 L30 95 L5 70 L10 25 Z"
                        fill={color}
                        stroke={isBurning ? "#573a2e" : "#d4d4d4"}
                        strokeWidth="0.5"
                        className="transition-colors duration-[3000ms]"
                        style={{
                            fill: isBurning ? "#291812" : color, // Fade to char color
                        }}
                    />

                    {/* Internal Creases */}
                    <path d="M50 5 L50 95" stroke="#a3a3a3" strokeWidth="0.5" fill="none" opacity="0.4" />
                    <path d="M5 40 L95 40" stroke="#a3a3a3" strokeWidth="0.5" fill="none" opacity="0.4" />
                    <circle cx="50" cy="50" r="20" stroke="#a3a3a3" strokeWidth="0.5" fill="none" opacity="0.2" />
                </g>

                {/* Glowing Embers when burning */}
                {isBurning && (
                    <motion.circle
                        cx="50" cy="80" r="10"
                        fill="url(#ember-gradient)"
                        className="animate-pulse mix-blend-screen"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 2] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </svg>
        </div>
    );
};

const RitualFire = ({ intensity }: { intensity: number }) => {
    const active = intensity > 0;

    return (
        <div className="relative w-full h-[150%] flex justify-center items-end pointer-events-none opacity-90 mix-blend-screen">
            {/* 1. Core Heat (Soft Glow) */}
            <motion.div
                animate={{
                    opacity: active ? 0.6 : 0,
                    scale: active ? [1, 1.05, 1] : 0.8,
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-0 w-48 h-48 bg-orange-500/30 blur-[60px] rounded-full"
            />

            {/* 2. Fluid Flames (Blobs) */}
            {active && (
                <>
                    {/* Deep Red Base */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 0.8, y: 0, scaleY: [1, 1.1, 0.9, 1] }}
                        className="absolute bottom-4 w-32 h-40 bg-gradient-to-t from-red-600/60 to-orange-500/0 blur-[20px] rounded-[40%_60%_70%_30%/40%_50%_60%_50%]"
                    />

                    {/* Orange Body */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 0.7,
                            y: [0, -10, 0],
                            rotate: [-2, 2, -2]
                        }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-8 w-24 h-32 bg-gradient-to-t from-orange-500/60 to-yellow-500/0 blur-[15px] rounded-[50%_50%_40%_60%/60%_40%_50%_50%]"
                    />

                    {/* Gold Tips (Turbulent) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{
                            opacity: 0.5,
                            scale: [1, 1.1, 1],
                            x: [-5, 5, -5]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute bottom-12 w-20 h-24 bg-yellow-400/40 blur-[10px] rounded-full"
                        style={{ filter: "url(#heat-shimmer)" }}
                    />
                </>
            )}

            {/* 3. Rising Particles (Embers) */}
            {active && Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                    key={`ember-${i}`}
                    className="absolute bottom-10 w-1 h-1 bg-amber-200 rounded-full shadow-[0_0_8px_#fbbf24]"
                    initial={{ opacity: 0, y: 0 }}
                    animate={{
                        opacity: [0, 1, 0],
                        y: -300 - Math.random() * 100,
                        x: Math.sin(i) * 60 + (Math.random() - 0.5) * 40,
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                        ease: "easeOut"
                    }}
                />
            ))}
        </div>
    );
};

const AshSystem = ({ active }: { active: boolean }) => {
    // Generates rising ash particles
    return (
        <AnimatePresence>
            {active && Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                    key={`ash-${i}`}
                    initial={{
                        opacity: 0,
                        y: 0,
                        x: (Math.random() - 0.5) * 100,
                        scale: 0.5,
                        rotate: Math.random() * 360
                    }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        y: -400 - Math.random() * 200,
                        x: (Math.random() - 0.5) * 200,
                        scale: Math.random() * 1.5,
                        rotate: Math.random() * 720
                    }}
                    transition={{
                        duration: 6 + Math.random() * 4,
                        ease: "easeOut",
                        delay: Math.random() * 1.5
                    }}
                    className="absolute bottom-0 w-3 h-3 bg-zinc-600/40 blur-[1px] rounded-full z-20 pointer-events-none"
                    style={{
                        // Irregular shape
                        borderRadius: `${30 + Math.random() * 70}% ${30 + Math.random() * 70}% ${30 + Math.random() * 70}% ${30 + Math.random() * 70}%`
                    }}
                />
            ))}
        </AnimatePresence>
    );
};

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
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.5 } }}
            className="absolute z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md px-6"
        >
            <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md shadow-2xl rounded-xl overflow-hidden border border-zinc-200/50 dark:border-zinc-800/50">
                <div className="p-6 space-y-4">
                    <p className="text-zinc-500 dark:text-zinc-400 font-medium text-sm text-center uppercase tracking-widest">
                        What weighs on you?
                    </p>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Write it down..."
                        className="w-full h-32 bg-transparent border-none resize-none font-handwriting text-2xl leading-relaxed text-zinc-800 dark:text-zinc-200 focus:outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 text-center"
                        autoFocus
                    />
                    <div className="flex justify-center">
                        <Button
                            onClick={handleToss}
                            disabled={!text.trim()}
                            variant="ghost"
                            className="rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-all font-display tracking-widest uppercase text-xs"
                        >
                            Let it go
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

// --- Main Component ---

export const WorryJar = () => {
    const [items, setItems] = useState<CrumpledPaper[]>([]);
    const [isBurning, setIsBurning] = useState(false);
    const [phase, setPhase] = useState<"idle" | "burning" | "releasing" | "cleared">("idle");
    const [burnCount, setBurnCount] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();

    // Mouse Parallax
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [5, -5]), { damping: 20, stiffness: 100 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-5, 5]), { damping: 20, stiffness: 100 });

    const handleMouseMove = (e: React.MouseEvent) => {
        const { width, height, left, top } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    const handleToss = (text: string) => {
        const colors = ["#fdfdfc", "#fef9c3", "#dbeafe", "#fce7f3", "#e0e7ff"]; // White, Yellow, Blue, Pink, Indigo
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        const newItem: CrumpledPaper = {
            id: Date.now().toString(),
            x: Math.random() * 60 - 30,
            y: Math.random() * 10 - 5,
            rotation: Math.random() * 360,
            scale: 0.8 + Math.random() * 0.3,
            seed: Math.floor(Math.random() * 1000),
            color: randomColor
        };
        setItems(prev => [...prev, newItem]);
    };

    const startRitual = () => {
        if (items.length === 0) return;
        setIsBurning(true);
        setPhase("burning");

        // Timeline
        // 0s: Fire starts growing
        // 2s: Papers start lifting/charring
        // 5s: Papers dissolve -> Ash spawns
        // 8s: Fire dies down -> "It's okay"
        // 12s: Reset

        setTimeout(() => setPhase("releasing"), 5000); // Ash phase

        setTimeout(() => {
            // Cleanup
            setItems([]);
            const newCount = burnCount + items.length;
            setBurnCount(newCount);
            setPhase("cleared");
            setIsBurning(false);
        }, 9000);

        setTimeout(() => {
            setPhase("idle");
        }, 13000);
    };

    return (
        <div
            ref={containerRef}
            className="relative min-h-[100dvh] w-full flex flex-col items-center justify-center p-4 overflow-hidden bg-[#f8f8f6] dark:bg-[#0a0a0a] transition-colors duration-1000"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
        >
            <RitualAssets />

            {/* Ambient Light Background */}
            <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                    background: isBurning
                        ? "radial-gradient(circle at 50% 80%, rgba(255,100,50,0.15), transparent 60%)"
                        : "radial-gradient(circle at 50% 50%, rgba(200,200,200,0.05), transparent 60%)"
                }}
                transition={{ duration: 3 }}
            />

            {/* Input Phase */}
            <AnimatePresence>
                {items.length === 0 && phase === "idle" && (
                    <WorryInput onToss={handleToss} containerRef={containerRef} />
                )}
                {/* Keep input visible if items exist but not burning yet, to add more */}
                {items.length > 0 && phase === "idle" && (
                    <WorryInput onToss={handleToss} containerRef={containerRef} />
                )}
            </AnimatePresence>

            {/* --- JAR VESSEL --- */}
            <motion.div
                style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                className="relative w-80 h-[28rem] mt-12 z-10"
            >
                {/* 1. Back Glass Container */}
                <div
                    className="absolute inset-0 rounded-[4rem] rounded-t-[1rem] bg-gradient-to-b from-white/10 to-white/5 border border-white/20 shadow-2xl backdrop-blur-[2px]"
                    style={{ transform: "translateZ(-20px)" }}
                />

                {/* 2. Contents Layer */}
                <div className="absolute inset-x-6 bottom-6 h-64 flex items-end justify-center perspective-1000" style={{ transform: "translateZ(10px)" }}>
                    <AnimatePresence>
                        {items.map((item) => (
                            <motion.div
                                key={item.id}
                                layoutId={item.id}
                                className="absolute bottom-0 w-28 h-28 flex items-center justify-center origin-center"
                                initial={{ y: -600, opacity: 0, scale: 1.1 }}
                                animate={isBurning ? {
                                    y: -150 - Math.random() * 100, // Lift up
                                    scale: 0,
                                    opacity: 0,
                                    rotate: item.rotation + 45,
                                    filter: "brightness(0.2) sepia(1)"
                                } : {
                                    y: item.y,
                                    x: item.x,
                                    opacity: 1,
                                    scale: item.scale,
                                    rotate: item.rotation,
                                    filter: "brightness(1) sepia(0)"
                                }}
                                exit={{ opacity: 0 }}
                                transition={isBurning ? {
                                    duration: 4,
                                    ease: "easeInOut",
                                    delay: Math.random() * 0.5 // Stagger lift
                                } : {
                                    type: "spring",
                                    damping: 15
                                }}
                            >
                                <ProceduralCrumpledPaper seed={item.seed} color={item.color} isBurning={isBurning} />
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Ash System */}
                    <AshSystem active={phase === "releasing"} />

                    {/* Fire System */}
                    <div className="absolute -bottom-8 w-full flex justify-center z-20">
                        <RitualFire intensity={isBurning ? 1 : 0} />
                    </div>
                </div>

                {/* 3. Front Reflection/Glass */}
                <div
                    className="absolute inset-0 rounded-[4rem] rounded-t-[1rem] border border-white/10 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-30"
                    style={{ transform: "translateZ(40px)" }}
                >
                    <div className="absolute top-8 right-8 w-24 h-48 bg-gradient-to-b from-white/20 to-transparent skew-x-12 opacity-40 blur-xl rounded-full" />
                </div>

                {/* Lid - Adjusted Width */}
                <div
                    className="absolute -top-4 left-1/2 -translate-x-1/2 w-80 h-8 bg-zinc-100/50 dark:bg-zinc-800/50 border border-white/30 rounded-full shadow-lg backdrop-blur-md z-20"
                    style={{ transform: "translateZ(20px)" }}
                />

            </motion.div>

            {/* --- CONTROLS & FEEDBACK --- */}

            {/* Burn Button */}
            <AnimatePresence>
                {items.length > 0 && phase === "idle" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                        className="absolute bottom-24 z-50"
                    >
                        <Button
                            onClick={startRitual}
                            className="relative group bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 px-8 py-6 rounded-full font-display tracking-widest uppercase text-sm shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all duration-500 ease-out"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Flame className="w-4 h-4 text-orange-500" />
                                Burn it all
                            </span>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-md" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Emotional Release Message */}
            <AnimatePresence>
                {phase === "cleared" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, transition: { duration: 1 } }}
                        className="absolute inset-0 flex items-center justify-center bg-white/40 dark:bg-black/40 backdrop-blur-[2px] z-50 pointer-events-none"
                    >
                        <div className="text-center space-y-4">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 1 }}
                            >
                                <Sparkles className="w-8 h-8 mx-auto text-amber-500/60 mb-4" />
                            </motion.div>
                            <h2 className="text-3xl md:text-4xl font-display font-light text-zinc-800 dark:text-zinc-100 tracking-wide">
                                It's safe to let this go.
                            </h2>
                            <p className="text-zinc-500 dark:text-zinc-400 font-light">
                                Breathe in. Breathe out.
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Footer */}
            <div className="absolute bottom-6 text-center opacity-30 hover:opacity-100 transition-opacity duration-500">
                <p className="font-display text-xs tracking-widest uppercase text-zinc-500">
                    {burnCount > 0 ? `${burnCount} worries released` : "A safe place for your thoughts"}
                </p>
            </div>
        </div>
    );
};
