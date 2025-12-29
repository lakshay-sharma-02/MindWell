import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Pencil, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect, lazy, Suspense } from "react";
import { faqData, FAQItem } from "@/data/faq";
import { supabase } from "@/integrations/supabase/client";
import { useAdminEdit } from "@/hooks/useAdminEdit";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { SectionErrorBoundary } from "@/components/shared/SectionErrorBoundary";

const FaqForm = lazy(() => import("@/components/admin/forms/FaqForm").then(module => ({ default: module.FaqForm })));

interface FAQProps {
  items?: FAQItem[];
  title?: string;
  subtitle?: string;
}

// Extend FAQItem to include id and published for internal use
interface ExtendedFAQItem extends FAQItem {
  id?: string;
  published?: boolean;
}

export function FAQ({
  items = faqData,
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know before getting started."
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [displayItems, setDisplayItems] = useState<ExtendedFAQItem[]>(items);

  // Edit Mode State
  const { isEditMode } = useAdminEdit();
  const [editingItem, setEditingItem] = useState<ExtendedFAQItem | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Only fetch if no custom items are passed and we are using default static data
    // Or if we need to refresh data after edit
    if (items === faqData) {
      fetchFaqs();
    } else {
      setDisplayItems(items);
    }
  }, [items]);

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        // .eq('published', true) // TODO: Toggle based on admin
        .order('sort_order', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setDisplayItems(data.map(f => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          published: f.published,
          category: f.category,
          sort_order: f.sort_order
        })));
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    }
  };

  const handleSave = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (editingItem && editingItem.id) {
        // Update
        const { error } = await supabase
          .from('faqs')
          .update(data)
          .eq('id', editingItem.id);
        if (error) throw error;
        toast({ title: "Updated", description: "FAQ updated successfully." });
      } else {
        // Create
        const { error } = await supabase
          .from('faqs')
          .insert([data]);
        if (error) throw error;
        toast({ title: "Created", description: "FAQ created successfully." });
      }

      setEditingItem(null);
      setIsAdding(false);
      fetchFaqs();
    } catch (error) {
      toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent accordion toggle
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
      toast({ title: "Deleted", description: "FAQ deleted." });
      fetchFaqs();
    } catch (error) {
      toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" });
    }
  };

  const handleEdit = (item: ExtendedFAQItem) => {
    setEditingItem(item);
  };

  return (
    <SectionErrorBoundary name="FAQ">
      <section className="section-padding bg-background relative overflow-hidden">
        <div className="container-narrow relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            {isEditMode && (
              <div className="absolute top-0 right-0"> {/* This div was moved and modified */}
                <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
                  <Plus className="w-4 h-4" /> Add FAQ
                </Button>
              </div>
            )}

            {title && <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">{title}</h2>}
            {subtitle && <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>}
          </motion.div>

          <div className="space-y-4">
            <AnimatePresence>
              {displayItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-border/50 rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300"
                >
                  <div
                    onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                    className="flex items-center justify-between w-full p-6 text-left cursor-pointer"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setOpenIndex(openIndex === index ? -1 : index);
                      }
                    }}
                  >
                    <span className="font-semibold text-foreground text-lg">{item.question}</span>

                    <div className="flex items-center gap-2">
                      {isEditMode && item.id && (
                        <div className="flex gap-1 mr-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(item)}>
                            <Pencil className="w-4 h-4 text-muted-foreground hover:text-primary" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => handleDelete(item.id!, e)}>
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      )}
                      {openIndex === index ? (
                        <Minus className="w-5 h-5 text-primary shrink-0" />
                      ) : (
                        <Plus className="w-5 h-5 text-muted-foreground shrink-0" />
                      )}
                    </div>
                  </div>
                  <AnimatePresence>
                    {openIndex === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div
                          className="px-6 pb-6 text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: item.answer }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        <Dialog open={!!editingItem || isAdding} onOpenChange={(open) => { if (!open) { setEditingItem(null); setIsAdding(false); } }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
            </DialogHeader>
            <Suspense fallback={<div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
              <FaqForm
                initialData={editingItem}
                onSubmit={handleSave}
                isSubmitting={isSubmitting}
                onCancel={() => { setEditingItem(null); setIsAdding(false); }}
              />
            </Suspense>
          </DialogContent>
        </Dialog>
      </section>
    </SectionErrorBoundary>
  );
}

