import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Brain,
  Heart,
  Users,
  Sparkles,
  ArrowRight,
  Check,
  Clock,
  Video,
  Shield,
  Award,
  Leaf,
  MessageCircle
} from "lucide-react";
import { BentoCard, BentoGrid } from "@/components/shared/BentoGrid";
import { useAdminEdit } from "@/hooks/useAdminEdit";


const services = [
  {
    icon: Brain,
    title: "Cognitive Behavioral Therapy",
    shortTitle: "CBT",
    description: "Evidence-based approach to identify and change negative thought patterns. Perfect for anxiety, depression, and stress management.",
    benefits: ["Structured approach", "Measurable progress", "Practical tools"],
    color: "from-primary/20 to-cyan/20",
    popular: true
  },
  {
    icon: Leaf,
    title: "Acceptance & Commitment Therapy",
    shortTitle: "ACT",
    description: "Learn to accept difficult emotions while committing to actions aligned with your values.",
    benefits: ["Mindfulness-based", "Values-driven", "Flexible techniques"],
    color: "from-accent/20 to-amber/20"
  },
  {
    icon: Sparkles,
    title: "EMDR Therapy",
    shortTitle: "EMDR",
    description: "Specialized treatment for trauma and PTSD using bilateral stimulation to process difficult memories.",
    benefits: ["Trauma-focused", "Research-backed", "Rapid results"],
    color: "from-violet/20 to-rose/20"
  },
  {
    icon: Users,
    title: "Couples Therapy",
    shortTitle: "Couples",
    description: "Strengthen your relationship through improved communication, conflict resolution, and deeper connection.",
    benefits: ["Joint sessions", "Communication tools", "Relationship building"],
    color: "from-rose/20 to-primary/20"
  },
  {
    icon: MessageCircle,
    title: "Individual Counseling",
    shortTitle: "Individual",
    description: "One-on-one support tailored to your unique needs, goals, and personal growth journey.",
    benefits: ["Personalized care", "Safe space", "Flexible focus"],
    color: "from-cyan/20 to-indigo/20"
  },
  {
    icon: Heart,
    title: "Mindfulness & Wellness",
    shortTitle: "Mindfulness",
    description: "Develop present-moment awareness and stress reduction techniques for lasting peace.",
    benefits: ["Stress relief", "Self-awareness", "Daily practices"],
    color: "from-amber/20 to-accent/20"
  }
];



import { useState, lazy, Suspense } from "react";
import { Tables } from "@/types/database";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Loader2, Trash2, Pencil } from "lucide-react";
import { SectionErrorBoundary } from "@/components/shared/SectionErrorBoundary";
import { useServices } from "@/hooks/useServices";
import { ServiceValues } from "@/lib/schemas/serviceSchema";

const ServiceForm = lazy(() => import("@/components/admin/forms/ServiceForm").then(module => ({ default: module.ServiceForm })));

type Service = Tables<"booking_services">;

const Services = () => {
  const { isEditMode } = useAdminEdit();
  // Using the new React Query hook
  const { services: pricingPlans, isLoading, createService, updateService, deleteService } = useServices();

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  const handleSave = async (data: ServiceValues) => {
    // The data coming from Zod form
    const featuresArray = data.features.split("\n").filter((f: string) => f.trim() !== "");

    const payload = {
      title: data.title,
      duration: data.duration,
      price: data.price,
      description: data.description,
      features: featuresArray,
      popular: data.popular
    };

    try {
      if (editingService) {
        await updateService.mutateAsync({ id: editingService.id, ...payload });
      } else {
        await createService.mutateAsync(payload);
      }

      setEditingService(null);
      setIsAdding(false);
    } catch (error) {
      // Error handling is done in the hook via toast
      console.error("Mutation failed", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteService.mutateAsync(id);
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  return (
    <Layout>
      <SEOHead
        title="Services"
        description="Explore our range of therapy services including CBT, ACT, EMDR, couples therapy, and mindfulness counseling. Find the right approach for your mental health journey."
        keywords="therapy services, CBT, EMDR, couples therapy, mindfulness, counseling, mental health treatment"
      />

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/30 to-background" />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 15, repeat: Infinity }}
            className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1.1, 1, 1.1], opacity: [0.08, 0.15, 0.08] }}
            transition={{ duration: 18, repeat: Infinity, delay: 5 }}
            className="absolute bottom-[10%] left-[5%] w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px]"
          />
        </div>

        <div className="container-wide relative">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Award className="w-4 h-4" />
              Evidence-Based Approaches
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6"
            >
              Therapy That{" "}
              <span className="text-gradient-animate">Works for You</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg md:text-xl text-muted-foreground mb-8"
            >
              Every journey is unique. Explore our range of evidence-based
              therapeutic approaches to find what resonates with your needs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button variant="hero" size="xl" className="btn-glow" asChild>
                <Link to="/book">
                  Book a Consultation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <a href="#pricing">View Pricing</a>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-secondary/20">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Therapeutic Approaches
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each modality offers unique benefits. We'll help you find the right fit.
            </p>
          </motion.div>

          <BentoGrid className="lg:grid-cols-3">
            {services.map((service, index) => (
              <BentoCard
                key={service.title}
                title={service.title}
                description={service.description}
                icon={<service.icon className="w-6 h-6 text-primary" />}
                gradient={service.color}
                className={service.popular ? "ring-2 ring-primary/20" : ""}
              >
                {service.popular && (
                  <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                    Popular
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  {service.benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary" />
                      {benefit}
                    </div>
                  ))}
                </div>
              </BentoCard>
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Getting started is simple. Here's what to expect.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Book a Consultation",
                description: "Schedule a free 15-minute call to discuss your needs and see if we're a good fit.",
                icon: Clock
              },
              {
                step: "02",
                title: "Choose Your Approach",
                description: "Together, we'll determine the therapeutic approach that best suits your goals.",
                icon: Sparkles
              },
              {
                step: "03",
                title: "Begin Your Journey",
                description: "Start your sessions in-person or via secure video call at your convenience.",
                icon: Heart
              }
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-border to-transparent" />
                )}
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-xs font-medium text-primary mb-2">Step {item.step}</div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <SectionErrorBoundary name="Services Pricing">
        <section id="pricing" className="section-padding bg-secondary/20">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12 relative"
            >
              {isEditMode && (
                <div className="absolute top-0 right-0 z-10">
                  <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
                    <Plus className="w-4 h-4" /> Add Service
                  </Button>
                </div>
              )}
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Simple, Transparent Pricing
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Invest in your wellbeing. All plans include our commitment to your growth.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.id || plan.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-card rounded-2xl p-6 transition-all duration-300 hover:shadow-card ${plan.popular
                    ? "gradient-border pulse-glow shadow-glow border-transparent"
                    : "border border-border/50 hover:border-primary/30"
                    }`}
                >
                  {/* Visual Cue for Edit Mode */}
                  {isEditMode && (
                    <div className="absolute -right-3 -top-3 z-20 flex gap-1">
                      <div
                        className="cursor-pointer hover:scale-110 transition-transform bg-amber-500 text-white p-2 rounded-full shadow-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          setEditingService(plan);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </div>

                      {plan.id && (
                        <div
                          className="cursor-pointer hover:scale-110 transition-transform bg-destructive text-white p-2 rounded-full shadow-lg"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDelete(plan.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  )}
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      Most Popular
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <h3 className="font-display text-xl font-semibold text-foreground mb-1">{plan.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{plan.duration}</p>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-display font-bold text-foreground">{plan.price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{plan.description}</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {(plan.features || []).map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full"
                    asChild
                  >
                    <Link to="/book">Get Started</Link>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Edit/Add Dialog */}
            <Dialog open={!!editingService || isAdding} onOpenChange={(open) => { if (!open) { setEditingService(null); setIsAdding(false); } }}>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>{editingService ? "Edit Service" : "Add Service"}</DialogTitle>
                </DialogHeader>
                <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
                  <ServiceForm
                    initialData={editingService}
                    onSubmit={handleSave}
                    isSubmitting={createService.isPending || updateService.isPending}
                    onCancel={() => { setEditingService(null); setIsAdding(false); }}
                  />
                </Suspense>
              </DialogContent>
            </Dialog>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-6 mt-12"
            >
              {[
                { icon: Shield, text: "HIPAA Compliant" },
                { icon: Video, text: "Secure Video Sessions" },
                { icon: Clock, text: "Flexible Scheduling" }
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <item.icon className="w-4 h-4 text-primary" />
                  {item.text}
                </div>
              ))}
            </motion.div>
          </div>
        </section>
      </SectionErrorBoundary>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Take the First Step?
            </h2>
            <p className="text-muted-foreground mb-8">
              Your wellbeing matters. Let's start this journey together with a free consultation.
            </p>
            <Button variant="hero" size="xl" className="btn-glow" asChild>
              <Link to="/book">
                Schedule Free Consultation
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
