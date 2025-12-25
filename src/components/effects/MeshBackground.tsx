import { motion } from "framer-motion";

export function MeshBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background" />
      
      {/* Mesh gradient overlay */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{
          background: `
            radial-gradient(at 0% 0%, hsl(158 40% 90% / 0.4) 0px, transparent 50%),
            radial-gradient(at 100% 0%, hsl(12 80% 92% / 0.3) 0px, transparent 50%),
            radial-gradient(at 100% 100%, hsl(263 70% 94% / 0.3) 0px, transparent 50%),
            radial-gradient(at 0% 100%, hsl(190 90% 90% / 0.3) 0px, transparent 50%)
          `,
        }}
      />
      
      {/* Animated orbs */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </div>
  );
}
