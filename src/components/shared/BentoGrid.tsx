import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
  gradient?: string;
}

export function BentoCard({ 
  title, 
  description, 
  icon, 
  className,
  children,
  gradient = "from-primary/10 to-accent/10"
}: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "relative group rounded-2xl bg-card border border-border/50 p-6 overflow-hidden",
        "hover:border-primary/30 hover:shadow-card transition-all duration-500",
        className
      )}
    >
      {/* Gradient overlay on hover */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
        gradient
      )} />
      
      {/* Shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      <div className="relative z-10">
        {icon && (
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            {icon}
          </div>
        )}
        <h3 className="font-display text-xl font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        {children}
      </div>
    </motion.div>
  );
}

interface BentoGridProps {
  children: ReactNode;
  className?: string;
}

export function BentoGrid({ children, className }: BentoGridProps) {
  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6",
      className
    )}>
      {children}
    </div>
  );
}
