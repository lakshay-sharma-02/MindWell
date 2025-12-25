import { motion } from "framer-motion";

interface AnimatedGridProps {
  className?: string;
}

export function AnimatedGrid({ className = "" }: AnimatedGridProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Animated highlight lines */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        animate={{ y: [0, 400, 0] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-accent/50 to-transparent"
        animate={{ x: [0, 600, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />
    </div>
  );
}
