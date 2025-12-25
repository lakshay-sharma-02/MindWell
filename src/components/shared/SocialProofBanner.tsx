import { motion } from "framer-motion";
import { Users, Star, Shield, Award } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

export function SocialProofBanner() {
  const stats = [
    { icon: Users, value: 1247, suffix: "+", label: "Clients Helped" },
    { icon: Star, value: 4.9, suffix: "", label: "Average Rating", isDecimal: true },
    { icon: Shield, value: 100, suffix: "%", label: "Confidential" },
    { icon: Award, value: 15, suffix: "+", label: "Years Experience" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="py-8 border-y border-border/50 bg-secondary/30"
    >
      <div className="container-wide">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 mb-3">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                {stat.isDecimal ? (
                  <span>{stat.value}</span>
                ) : (
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                )}
                {stat.isDecimal && <Star className="w-4 h-4 inline-block ml-1 text-amber fill-current" />}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
