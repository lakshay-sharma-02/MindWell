import { motion } from "framer-motion";

interface GradientOrbsProps {
  variant?: "hero" | "section" | "subtle";
}

export function GradientOrbs({ variant = "hero" }: GradientOrbsProps) {
  const configs = {
    hero: [
      { position: "top-20 -right-20", size: "w-[500px] h-[500px]", gradient: "from-primary/40 via-cyan/30 to-transparent", delay: 0 },
      { position: "top-40 -left-32", size: "w-[400px] h-[400px]", gradient: "from-terracotta/30 via-amber/20 to-transparent", delay: 2 },
      { position: "-bottom-32 left-1/4", size: "w-[450px] h-[450px]", gradient: "from-violet/30 via-rose/20 to-transparent", delay: 4 },
      { position: "top-1/2 right-1/4", size: "w-[300px] h-[300px]", gradient: "from-cyan/20 to-transparent", delay: 1 },
    ],
    section: [
      { position: "top-10 -right-20", size: "w-72 h-72", gradient: "from-primary/20 to-transparent", delay: 0 },
      { position: "bottom-10 -left-20", size: "w-64 h-64", gradient: "from-accent/20 to-transparent", delay: 1 },
    ],
    subtle: [
      { position: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", size: "w-[600px] h-[600px]", gradient: "from-primary/10 via-transparent to-transparent", delay: 0 },
    ],
  };

  const orbs = configs[variant];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {orbs.map((orb, index) => (
        <motion.div
          key={index}
          className={`absolute ${orb.position} ${orb.size} rounded-full bg-gradient-radial ${orb.gradient} blur-3xl`}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            delay: orb.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
