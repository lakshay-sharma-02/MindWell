import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface TextRevealProps {
  children: string;
  className?: string;
  delay?: number;
  wordByWord?: boolean;
}

export function TextReveal({ children, className = "", delay = 0, wordByWord = false }: TextRevealProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  if (wordByWord) {
    const words = children.split(" ");
    
    return (
      <span ref={ref} className={className}>
        {words.map((word, i) => (
          <span key={i} className="inline-block overflow-hidden">
            <motion.span
              className="inline-block"
              initial={{ y: "100%", opacity: 0 }}
              animate={inView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
              transition={{
                duration: 0.5,
                delay: delay + i * 0.05,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
            >
              {word}
            </motion.span>
            {i < words.length - 1 && " "}
          </span>
        ))}
      </span>
    );
  }

  // Character by character
  const characters = children.split("");

  return (
    <span ref={ref} className={className}>
      {characters.map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.3,
            delay: delay + i * 0.02,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
