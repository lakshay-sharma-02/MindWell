
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw } from "lucide-react";

export function BreathingExercise() {
    const [isActive, setIsActive] = useState(false);
    const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "idle">("idle");
    const [instruction, setInstruction] = useState("Ready to relax?");
    const [timer, setTimer] = useState(0);

    // 4-7-8 Technique
    const PHASE_durations = {
        inhale: 4000,
        hold: 7000,
        exhale: 8000,
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isActive) {
            const runCycle = async () => {
                // Inhale
                setPhase("inhale");
                setInstruction("Inhale deeply...");
                await new Promise((r) => setTimeout(r, PHASE_durations.inhale));
                if (!isActive) return;

                // Hold
                setPhase("hold");
                setInstruction("Hold your breath...");
                await new Promise((r) => setTimeout(r, PHASE_durations.hold));
                if (!isActive) return;

                // Exhale
                setPhase("exhale");
                setInstruction("Exhale slowly...");
                await new Promise((r) => setTimeout(r, PHASE_durations.exhale));

                // Loop is handled by useEffect dependency or recursion, 
                // but simple recursion here might cause state update on unmount warnings if not careful.
                // Let's just rely on a cycle trigger.
                setTimer(t => t + 1);
            };

            runCycle();
        } else {
            setPhase("idle");
            setInstruction("Ready to relax?");
        }

        return () => clearTimeout(interval);
    }, [isActive, timer]); // timer change triggers next cycle

    const stop = () => {
        setIsActive(false);
        setPhase("idle");
        setInstruction("Ready to relax?");
    };

    return (
        <div className="relative py-12 px-6 rounded-3xl overflow-hidden bg-gradient-to-br from-cyan-500/5 to-teal-500/10 border border-teal-500/20 text-center">

            {/* Animation Circle */}
            <div className="relative h-64 flex items-center justify-center mb-8">
                {/* Outer Glow */}
                <motion.div
                    animate={{
                        scale: phase === "inhale" ? 1.5 : phase === "exhale" ? 1 : 1.2,
                        opacity: phase === "idle" ? 0.3 : 0.5,
                    }}
                    transition={{ duration: phase === "inhale" ? 4 : phase === "exhale" ? 8 : 0.5, ease: "easeInOut" }}
                    className="absolute w-40 h-40 rounded-full bg-cyan-400/20 blur-2xl"
                />

                {/* Main Circle */}
                <motion.div
                    animate={{
                        scale: phase === "inhale" ? 1.5 : phase === "exhale" ? 1 : 1,
                    }}
                    transition={{ duration: phase === "inhale" ? 4 : phase === "exhale" ? 8 : 0.5, ease: "easeInOut" }}
                    className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 z-10"
                >
                    <span className="text-white font-medium text-lg font-display tracking-widest uppercase">
                        {phase === "idle" ? "Start" : phase}
                    </span>
                </motion.div>

                {/* Orbit Particle */}
                {isActive && (
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 19, ease: "linear", repeat: Infinity }}
                        className="absolute w-64 h-64 rounded-full border border-teal-500/30 border-dashed"
                    />
                )}
            </div>

            <h3 className="text-2xl font-bold mb-2 font-display min-h-[2rem] transition-all">
                {instruction}
            </h3>
            <p className="text-muted-foreground mb-8 text-sm">
                Follow the rhythm: Inhale (4s), Hold (7s), Exhale (8s).
            </p>

            <div className="flex justify-center gap-4">
                {!isActive ? (
                    <Button onClick={() => setIsActive(true)} size="lg" className="rounded-full px-8 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg shadow-cyan-500/20">
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        Begin Exercise
                    </Button>
                ) : (
                    <Button onClick={stop} variant="secondary" size="lg" className="rounded-full px-8">
                        <Pause className="w-5 h-5 mr-2 fill-current" />
                        Stop
                    </Button>
                )}
            </div>
        </div>
    );
}
