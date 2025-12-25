import { motion } from "framer-motion";

interface FloatingParticlesProps {
  count?: number;
  colors?: string[];
}

export function FloatingParticles({ 
  count = 20, 
  colors = ["bg-primary/20", "bg-accent/20", "bg-violet/20", "bg-rose/20"] 
}: FloatingParticlesProps) {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 4,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute rounded-full ${particle.color} blur-sm`}
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, 0],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
