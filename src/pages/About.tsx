import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { GraduationCap, Award, Heart, BookOpen, ArrowRight, Users, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FAQ } from "@/components/shared/FAQ";

const credentials = [
  { icon: GraduationCap, text: "MA in Psychology (Candidate)" },
  { icon: BookOpen, text: "Mental Health Researcher" },
  { icon: Heart, text: "Founder & Mental Health Advocate" }
];

const values = [
  {
    icon: Heart,
    title: "Compassion First",
    description: "We approach every interaction with genuine empathy and understanding."
  },
  {
    icon: Users,
    title: "Inclusive Care",
    description: "Creating a safe space for people of all backgrounds and identities."
  },
  {
    icon: Sparkles,
    title: "Evidence-Based",
    description: "Using proven therapeutic approaches backed by research."
  },
  {
    icon: Clock,
    title: "Your Pace",
    description: "Respecting your journey and moving at a pace that feels right for you."
  }
];

const About = () => {
  return (
    <Layout>
      <SEOHead
        title="About Us - Psyche Space"
        description="Learn about Tamanna and Psyche Space's mission to provide accessible, research-backed mental health support and community."
        keywords="about psyche space, tamanna, mental health researcher, psychology student, mental health support, anxiety resources"
      />

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <div className="container-wide relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Heart className="w-4 h-4" />
                Our Story
              </div>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Healing is Possible.
                <span className="text-gradient-animate block mt-2">You're Not Alone.</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
                At Psyche Space, we believe that mental health support should be accessible,
                research-backed, and deeply empathetic. Our mission is to bridge the gap
                between clinical science and everyday wellness, providing a safe harbor
                for your unique journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" className="group" asChild>
                  <Link to="/book">
                    Book a Session
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/contact">Get in Touch</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-3xl bg-gradient-to-br from-primary/20 via-secondary to-accent/10 overflow-hidden border border-border/50 shadow-elevated">
                {/* Decorative elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-primary" />
                  </div>
                </div>
                <div className="absolute bottom-0 inset-x-0 h-1/3 bg-gradient-to-t from-card to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-card/90 backdrop-blur-sm border border-border/50">
                  <p className="font-display text-lg font-semibold text-foreground mb-1">Tamanna</p>
                  <p className="text-sm text-muted-foreground">Founder & Researcher</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 md:py-24">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide everything we do at Psyche Space.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-card hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Dr. Mitchell */}
      <section className="py-20 md:py-24 bg-secondary/30">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1"
            >
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                Meet Tamanna
              </h2>
              <div className="prose-calm space-y-4 text-muted-foreground">
                <p>
                  Tamanna is a dedicated researcher and mental health advocate currently pursuing her
                  Master's in Psychology. Driven by a passion for accessible mental healthcare, she
                  founded Psyche Space to create a digital sanctuary for those seeking support.
                </p>
                <p>
                  Her work focuses on bridging the gap between clinical research and practical,
                  everyday tools for emotional well-being. She believes in the power of evidence-based
                  strategies combined with the warmth of human connection.
                </p>
                <p>
                  Through Psyche Space, Tamanna aims to de-stigmatize mental health conversations and
                  provide resources that empower individuals to take charge of their emotional journey
                  in a safe, non-judgmental space.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                {credentials.map((credential, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border/50"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <credential.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{credential.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/10 via-secondary to-accent/5 overflow-hidden border border-border/50 shadow-card">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <span className="font-display text-4xl font-bold text-primary">T</span>
                      </div>
                      <p className="font-display text-xl font-semibold text-foreground">Dedicated</p>
                      <p className="text-sm text-muted-foreground">to your well-being</p>
                    </div>
                  </div>
                </div>
                {/* Floating badge */}
                <div className="absolute -bottom-4 -right-4 px-4 py-2 rounded-xl bg-card border border-border/50 shadow-card">
                  <p className="text-sm font-medium text-foreground">Research-Backed Approach</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 md:py-24">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Have questions? We're here to help.
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