
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Heart, Brain, Users, Sparkles, BookOpen, User } from "lucide-react";

export default function About() {
  const missionPoints = [
    {
      icon: Heart,
      text: "To provide a safe and supportive space for emotional expression and self-exploration"
    },
    {
      icon: Brain,
      text: "To promote mental health awareness through psychological knowledge and compassionate care"
    },
    {
      icon: Users,
      text: "To offer ethical, informed, and student-led psychological services grounded in empathy and professionalism"
    },
    {
      icon: Sparkles,
      text: "To help individuals build clarity, resilience, and emotional well-being in everyday life"
    }
  ];

  return (
    <Layout>
      <SEOHead
        title="About Us - Psyche Space"
        description="Psyche Space is a safe, thoughtful, and inclusive mental health platform created with the belief that every mind deserves understanding, care, and space to heal."
        keywords="psyche space, mental health, psychology student, empathy, inclusive platform, healing"
      />

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden bg-secondary/20">
        <div className="container-wide relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Welcome to Psyche Space
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8 leading-tight">
              A Space to Pause, Reflect, <br />
              <span className="text-gradient-animate">Heal, and Reconnect.</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Because your mind deserves care, and your story deserves to be heard.
            </p>
          </motion.div>
        </div>
      </section>

      {/* About Content */}
      <section className="py-20 bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=2487&auto=format&fit=crop"
                  alt="A thoughtful moment"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 text-white max-w-xs">
                  <p className="font-display font-medium text-lg">"Rooted in science, guided by empathy."</p>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl -z-10" />
              <div className="absolute -top-10 -left-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl -z-10" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">About Psyche Space</h2>
                <div className="space-y-4 text-muted-foreground text-lg leading-relaxed">
                  <p>
                    Psyche Space is a safe, thoughtful, and inclusive mental health platform created with the belief that every mind deserves understanding, care, and space to heal. Rooted in psychological science and guided by empathy, Psyche Space aims to support individuals in navigating emotions, challenges, and personal growth in a non-judgmental environment.
                  </p>
                  <p>
                    Built by a psychology student with a deep passion for mental well-being, Psyche Space blends academic knowledge with human connection—because healing is not just about theories, but about being heard, understood, and supported.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50">
                <h3 className="font-display text-xl font-semibold mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Our Vision
                </h3>
                <p className="text-muted-foreground">
                  To create a world where mental health conversations are normal, accessible, and free from stigma—where individuals feel empowered to understand themselves, seek help, and grow at their own pace.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-primary/5">
        <div className="container-wide">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">Our Mission</h2>
            <p className="text-xl text-muted-foreground">
              Psyche Space is not just a service—it is a space to pause, reflect, heal, and reconnect with yourself.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {missionPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <point.icon className="w-6 h-6" />
                </div>
                <p className="text-lg font-medium text-foreground">{point.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}