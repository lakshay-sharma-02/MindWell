import { Shield, Lock, Award, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const badges = [
  { icon: Shield, label: "HIPAA Compliant" },
  { icon: Lock, label: "256-bit Encrypted" },
  { icon: Award, label: "APA Certified" },
  { icon: CheckCircle, label: "Licensed Professional" },
];

export function TrustBadges() {
  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
      {badges.map((badge, index) => (
        <motion.div
          key={badge.label}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.08, duration: 0.4 }}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-card dark:bg-secondary/30 border border-border/50 shadow-soft"
        >
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <badge.icon className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-medium text-foreground">{badge.label}</span>
        </motion.div>
      ))}
    </div>
  );
}