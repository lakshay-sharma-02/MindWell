import { Link } from "react-router-dom";
import { PodcastCard } from "@/components/podcasts/PodcastCard";
import { Button } from "@/components/ui/button";
import { ArrowRight, Headphones, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PodcastEpisode } from "@/data/podcasts";

export function FeaturedPodcasts() {
  const [featured, setFeatured] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const { data, error } = await supabase
          .from('podcasts')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Error fetching podcasts:', error);
          return;
        }

        if (data) {
          const mappedPodcasts: PodcastEpisode[] = data.map((ep, index) => ({
            id: ep.id,
            slug: ep.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            title: ep.title,
            description: ep.description || '',
            duration: ep.duration || '00:00',
            audioUrl: ep.audio_url || '#',
            publishedAt: ep.created_at,
            episodeNumber: index + 1,
            season: 1,
            guest: ep.guest ? { name: ep.guest, title: "" } : undefined,
            topics: []
          }));
          setFeatured(mappedPodcasts);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPodcasts();
  }, []);

  if (loading) return null; // Or skeleton

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/40 via-secondary/20 to-background" />

      {/* Ambient glows */}
      <div className="absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute top-[10%] right-[20%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px]"
        />
        <motion.div
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.06, 0.12, 0.06] }}
          transition={{ duration: 15, repeat: Infinity, delay: 5 }}
          className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] bg-accent/10 rounded-full blur-[80px]"
        />
      </div>

      <div className="container-wide relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-3"
            >
              <Headphones className="w-4 h-4" />
              The MindWell Podcast
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Listen & Learn
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Conversations about growth, healing, and living a balanced life.
            </p>
          </div>

          <Button variant="ghost" size="sm" className="group hidden md:flex text-muted-foreground hover:text-foreground" asChild>
            <Link to="/podcasts">
              All episodes
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        {/* Enhanced sound wave visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex justify-center items-center gap-1 mb-10"
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mr-3 cursor-pointer group"
          >
            <Play className="w-5 h-5 text-primary ml-0.5 group-hover:scale-110 transition-transform" />
          </motion.div>
          {[...Array(24)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                height: [6, 16 + Math.sin(i * 0.5) * 10, 6],
              }}
              transition={{
                duration: 0.8 + Math.random() * 0.4,
                repeat: Infinity,
                delay: i * 0.04,
                ease: "easeInOut"
              }}
              className="w-1 rounded-full bg-gradient-to-t from-primary/30 to-primary/60"
              style={{ height: 6 }}
            />
          ))}
        </motion.div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {featured.map((episode, index) => (
              <motion.div
                key={episode.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
              >
                <PodcastCard episode={episode} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No podcasts available.
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10 md:hidden"
        >
          <Button variant="outline" size="sm" className="group" asChild>
            <Link to="/podcasts">
              View All Episodes
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
