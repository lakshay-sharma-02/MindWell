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
import { useAdmin } from "@/contexts/AdminContext";
import { Pencil } from "lucide-react";

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



import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/types/database";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type Service = Tables<"booking_services">;

const Services = () => {
  const { isEditMode } = useAdmin();
  const [pricingPlans, setPricingPlans] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    duration: "",
    price: "",
    description: "",
    features: "",
    popular: false
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("booking_services")
        .select("*")
        .order("price", { ascending: true }); // Order by price or creation

      if (error) throw error;

      // If data is empty (first run), might want to seed or just show empty. 
      // For now, let's assume if empty we fallback to static or just show empty.
      if (data && data.length > 0) {
        setPricingPlans(data);
      } else {
        // Optional: Seed hardcoded if empty, but better to just respect DB
      }
    } catch (error) {
      console.error("Error loading services", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (service: Service) => {
    setEditingService(service);
    setFormData({
      title: service.title,
      duration: service.duration,
      price: service.price,
      description: service.description,
      features: service.features ? service.features.join("\\n") : "",
      popular: service.popular || false
    });
  };

  const handleUpdate = async () => {
    if (!editingService) return;

    try {
      const featuresArray = formData.features.split("\\n").filter(f => f.trim() !== "");

      const { error } = await supabase
        .from("booking_services")
        .update({
          title: formData.title,
          duration: formData.duration,
          price: formData.price,
          description: formData.description,
          features: featuresArray,
          popular: formData.popular
        })
        .eq("id", editingService.id);

      if (error) throw error;

      toast.success("Service updated successfully!");
      setEditingService(null);
      fetchServices();
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update service");
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
      <section id="pricing" className="section-padding bg-secondary/20">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
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
                className={`relative bg-card rounded-2xl p-6 border transition-all duration-300 hover:shadow-card ${plan.popular
                  ? "border-primary shadow-glow"
                  : "border-border/50 hover:border-primary/30"
                  }`}
              >
                {/* Visual Cue for Edit Mode */}
                {isEditMode && (
                  <div
                    className="absolute -right-3 -top-3 z-20 cursor-pointer hover:scale-110 transition-transform"
                    onClick={(e) => {
                      e.preventDefault();
                      handleEditClick(plan);
                    }}
                  >
                    <div className="bg-amber-500 text-white p-2 rounded-full shadow-lg">
                      <Pencil className="w-4 h-4" />
                    </div>
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

          {/* Edit Dialog */}
          <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Service</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price</Label>
                    <Input
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Features (one per line)</Label>
                  <Textarea
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    rows={5}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.popular}
                    onCheckedChange={(c) => setFormData({ ...formData, popular: c })}
                  />
                  <Label>Popular</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingService(null)}>Cancel</Button>
                <Button onClick={handleUpdate}>Save Changes</Button>
              </DialogFooter>
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
