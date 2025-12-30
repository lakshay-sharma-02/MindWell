import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Shield, Heart, Sparkles, Star } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  const features = [
    { icon: Shield, title: "Confidential", description: "Your privacy protected" },
    { icon: Heart, title: "Compassionate", description: "Judgment-free care" },
    { icon: Sparkles, title: "Personalized", description: "Tailored for you" },
    { icon: Star, title: "Evidence-Based", description: "Proven methods" },
  ];

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Subtle gradient background that blends with the page */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/50 to-background" />

      {/* Soft ambient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-x-1/2" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] translate-x-1/2" />
      </div>

      <div className="container-wide relative">
        <div className="max-w-5xl mx-auto">
          {/* Main CTA Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Card background with gradient border effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 rounded-3xl" />
            <div className="absolute inset-[1px] bg-card rounded-3xl" />

            <div className="relative p-8 md:p-12 lg:p-16">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left: Content */}
                <div className="text-center lg:text-left">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Limited Availability
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight"
                  >
                    Ready to Begin Your
                    <span className="text-gradient-animate block mt-1">Healing Journey?</span>
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto lg:mx-0"
                  >
                    Take the first step toward a healthier mind. Book a confidential
                    session and discover personalized strategies for your wellbeing.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
                  >
                    <Button
                      size="lg"
                      className="group shadow-card hover:shadow-elevated"
                      asChild
                    >
                      <Link to="/book">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Your Session
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      asChild
                    >
                      <Link to="/about">Learn More</Link>
                    </Button>
                  </motion.div>
                </div>

                {/* Right: Features Grid */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="grid grid-cols-2 gap-4"
                >
                  {features.map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.4 + index * 0.08 }}
                      className="group p-3 sm:p-5 rounded-2xl bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-primary/20 transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-medium text-sm sm:text-base text-foreground mb-1 break-words">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-8 mt-12 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-secondary border-2 border-background" />
                ))}
              </div>
              <span>500+ clients helped</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber text-amber" />
                ))}
              </div>
              <span>4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>100% Confidential</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}