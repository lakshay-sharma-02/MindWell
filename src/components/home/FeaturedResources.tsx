import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Download, Lock, Sparkles, Users } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface FeaturedResource {
  id: string;
  title: string;
  description: string;
  type: string;
  image: string;
  isPaid: boolean;
  price: number;
  pages: number;
  coverColor: string;
  downloadUrl: string;
}

export function FeaturedResources() {
  const [featured, setFeatured] = useState<FeaturedResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data, error } = await supabase
          .from('resources')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) {
          console.error('Error fetching resources:', error);
          return;
        }

        if (data) {
          const mappedResources: FeaturedResource[] = data.map((res, index) => ({
            id: res.id,
            title: res.title,
            description: res.description || '',
            type: res.type || 'PDF',
            image: res.image || '/placeholder.svg',
            // Mocking these fields as they don't exist in DB schema yet
            isPaid: false,
            price: 0,
            pages: 15 + index * 5,
            coverColor: index % 4 === 0 ? "from-violet/20 to-fuchsia/20" :
              index % 4 === 1 ? "from-blue/20 to-cyan/20" :
                index % 4 === 2 ? "from-emerald/20 to-teal/20" : "from-amber/20 to-orange/20",
            downloadUrl: res.download_url || '#',
          }));
          setFeatured(mappedResources);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  if (loading) return null; // Or skeleton

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-1/4 w-px h-40 bg-gradient-to-t from-transparent via-border to-transparent opacity-40" />
      </div>

      <div className="container-wide relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet/10 text-violet text-sm font-medium mb-3"
          >
            <Sparkles className="w-4 h-4" />
            Free & Premium Resources
          </motion.div>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
            Tools for Your Journey
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Workbooks, guides, and tools to support your wellbeing journey.
          </p>
        </motion.div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-500 border border-border/50 hover:border-primary/20"
              >
                {/* Cover gradient with enhanced styling */}
                <div className={`h-32 bg-gradient-to-br ${resource.coverColor} relative overflow-hidden`}>
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </div>

                  <div className="absolute bottom-3 left-4 flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-white/90 text-sm font-medium">{resource.pages} pages</span>
                  </div>

                  {resource.isPaid ? (
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-foreground text-xs font-medium flex items-center gap-1.5 shadow-soft">
                      <Lock className="w-3 h-3 text-amber" />
                      Premium
                    </div>
                  ) : (
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center gap-1.5 shadow-glow">
                      <Sparkles className="w-3 h-3" />
                      Free
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {resource.type}
                  </span>
                  <h3 className="font-display text-base font-semibold text-foreground mt-1.5 mb-2 line-clamp-2 group-hover:text-primary transition-colors duration-300">
                    {resource.title}
                  </h3>

                  {/* Download count indicator */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                    <Users className="w-3.5 h-3.5" />
                    <span>{(Math.floor(Math.random() * 900) + 100).toLocaleString()} downloads</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    {resource.isPaid ? (
                      <span className="text-lg font-bold text-foreground">${resource.price}</span>
                    ) : (
                      <span className="text-sm font-medium text-primary">Free Download</span>
                    )}
                    <Button
                      size="sm"
                      variant={resource.isPaid ? "outline" : "default"}
                      className="h-9 px-4 text-xs group/btn"
                      onClick={() => resource.downloadUrl && window.open(resource.downloadUrl, '_blank')}
                    >
                      <Download className="w-3.5 h-3.5 mr-1.5 group-hover/btn:animate-bounce" />
                      {resource.isPaid ? "Get" : "Download"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No resources available.
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Button variant="outline" size="default" className="group" asChild>
            <Link to="/resources">
              Browse All Resources
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
