import { motion } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { faqData, FAQItem } from "@/data/faq";

interface FAQProps {
  items?: FAQItem[];
  title?: string;
  subtitle?: string;
}

export function FAQ({ 
  items = faqData, 
  title = "Frequently Asked Questions",
  subtitle = "Everything you need to know before getting started."
}: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="section-padding bg-secondary/30">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            {title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>

        <div className="max-w-3xl mx-auto space-y-4">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full text-left p-6 rounded-2xl bg-card shadow-soft hover:shadow-card transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display text-lg font-medium text-foreground pr-8">
                    {item.question}
                  </h3>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {openIndex === index ? (
                      <Minus className="w-4 h-4 text-primary" />
                    ) : (
                      <Plus className="w-4 h-4 text-primary" />
                    )}
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
        </div>
      </div>
    </section>
  );
}
