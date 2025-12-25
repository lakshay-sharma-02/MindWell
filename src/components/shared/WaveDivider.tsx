import { motion } from "framer-motion";

interface WaveDividerProps {
  variant?: "wave" | "curve" | "slant" | "mountains";
  flip?: boolean;
  className?: string;
  color?: string;
}

export function WaveDivider({ 
  variant = "wave", 
  flip = false, 
  className = "",
  color = "hsl(var(--background))"
}: WaveDividerProps) {
  const paths = {
    wave: "M0,64L48,69.3C96,75,192,85,288,101.3C384,117,480,139,576,133.3C672,128,768,96,864,85.3C960,75,1056,85,1152,101.3C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
    curve: "M0,160L48,165.3C96,171,192,181,288,181.3C384,181,480,171,576,149.3C672,128,768,96,864,96C960,96,1056,128,1152,144C1248,160,1344,160,1392,160L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
    slant: "M0,256L1440,64L1440,320L0,320Z",
    mountains: "M0,224L120,213.3C240,203,480,181,720,181.3C960,181,1200,203,1320,213.3L1440,224L1440,320L1320,320C1200,320,960,320,720,320C480,320,240,320,120,320L0,320Z"
  };

  return (
    <div className={`w-full overflow-hidden leading-none ${flip ? 'rotate-180' : ''} ${className}`}>
      <motion.svg
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="relative block w-full h-16 md:h-24"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
      >
        <path
          fill={color}
          fillOpacity="1"
          d={paths[variant]}
        />
      </motion.svg>
    </div>
  );
}
