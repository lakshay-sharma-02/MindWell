import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Quote, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/types/database";
import { testimonials as staticTestimonials, Testimonial } from "@/data/testimonials";

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [items, setItems] = useState<Testimonial[]>(staticTestimonials);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        // Transform DB data to match Testimonial interface
        const mappedTestimonials: Testimonial[] = data.map(t => ({
          id: t.id,
          name: t.name,
          role: t.role || "Client",
          content: t.content,
          rating: t.rating || 5,
          // Use image if available, else generate initials
          avatar: t.image || t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
          verified: true // Assume DB testimonials are verified by admin
        }));
        setItems(mappedTestimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Fallback to static is already initial state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  const next = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prev = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-secondary/20 to-background" />
      <div className="absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]"
        />
      </div>

      <div className="container-wide relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber/10 text-amber text-sm font-medium mb-4"
          >
            <Star className="w-4 h-4 fill-current" />
            4.9 Average Rating
          </motion.div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            Stories of Growth
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Real experiences from people who found their path to wellness.
          </p>
        </motion.div>

        {/* Testimonial Card */}
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 30, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.98 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <div className="bg-card rounded-3xl p-8 md:p-12 shadow-card border border-border/50 relative overflow-hidden">
                  {/* Decorative quote */}
                  <div className="absolute top-6 right-6 md:top-8 md:right-8">
                    <Quote className="w-16 h-16 md:w-20 md:h-20 text-primary/5" />
                  </div>

                  {/* Animated stars */}
                  <div className="flex gap-1.5 mb-6">
                    {Array.from({ length: items[currentIndex].rating }).map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <Star className="w-5 h-5 text-amber fill-current" />
                      </motion.div>
                    ))}
                  </div>

                  {/* Content */}
                  <blockquote className="text-xl md:text-2xl lg:text-3xl text-foreground leading-relaxed mb-8 font-display relative z-10">
                    "{items[currentIndex].content}"
                  </blockquote>

                  {/* Author with verified badge */}
                  <div className="flex items-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-lg shadow-glow"
                    >
                      {items[currentIndex].avatar}
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {items[currentIndex].name}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {items[currentIndex].role}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={prev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-16 p-3 rounded-full bg-card shadow-card hover:shadow-elevated transition-all border border-border/50 hover:border-primary/30"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={next}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-16 p-3 rounded-full bg-card shadow-card hover:shadow-elevated transition-all border border-border/50 hover:border-primary/30"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-foreground" />
            </motion.button>
          </div>

          {/* Dots indicator with progress */}
          <div className="flex justify-center gap-2 mt-8">
            {items.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsAutoPlaying(false);
                  setCurrentIndex(index);
                }}
                className="relative h-2 rounded-full overflow-hidden transition-all duration-500"
                style={{ width: index === currentIndex ? 32 : 8 }}
                aria-label={`Go to testimonial ${index + 1}`}
              >
                <span className="absolute inset-0 bg-muted-foreground/20" />
                {index === currentIndex && (
                  <motion.span
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 6, ease: "linear" }}
                    className="absolute inset-0 bg-primary"
                  />
                )}
                {index !== currentIndex && (
                  <span className="absolute inset-0 bg-muted-foreground/30 hover:bg-muted-foreground/50 transition-colors" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
