
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Send, Check, User, Mail, FileText, MessageSquare, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { WaveDivider } from "@/components/shared/WaveDivider";
import { supabase } from "@/integrations/supabase/client";
import { sendStorySubmission } from "@/lib/email";

export function ShareStory() {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "", // Still capturing email for potential admin follow-up, though not storing if anonymous user doesn't want to? 
    // Actually migration has `name` nullable, but no email column. 
    // Let's store name if not anonymous. Email we might skip for now or add to schema if needed.
    // Re-reading migration: name text null. No email. 
    // I'll skip storing email in DB for privacy unless I add a private column.
    // For now, I'll just store name and content.
    title: "",
    story: "",
  });

  const totalSteps = 3;
  const maxCharacters = 2000;

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent accidental submission on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && e.target instanceof HTMLInputElement) {
      e.preventDefault();
      // Optional: Logic to advance step if valid, but simpler to just block for now
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Final Validation Check
    if (formData.story.length < 50 || formData.title.length === 0 || (!isAnonymous && formData.name.length === 0)) {
      toast({
        title: "Incomplete Story",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Save to Database
      const { error } = await supabase.from('stories').insert({
        title: formData.title,
        content: formData.story,
        is_anonymous: isAnonymous,
        name: isAnonymous ? null : formData.name,
        approved: false // Pending moderation
      });

      if (error) throw error;

      // 2. Send Email Notification to Admin
      await sendStorySubmission({
        name: formData.name,
        email: formData.email || "No email provided", // Schema doesn't strictly require email yet but we capture it in state? Wait, state has email but inputs don't ask for it in Step 1 if anonymous.
        // Actually the form doesn't input email anywhere visible in strict mode! 
        // Let's check Step 1 code... It only asks for Name.
        // We should probably ask for email so admin can contact them?
        // User said "neither is sending mail TO ME". But `email.ts` sends to ADMIN.
        // Usually these forms send to Admin.
        // I will fix the email sending to Admin first.
        title: formData.title,
        story: formData.story,
        anonymous: isAnonymous
      });

      toast({
        title: "Story submitted! 💜",
        description: "Thank you for sharing. Your story has been sent for moderation.",
      });

      setFormData({ name: "", email: "", title: "", story: "" });
      setCurrentStep(1);
    } catch (error) {
      console.error("Error submitting story:", error);
      toast({
        title: "Submission failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        // If not anonymous, require name. Email is just UI decoration now as we don't store it yet.
        // Or we can keep requiring it for "validity" to reduce spam, even if not stored.
        if (isAnonymous) return true;
        return formData.name.length > 0;
      case 2:
        return formData.title.length > 0;
      case 3:
        return formData.story.length > 50;
      default:
        return false;
    }
  };

  return (
    <section className="relative overflow-hidden">
      <WaveDivider variant="curve" color="hsl(var(--secondary))" className="-mb-1" />

      <div className="bg-secondary/30 py-16 md:py-24">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: "spring", delay: 0.1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose/10 text-rose text-sm font-medium mb-4"
              >
                <Heart className="w-4 h-4 fill-current" />
                Your Voice Matters
              </motion.div>
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
                Share Your Story
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Your journey could inspire someone else. Help reduce the stigma around mental health.
              </p>
            </motion.div>

            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: step <= currentStep ? "hsl(var(--primary))" : "hsl(var(--muted))",
                      scale: step === currentStep ? 1.1 : 1
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                  >
                    {step < currentStep ? (
                      <Check className="w-4 h-4 text-primary-foreground" />
                    ) : (
                      <span className={step <= currentStep ? "text-primary-foreground" : "text-muted-foreground"}>
                        {step}
                      </span>
                    )}
                  </motion.div>
                  {step < 3 && (
                    <div className={`w-12 h-0.5 mx-2 transition-colors ${step < currentStep ? "bg-primary" : "bg-muted"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSubmit}
              onKeyDown={handleKeyDown}
              className="bg-card rounded-3xl p-6 md:p-8 shadow-card border border-border/50"
            >
              <AnimatePresence mode="wait">
                {/* Step 1: Your Info */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-lg font-semibold text-foreground">About You</h3>
                      <button
                        type="button"
                        onClick={() => setIsAnonymous(!isAnonymous)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isAnonymous
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                      >
                        {isAnonymous ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {isAnonymous ? "Anonymous" : "Show name"}
                      </button>
                    </div>

                    {!isAnonymous && (
                      <div className="space-y-4">
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                            placeholder="Your name"
                          />
                        </div>
                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                            placeholder="Your email (kept private)"
                          />
                        </div>
                      </div>
                    )}

                    {isAnonymous && (
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
                          placeholder="Your email (kept private, for updates)"
                        />
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-muted/50 text-center">
                      <p className="text-muted-foreground text-sm">
                        {isAnonymous ? "Your story will be shared anonymously." : "Your name will be displayed with your story."} We collect your email only to notify you about publication status.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Story Title */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <h3 className="font-display text-lg font-semibold text-foreground mb-4">Give It a Title</h3>
                    <div className="relative">
                      <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all text-lg"
                        placeholder="A meaningful title for your story"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Choose a title that captures the essence of your journey.
                    </p>
                  </motion.div>
                )}

                {/* Step 3: Your Story */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display text-lg font-semibold text-foreground">Your Story</h3>
                      <span className={`text-sm ${formData.story.length > maxCharacters ? "text-destructive" : "text-muted-foreground"}`}>
                        {formData.story.length} / {maxCharacters}
                      </span>
                    </div>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-muted-foreground" />
                      <textarea
                        value={formData.story}
                        onChange={(e) => setFormData({ ...formData, story: e.target.value.slice(0, maxCharacters) })}
                        rows={8}
                        className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all resize-none"
                        placeholder="Share your journey... What challenges did you face? What helped you? What would you tell someone going through something similar?"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your story will be held for moderation before appearing on the public wall.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
                {currentStep > 1 ? (
                  <Button type="button" variant="ghost" onClick={prevStep}>
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < totalSteps ? (
                  <Button type="button" onClick={nextStep} disabled={!isStepValid()}>
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="btn-glow gap-2"
                    disabled={!isStepValid() || isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Story"}
                    {!isSubmitting && <Send className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </motion.form>
          </div>
        </div>
      </div>

      <WaveDivider variant="curve" flip color="hsl(var(--background))" className="-mt-1" />
    </section>
  );
}
