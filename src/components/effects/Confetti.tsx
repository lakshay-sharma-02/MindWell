import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiPiece {
  id: number;
  x: number;
  color: string;
  rotation: number;
  scale: number;
}

interface ConfettiProps {
  active: boolean;
  onComplete?: () => void;
}

const colors = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(var(--sage))",
  "hsl(var(--terracotta))",
  "hsl(var(--cream))",
];

export function Confetti({ active, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (active) {
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < 50; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * 100,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
        });
      }
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  return (
    <AnimatePresence>
      {pieces.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={piece.id}
              className="absolute w-3 h-3 rounded-sm"
              style={{
                left: `${piece.x}%`,
                backgroundColor: piece.color,
                scale: piece.scale,
              }}
              initial={{ y: -20, rotate: 0, opacity: 1 }}
              animate={{
                y: window.innerHeight + 100,
                rotate: piece.rotation + 720,
                opacity: [1, 1, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2 + Math.random(),
                ease: "easeIn",
                delay: Math.random() * 0.5,
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}
