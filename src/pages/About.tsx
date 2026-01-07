import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  GraduationCap,
  Heart,
  BookOpen,
  ArrowRight,
  Users,
  Sparkles,
  Shield,
  Brain,
  Coffee,
  MessageCircle,
  CheckCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { FAQ } from "@/components/shared/FAQ";

const offerings = [
  {
    icon: Heart,
    title: "Emotional Support Sessions",
    description: "A safe space to express yourself and navigate difficult emotions with guidance."
  },
  {
    icon: Brain,
    title: "Psychoeducation",
    description: "Learning resources to help you understand your mind and mental health better."
  },
  {
    icon: Coffee,
    title: "Stress & Lifestyle Management",
    description: "Practical strategies to manage anxiety and build a balanced lifestyle."
  },
  {
    icon: Sparkles,
    title: "Guided Self-Reflection",
    description: "Tools and prompts to deepen your self-awareness and personal growth."
  },
  {
    icon: MessageCircle,
    title: "Safe Conversations",
    description: "Open dialogue about relationships, confusion, and personal challenges."
  }
];

const whyUs = [
  "Created with genuine intent, not commercial pressure",
  "Grounded in psychology, empathy, and ethics",
  "A calm, welcoming alternative for those not ready for clinical therapy",
  "Focused on connection, awareness, and personal growth"
];

const credentials = [
  { icon: GraduationCap, text: "MA in Psychology (Candidate)" },
  { icon: Brain, text: "Mental Health Research & Psychoeducation" },
  { icon: Heart, text: "Emotional Support & Wellness Intervention" },
  { icon: Users, text: "Mental Health Advocacy" }
];

const About = () => {
  return (
    <Layout>
      <SEOHead
        title="About Us - Psyche Space"
        description="A safe, supportive, and non-judgmental space for emotional well-being. Meet Tamanna Dahiya and learn about our mission."
        keywords="about psyche space, mental health support, tamanna dahiya, emotional wellness, safe space"
      />

      {/* Hero Section */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-background to-background" />
          <div className="absolute top-0 right-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <div className="container-wide relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Sparkles className="w-4 h-4" />
              Healing is Possible
            </div>

            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-8 leading-tight">
              You’re Not <span className="text-gradient-animate">Alone.</span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-10 font-light">
              "Everyone deserves to feel heard, understood, and emotionally supported—without fear, stigma, or pressure."
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button variant="hero" size="lg" className="group min-w-[180px]" asChild>
                <Link to="/book">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Introduction / About Section */}
      <section className="py-20 bg-background relative">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-8">About Psyche Space</h2>
            <div className="prose-lg text-muted-foreground space-y-6 leading-relaxed">
              <p>
                Psyche Space is a thoughtfully created mental wellness platform dedicated to offering a
                <span className="text-foreground font-medium"> safe, supportive, and non-judgmental space</span> for individuals to pause,
                reflect, and understand themselves better.
              </p>
              <p>
                Rooted in psychological knowledge and guided by empathy, we bridge the gap between mental
                health awareness and everyday emotional well-being. We are not a clinical setup, but a
                guided wellness space where you can explore your thoughts and emotions in a respectful,
                confidential environment.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 md:py-28 bg-secondary/20">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 md:p-10 rounded-3xl bg-card border border-border/50 shadow-soft relative overflow-hidden group hover:border-primary/20 transition-all"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield className="w-24 h-24" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="w-8 h-1 rounded-full bg-primary" />
                Our Mission
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                To create an accessible, empathetic, and informed mental wellness space where individuals
                feel safe to express themselves, learn emotional skills, and build self-understanding—without
                judgment or labels.
              </p>
              <ul className="space-y-3">
                {["Normalize conversations around mental health", "Provide research-informed emotional support", "Encourage self-reflection and resilience"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 md:p-10 rounded-3xl bg-card border border-border/50 shadow-soft relative overflow-hidden group hover:border-accent/20 transition-all"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles className="w-24 h-24" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4 flex items-center gap-3">
                <span className="w-8 h-1 rounded-full bg-accent" />
                Our Vision
              </h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                To become a trusted mental wellness space for emotional awareness and growth, especially for
                young adults seeking clarity. We envision a world where seeking help is seen as strength.
              </p>
              <ul className="space-y-3">
                {["Support feels approachable and human", "Emotional well-being is part of everyday life", "Growth is always within reach"].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-20 md:py-28">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6">What We Offer</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Structured, psychology-informed services designed for your personal growth.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offerings.map((offer, index) => (
              <motion.div
                key={offer.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 md:p-8 rounded-2xl bg-secondary/10 border border-transparent hover:border-primary/20 hover:bg-secondary/20 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-background shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <offer.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{offer.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{offer.description}</p>
              </motion.div>
            ))}

            {/* Join Us Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: offerings.length * 0.1 }}
              className="p-6 md:p-8 rounded-2xl bg-primary text-primary-foreground flex flex-col justify-center items-center text-center"
            >
              <h3 className="font-display text-xl font-bold mb-3">Begin Your Journey</h3>
              <p className="text-sm text-primary-foreground/80 mb-6">Ready to prioritize your mental health?</p>
              <Button variant="secondary" size="sm" asChild>
                <Link to="/book">Get Started</Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Psyche Space */}
      <section className="py-20 bg-card border-y border-border/50">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="font-display text-3xl md:text-4xl font-bold mb-8"
              >
                Why Choose <br /><span className="text-gradient-animate">Psyche Space?</span>
              </motion.h2>
              <div className="space-y-6">
                {whyUs.map((reason, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-foreground/90 font-medium">{reason}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative aspect-video rounded-3xl bg-gradient-to-tr from-primary/20 to-accent/20 overflow-hidden flex items-center justify-center"
              >
                <div className="text-center p-8">
                  <h3 className="font-display text-2xl font-bold mb-2">"Psyche Space is your pause."</h3>
                  <p className="text-muted-foreground">Your reflection. Your safe space.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet the Founder */}
      <section className="py-20 md:py-28 overflow-hidden">
        <div className="container-wide">
          <div className="max-w-5xl mx-auto bg-secondary/30 rounded-[3rem] p-8 md:p-16 relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />

            <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
              <div className="w-full md:w-1/3">
                <div className="aspect-[4/5] rounded-3xl bg-card border border-border/50 shadow-elevated overflow-hidden relative group">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background to-secondary/50">
                    <span className="font-display text-9xl font-bold text-primary/10 select-none">T</span>
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-6 bg-background/80 backdrop-blur-md">
                    <p className="font-display text-xl font-bold">Tamanna Dahiya</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Founder</p>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-2/3">
                <h2 className="font-display text-3xl font-bold mb-6">Meet the Founder</h2>
                <div className="prose-calm text-muted-foreground space-y-4 mb-8">
                  <p>
                    Tamanna Dahiya is a mental health researcher and wellness advocate committed to making
                    emotional support accessible, ethical, and stigma-free.
                  </p>
                  <p>
                    With a strong academic foundation (MA in Psychology Candidate) and hands-on experience in
                    mental health initiatives, she founded Psyche Space to create a platform where evidence-based
                    understanding meets compassionate care.
                  </p>
                  <p>
                    Her work focuses on translating psychological research into practical, everyday tools,
                    ensuring that you always have a safe harbor for your unique journey.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {credentials.map((cred, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background/50 border border-border/50">
                      <cred.icon className="w-5 h-5 text-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground/80">{cred.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section (Kept as it adds value) */}
      <section className="py-20 md:py-24">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Clarifying our role in your journey.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            <FAQ />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-24 bg-secondary/30">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-muted-foreground mb-8">
              Take the first step toward healing. Book a free consultation to see
              if we're the right fit for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="group" asChild>
                <Link to="/book">
                  Book a Consultation
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/quiz">Take Self-Assessment</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default About;