import { motion } from "framer-motion";

const publications = [
  "Psychology Today",
  "Forbes",
  "Healthline",
  "Mind Body Green",
  "Well+Good",
];

export function PressBar() {
  return (
    <section className="py-10 bg-background border-y border-border/30">
      <div className="container-wide">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-xs text-muted-foreground/60 uppercase tracking-widest font-medium mb-6"
        >
          As Featured In
        </motion.p>

        <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12">
          {publications.map((pub, index) => (
            <motion.span
              key={pub}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="font-display text-base md:text-lg text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors duration-300"
            >
              {pub}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
