import { motion } from "framer-motion";

interface GlowingBorderProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowingBorder({ children, className = "", glowColor = "primary" }: GlowingBorderProps) {
  return (
    <div className={`relative group ${className}`}>
      {/* Glow effect */}
      <motion.div
        className={`absolute -inset-0.5 bg-gradient-to-r from-${glowColor} via-accent to-${glowColor} rounded-2xl blur-lg opacity-0 group-hover:opacity-60 transition-opacity duration-500`}
        animate={{
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          backgroundSize: "200% 200%",
        }}
      />
      
      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </div>
  );
}
