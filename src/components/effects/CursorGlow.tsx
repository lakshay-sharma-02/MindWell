import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
      document.body.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed pointer-events-none z-50 mix-blend-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            left: position.x - 150,
            top: position.y - 150,
            width: 300,
            height: 300,
            background: "radial-gradient(circle, hsl(158 35% 45% / 0.15) 0%, transparent 70%)",
          }}
        />
      )}
    </AnimatePresence>
  );
}
