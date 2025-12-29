import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { faqData, FAQItem } from "@/data/faq";
import { supabase } from "@/integrations/supabase/client";
import { useAdminEdit } from "@/hooks/useAdminEdit";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { FaqForm } from "@/components/admin/forms/FaqForm";
import { getErrorMessage } from "@/lib/getErrorMessage";

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

  return (
    <section className="section-padding bg-secondary/30 relative">
      <div className="container-wide relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 relative"
        >
          {isEditMode && (
            <div className="absolute top-0 right-0">
              <Button onClick={() => setIsAdding(true)} size="sm" className="gap-2">
                <Plus className="w-4 h-4" /> Add FAQ
              </Button>
            </div>
          )}

          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {displayItems.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full text-left p-6 rounded-2xl bg-card shadow-soft hover:shadow-card transition-all group relative"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-display text-lg font-medium text-foreground pr-8 flex-1">
                      {item.question}
                    </h3>

                    <div className="flex items-center gap-2">
                      {/* Edit Controls */}
                      {isEditMode && item.id && (
                        <div className="flex gap-2 mr-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => setEditingItem(item)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => handleDelete(item.id!, e)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}

                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {openIndex === index ? (
                          <Minus className="w-4 h-4 text-primary" />
                        ) : (
                          <Plus className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </div>
                  </div>

                  <motion.div
                    initial={false}
                    animate={{
                      height: openIndex === index ? "auto" : 0,
                      opacity: openIndex === index ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="text-muted-foreground mt-4 leading-relaxed">
                      {item.answer}
                    </p>
                  </motion.div>
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit/Add Dialogs */}
      <Dialog open={!!editingItem || isAdding} onOpenChange={(open) => { if (!open) { setEditingItem(null); setIsAdding(false); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit FAQ" : "Add FAQ"}</DialogTitle>
          </DialogHeader>
          <FaqForm
            initialData={editingItem}
            onSubmit={handleSave}
            isSubmitting={isSubmitting}
            onCancel={() => { setEditingItem(null); setIsAdding(false); }}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
}
