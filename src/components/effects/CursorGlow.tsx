import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const requestRef = useRef<number>();
  const positionRef = useRef({ x: 0, y: 0 });

  const updatePosition = useCallback(() => {
    setPosition({ ...positionRef.current });
    requestRef.current = undefined;
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia("(max-width: 768px)").matches;
      setIsMobile(mobile);
    };

    checkMobile();
    const resizeListener = () => checkMobile();
    window.addEventListener("resize", resizeListener);

    const handleMouseMove = (e: MouseEvent) => {
      positionRef.current = { x: e.clientX, y: e.clientY };
      setIsVisible(true);

      if (!requestRef.current) {
        requestRef.current = requestAnimationFrame(updatePosition);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    if (!isMobile) {
      window.addEventListener("mousemove", handleMouseMove);
      document.body.addEventListener("mouseleave", handleMouseLeave);
    }

    return () => {
      window.removeEventListener("resize", resizeListener);
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isMobile, updatePosition]);

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
