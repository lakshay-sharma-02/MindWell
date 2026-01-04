import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { PodcastCard } from "@/components/podcasts/PodcastCard";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/types/database";
import { PodcastEpisode } from "@/data/podcasts";
import { Headphones, Rss, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

type DbPodcast = Tables<"podcasts">;

const transformDbPodcast = (podcast: DbPodcast, index: number): PodcastEpisode => ({
  id: podcast.id,
  slug: podcast.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  title: podcast.title,
  description: podcast.description || "",
  duration: podcast.duration || "00:00",
  audioUrl: podcast.audio_url || "",
  publishedAt: podcast.created_at,
  episodeNumber: index + 1,
  season: 1,
  guest: podcast.guest ? { name: podcast.guest, title: "" } : undefined,
  topics: [],
});

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState<PodcastEpisode[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPodcasts = async () => {
    // Some DBs use `published` (boolean), others use `published_at` (timestamp).
    // We'll try `published` first, then fall back to `published_at`.
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      const msg = error.message || "";
      if (/column\s+"published"\s+does\s+not\s+exist/i.test(msg)) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("podcasts")
          .select("*")
          .not("published_at", "is", null)
          .order("created_at", { ascending: false });

        if (!fallbackError && fallbackData) {
          setPodcasts(fallbackData.map((p, i) => transformDbPodcast(p, i)));
        }
      }
    } else if (data) {
      setPodcasts(data.map((p, i) => transformDbPodcast(p, i)));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title="Podcasts"
        description="Listen to The Psyche Space Podcast featuring deep conversations about mental health, personal growth, and practical strategies for living a more balanced life."
        keywords="mental health podcast, psychology podcast, wellness podcast, therapy podcast, mindfulness audio"
      />

      {/* Header */}
      <section className="bg-gradient-hero py-16 md:py-20">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-light text-primary text-sm font-medium mb-6">
              <Headphones className="w-4 h-4" />
              The Psyche Space Podcast
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Listen & Learn
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Deep conversations about mental health, personal growth, and
              practical strategies for living a more balanced life. New
              episodes every Thursday.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline">
                <Rss className="w-4 h-4 mr-2" />
                Subscribe to RSS
              </Button>
              <Button variant="soft">Apple Podcasts</Button>
              <Button variant="soft">Spotify</Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Episodes */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              Latest Episodes
            </h2>
            <p className="text-muted-foreground">
              {podcasts.length} episodes
            </p>
          </motion.div>

          {podcasts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {podcasts.map((episode, index) => (
                <motion.div
                  key={episode.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <PodcastCard episode={episode} onUpdate={fetchPodcasts} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 px-4">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-primary/60" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                New Episodes Coming Soon
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto text-lg">
                We're recording some amazing conversations for you.
                Stay tuned for our upcoming launch!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Subscribe CTA */}
      <section className="py-16 bg-secondary/30">
        <div className="container-wide">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-foreground mb-4">
              Never Miss an Episode
            </h2>
            <p className="text-muted-foreground mb-6">
              Subscribe to our podcast and get new episodes delivered directly
              to your favorite podcast app.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="default">Apple Podcasts</Button>
              <Button variant="default">Spotify</Button>
              <Button variant="default">Google Podcasts</Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Podcasts;
