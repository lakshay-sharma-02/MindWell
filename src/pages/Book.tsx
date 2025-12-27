
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Video, MapPin, Check, CheckCircle, ArrowRight, Shield, Star, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/types/database";

type Service = Tables<"booking_services">;

const defaultSessionTypes = [
  {
    id: "consultation",
    title: "Initial Consultation",
    duration: "50 minutes",
    price: "$150",
    description: "A comprehensive first session to understand your needs and goals.",
    features: ["Comprehensive assessment", "Goal setting", "Treatment planning", "Q&A time"],
    popular: false,
    created_at: new Date().toISOString()
  },
  {
    id: "individual",
    title: "Individual Therapy",
    duration: "50 minutes",
    price: "$175",
    description: "Ongoing individual sessions focused on your therapeutic goals.",
    features: ["Evidence-based treatment", "Personalized approach", "Progress tracking", "Between-session support"],
    popular: true,
    created_at: new Date().toISOString()
  },
  {
    id: "intensive",
    title: "Intensive Session",
    duration: "90 minutes",
    price: "$275",
    description: "Extended sessions for deeper work on complex issues.",
    features: ["Deep exploration", "Extended processing", "Skill building", "Integration work"],
    popular: false,
    created_at: new Date().toISOString()
  }
];

const timeSlots = [
  "9:00 AM", "10:00 AM", "11:00 AM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { QuizFlow, QuizResultValues } from "@/components/quiz/QuizFlow";

const Book = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<"virtual" | "in-person">("virtual");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingServices, setIsLoadingServices] = useState(true);

  // Quiz State
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResultValues | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from("booking_services")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setServices(data);
        } else {
          setServices(defaultSessionTypes as unknown as Service[]);
        }
      } catch (err) {
        console.error("Error fetching services, using defaults:", err);
        setServices(defaultSessionTypes as unknown as Service[]);
      } finally {
        setIsLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !selectedDate || !selectedTime) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedService = services.find(s => s.id === selectedSession);
      const sessionType = selectedService?.title || selectedSession;
      const price = selectedService?.price || "$150"; // Fallback default

      // Format quiz report if available
      let quizReportString = "";
      if (quizResult) {
        quizReportString = `
Mental Wellness Assessment Result:
Level: ${quizResult.level.toUpperCase()}
Score: ${quizResult.score}

Detailed Responses:
${quizResult.report.map((r, i) => `${i + 1}. ${r.question}\n   Answer: ${r.answer}`).join('\n')}
          `.trim();
      }

      const bookingData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        sessionType,
        price, // Pass the price!
        format: selectedFormat,
        date: selectedDate,
        time: selectedTime,
        notes: formData.notes + (quizReportString ? `\n\n--- Assessment ---\n${quizReportString}` : ""),
        // We append the quiz result to notes for now to ensure it gets sent even if email template isn't updated,
        // but we can also pass it as a separate field if we update the checkout flow properly.
        quizResult: quizResult // Pass the object too for Checkout.tsx to handle
      };

      navigate("/checkout", { state: { bookingData } });

    } catch (error) {
      console.error("Error redirecting to checkout:", error);
      toast.error("Failed to proceed to checkout. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Layout>
      <SEOHead
        title="Book a Session"
        description="Schedule a therapy session with Dr. Sarah Mitchell. Choose from consultations, individual therapy, or intensive sessions. Virtual and in-person options available."
        keywords="book therapy session, schedule appointment, psychologist appointment, online therapy"
      />

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 via-background to-background" />
          <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[100px]" />
        </div>

        <div className="container-wide relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Calendar className="w-4 h-4" />
              Book Your Session
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Start Your <span className="text-gradient-animate">Healing Journey</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Choose a session type that fits your needs. All sessions are confidential
              and tailored to your unique situation.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Session Types */}
      <section className="py-12">
        <div className="container-wide">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoadingServices ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] rounded-2xl bg-card border-2 border-border/50 animate-pulse" />
              ))
            ) : (
              services.map((session, index) => (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  onClick={() => setSelectedSession(session.id)}
                  className={`relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${selectedSession === session.id
                    ? "border-primary bg-primary/5 shadow-card"
                    : "border-border/50 bg-card hover:border-primary/30 hover:shadow-soft"
                    }`}
                >
                  {session.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      Most Popular
                    </div>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-display text-xl font-semibold text-foreground">{session.title}</h3>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedSession === session.id ? "border-primary bg-primary" : "border-border"
                      }`}>
                      {selectedSession === session.id && <Check className="w-4 h-4 text-primary-foreground" />}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {session.duration}
                    </span>
                    <span className="font-display text-2xl font-bold text-primary">{session.price}</span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">{session.description}</p>

                  <ul className="space-y-2">
                    {session.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Booking Form */}
      <section className="py-20 md:py-24 bg-secondary/30">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto space-y-8">

            {/* Optional Quiz Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-8 rounded-3xl bg-primary/5 border border-primary/20 shadow-sm"
            >
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Mental Health Assessment (Optional)
                  </h3>
                  <p className="text-muted-foreground mt-2 max-w-lg">
                    Take a quick 2-minute assessment to help Dr. Sarah understand your needs better before your session.
                  </p>
                </div>

                <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
                  <DialogTrigger asChild>
                    <Button variant={quizResult ? "outline" : "hero"} className="shrink-0">
                      {quizResult ? "Retake Assessment" : "Take Assessment"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Mental Health Assessment</DialogTitle>
                      <DialogDescription>
                        Complete this brief check-in to help us personalize your session. Your results are private and will be sent directly to your provider.
                      </DialogDescription>
                    </DialogHeader>
                    <QuizFlow
                      onComplete={(result) => {
                        setQuizResult(result);
                        setShowQuiz(false);
                        toast.success("Assessment attached to your booking!");
                      }}
                      onCancel={() => setShowQuiz(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>

              {quizResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 p-4 rounded-xl bg-background border border-border"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Assessment Complete</p>
                      <p className="text-sm text-muted-foreground">
                        Result: <span className="font-semibold text-primary">{quizResult.title}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your detailed responses will be sent securely to the doctor.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="p-8 md:p-10 rounded-3xl bg-card border border-border/50 shadow-soft"
            >
              <h2 className="font-display text-2xl font-bold text-foreground mb-8">
                Complete Your Booking
              </h2>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Format Selection */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Session Format</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setSelectedFormat("virtual")}
                      className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${selectedFormat === "virtual"
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/30"
                        }`}
                    >
                      <Video className={`w-5 h-5 ${selectedFormat === "virtual" ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="text-left">
                        <p className={`font-medium ${selectedFormat === "virtual" ? "text-primary" : "text-foreground"}`}>Virtual</p>
                        <p className="text-xs text-muted-foreground">Video call session</p>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedFormat("in-person")}
                      className={`p-4 rounded-xl border-2 flex items-center gap-3 transition-all ${selectedFormat === "in-person"
                        ? "border-primary bg-primary/5"
                        : "border-border/50 hover:border-primary/30"
                        }`}
                    >
                      <MapPin className={`w-5 h-5 ${selectedFormat === "in-person" ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="text-left">
                        <p className={`font-medium ${selectedFormat === "in-person" ? "text-primary" : "text-foreground"}`}>In-Person</p>
                        <p className="text-xs text-muted-foreground">San Francisco office</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Preferred Date *</label>
                    <Input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="h-12"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-foreground">Preferred Time *</label>
                    <select
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full h-12 px-4 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      required
                    >
                      <option value="">Select a time</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Full Name *</label>
                    <Input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email *</label>
                    <Input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Phone Number</label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(123) 456-7890"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Anything you'd like us to know?
                  </label>
                  <Textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Share any relevant information or questions..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full group"
                  disabled={isSubmitting || !selectedSession}
                >
                  {isSubmitting ? (
                    "Processing..."
                  ) : (
                    <>
                      Proceed to Payment
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By booking, you agree to our cancellation policy. Free cancellation up to 24 hours before your appointment.
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16">
        <div className="container-wide">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span>100% Confidential</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-amber" />
              <span>4.9/5 Client Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-accent" />
              <span>500+ Clients Helped</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Book;