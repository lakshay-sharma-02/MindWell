
import { useState, useEffect, lazy, Suspense } from "react";
import { motion } from "framer-motion";
import { Star, Quote, CheckCircle2, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { testimonials as staticTestimonials, Testimonial } from "@/data/testimonials";
import { useAdminEdit } from "@/hooks/useAdminEdit";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { SectionErrorBoundary } from "@/components/shared/SectionErrorBoundary";

const TestimonialForm = lazy(() => import("@/components/admin/forms/TestimonialForm").then(module => ({ default: module.TestimonialForm })));

export function Testimonials() {
  const [items, setItems] = useState<Testimonial[]>(staticTestimonials);
  const [loading, setLoading] = useState(true);

  // Edit Mode State
  const { isEditMode } = useAdminEdit();
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        const mappedTestimonials: Testimonial[] = data.map(t => ({
          id: t.id,
          name: t.name,
          role: t.role || "Client",
          content: t.content,
          rating: t.rating || 5,
          avatar: t.image_url || t.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
          verified: true,
          published: t.published
        }));
        setItems(mappedTestimonials);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('testimonials')
          .update(data)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: "Updated", description: "Testimonial updated successfully." });
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert([data]);
        if (error) throw error;
        toast({ title: "Created", description: "Testimonial created successfully." });
      }
      setEditingItem(null);
      setIsAdding(false);
      fetchTestimonials();
    } catch (error) {
      toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Deleted", description: "Testimonial deleted." });
      fetchTestimonials();
    } catch (error) {
      toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" });
    }
  }

  return (
    <SectionErrorBoundary name="Testimonials">
      <section className="section-padding relative overflow-hidden bg-secondary/30">
        <div className="container-wide relative">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 relative"
          >
            {isEditMode && (
              <div className="absolute top-0 right-0">
                <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Add Testimonial
                </Button>
              </div>
            )}

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

          {/* Testimonial Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative p-8 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-card hover:border-primary/20 transition-all duration-300 flex flex-col"
              >
                {/* Edit Controls */}
                {isEditMode && (
                  <div className="absolute top-4 right-4 z-20 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingItem(item)}
                      className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => item.id && handleDelete(item.id)}
                      className="p-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors shadow-lg"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: item.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-amber fill-current" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-primary/10 mb-2" />
                  <p className="text-muted-foreground leading-relaxed line-clamp-6 flex-grow">
                    "{item.content}"
                  </p>
                </div>

                <div className="mt-auto flex items-center gap-3 pt-6 border-t border-border/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary font-semibold text-sm overflow-hidden">
                    {item.avatar.length <= 2 ? item.avatar : <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground text-sm">{item.name}</span>
                      {item.verified && <CheckCircle2 className="w-3 h-3 text-primary" />}
                    </div>
                    <span className="text-xs text-muted-foreground block">{item.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <Dialog open={!!editingItem || isAdding} onOpenChange={(open) => { if (!open) { setEditingItem(null); setIsAdding(false); } }}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingItem ? "Edit Testimonial" : "Add Testimonial"}</DialogTitle>
              </DialogHeader>
              <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
                <TestimonialForm
                  initialData={editingItem}
                  onSubmit={handleSave}
                  isSubmitting={isSubmitting}
                  onCancel={() => { setEditingItem(null); setIsAdding(false); }}
                />
              </Suspense>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    </SectionErrorBoundary>
  );
}
