import { motion } from "framer-motion";
import { Heart, Brain, Sparkles, Star, Leaf, Sun } from "lucide-react";

const items = [
  { text: "Anxiety Relief", icon: Brain },
  { text: "Self-Compassion", icon: Heart },
  { text: "Mindfulness", icon: Sparkles },
  { text: "Stress Management", icon: Star },
  { text: "Personal Growth", icon: Leaf },
  { text: "Mental Wellness", icon: Sun },
];

export function Marquee() {
  const duplicatedItems = [...items, ...items, ...items];

  return (
    <div className="py-6 overflow-hidden bg-secondary/30">
      <motion.div
        animate={{ x: ["0%", "-33.33%"] }}
        transition={{ 
          duration: 25, 
          repeat: Infinity, 
          ease: "linear" 
        }}
        className="flex gap-8 whitespace-nowrap"
      >
        {duplicatedItems.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2.5 text-muted-foreground/70"
          >
            <item.icon className="w-4 h-4 text-primary/60" />
            <span className="text-sm font-medium">{item.text}</span>
            <span className="text-primary/30">•</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
