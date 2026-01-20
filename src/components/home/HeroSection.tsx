import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart, Sparkles, Users, BookOpen, Headphones, Star } from "lucide-react";
import { motion, useSpring, useTransform } from "framer-motion";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useMousePosition } from "@/hooks/useMousePosition";
import { useEffect } from "react";

export function HeroSection() {
  const { settings } = useSiteSettings();
  const hero = settings.landing_page.hero;
  const { x, y } = useMousePosition();

  // Smooth out mouse movements for parallax
  const springConfig = { damping: 25, stiffness: 120 };
  const mouseX = useSpring(0, springConfig);
  const mouseY = useSpring(0, springConfig);

  useEffect(() => {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    mouseX.set(x - centerX);
    mouseY.set(y - centerY);
  }, [x, y, mouseX, mouseY]);

  // Parallax transforms - different elements move at different speeds
  const moveX1 = useTransform(mouseX, [-500, 500], [20, -20]);
  const moveY1 = useTransform(mouseY, [-500, 500], [20, -20]);

  const moveX2 = useTransform(mouseX, [-500, 500], [-30, 30]);
  const moveY2 = useTransform(mouseY, [-500, 500], [-30, 30]);

  const moveX3 = useTransform(mouseX, [-500, 500], [15, -15]);
  const moveY3 = useTransform(mouseY, [-500, 500], [15, -15]);

  const stats = [
    { icon: Users, value: 1200, suffix: "+", label: "Clients Helped" },
    { icon: BookOpen, value: 50, suffix: "+", label: "Resources" },
    { icon: Headphones, value: 24, suffix: "", label: "Podcast Episodes" },
  ];

  return (
    <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-background">
      {/* Elegant mesh gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-teal-950/20" />

        {/* Animated mesh overlay */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-0 right-0 w-full h-full bg-mesh-gradient dark:bg-dark-mesh opacity-30 mix-blend-overlay" />
        </div>

        {/* Primary glowing orb - Parallax Layer 1 */}
        <motion.div
          style={{ x: moveX1, y: moveY1 }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[5%] right-[5%] w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[120px]"
        />

        {/* Accent orb - Parallax Layer 2 */}
        <motion.div
          style={{ x: moveX2, y: moveY2 }}
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 5 }}
          className="absolute bottom-[0%] left-[0%] w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[130px]"
        />

        {/* Tertiary glow - Parallax Layer 3 */}
        <motion.div
          style={{ x: moveX3, y: moveY3 }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.08, 0.15, 0.08]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 10 }}
          className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]"
        />
      </div>

      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Vertical lines */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 0.3, height: 120 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute top-[20%] left-[12%] w-px bg-gradient-to-b from-transparent via-teal-500/30 to-transparent"
        />
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 0.2, height: 80 }}
          transition={{ delay: 1.3, duration: 1 }}
          className="absolute top-[30%] right-[18%] w-px bg-gradient-to-b from-transparent via-cyan-500/25 to-transparent"
        />

        {/* Floating particles - React to mouse */}
        {[...Array(8)].map((_, i) => (
          <div
            key={`particle-wrapper-${i}`}
            className="absolute"
            style={{
              left: `${10 + i * 12}%`,
              top: `${35 + Math.sin(i * 2) * 25}%`
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, delay: i }}
              style={{
                x: useTransform(mouseX, [-500, 500], [i * 3, i * -3]),
                y: useTransform(mouseY, [-500, 500], [i * 3, i * -3]),
              }}
              className="w-1 h-1 rounded-full bg-teal-400/50"
            />
          </div>
        ))}
      </div>

      <div className="container-wide relative z-10">
        <div className="max-w-4xl mx-auto text-center py-16 md:py-20">
          {/* Trust indicator badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 mb-8"
          >
            <motion.span
              whileHover={{ scale: 1.02 }}
              className="px-4 py-1.5 rounded-full bg-teal-950/30 backdrop-blur-md border border-teal-500/20 text-teal-200 text-sm font-medium flex items-center gap-2 shadow-[0_0_15px_-3px_rgba(20,184,166,0.2)]"
            >
              <Heart className="w-3.5 h-3.5 fill-teal-500/50 text-teal-400" />
              {hero.badge_text}
              <span className="w-px h-3 bg-teal-500/20 mx-1" />
              <span className="flex items-center gap-1 text-teal-100">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {hero.badge_rating}
              </span>
            </motion.span>
          </motion.div>

          {/* Main heading with animated reveal */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="font-display text-balance text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-[1.1] mb-8 tracking-tight"
          >
            {hero.title_line_1}
            <br />
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-400 bg-300% animate-gradient relative inline-block pb-2"
            >
              {hero.title_highlight}
              {/* Underline decoration */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 1, duration: 1, ease: "easeOut" }}
                className="absolute bottom-1 left-0 h-[4px] bg-gradient-to-r from-teal-500/0 via-teal-500/50 to-teal-500/0 rounded-full"
              />
            </motion.span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg md:text-xl text-balance text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto"
          >
            {hero.description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20 items-center"
          >
            <Button
              size="xl"
              className="rounded-full px-8 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white shadow-[0_4px_20px_-4px_rgba(20,184,166,0.3)] hover:shadow-[0_8px_30px_-4px_rgba(20,184,166,0.4)] transition-all duration-300 transform border-0"
              asChild
            >
              <Link to="/book">
                {hero.cta_primary}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>

            <Button
              variant="outline"
              size="xl"
              className="rounded-full px-8 border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 text-teal-300 hover:text-teal-200 transition-all duration-300"
              asChild
            >
              <Link to="/resources">
                <Sparkles className="w-4 h-4 mr-2" />
                {hero.cta_secondary}
              </Link>
            </Button>
          </motion.div>

          {/* Animated Stats */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="flex flex-wrap justify-center gap-4 md:gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 + index * 0.1 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card/60 backdrop-blur-md border border-white/5 md:border-teal-500/10 shadow-lg shadow-black/5 hover:shadow-teal-500/5 hover:border-teal-500/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <stat.icon className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="font-display text-lg font-bold text-foreground block leading-none mb-1">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} duration={2.5} />
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
        onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50">Scroll</span>
          <div className="w-px h-12 bg-gradient-to-b from-teal-500/0 via-teal-500/40 to-teal-500/0" />
        </motion.div>
      </motion.div>
    </section>
  );
}
