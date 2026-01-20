
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/types/database";
import { motion, AnimatePresence } from "framer-motion";
import { Quote, Heart, Loader2 } from "lucide-react";
import { WaveDivider } from "@/components/shared/WaveDivider";
import { formatDistanceToNow } from "date-fns";
import { ShareStory } from "@/components/home/ShareStory";
import { useSearchParams } from "react-router-dom";

export default function Stories() {
    const [stories, setStories] = useState<Tables<"stories">[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const { data, error } = await supabase
                .from("stories")
                .select("*")
                .eq("approved", true)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setStories(data || []);
        } catch (error) {
            console.error("Error fetching stories:", error);
        } finally {
            setLoading(false);
        }
    };

    const [searchParams] = useSearchParams();

    useEffect(() => {
        if (searchParams.get("action") === "share") {
            setTimeout(() => {
                const element = document.getElementById("share-story-form");
                if (element) {
                    element.scrollIntoView({ behavior: "smooth" });
                }
            }, 500); // Small delay to allow rendering
        }
    }, [searchParams]);

    return (
        <Layout>
            <SEOHead
                title="Community Stories - Unheard Pages"
                description="Real stories from real people. You are not alone."
            />

            {/* Hero */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-primary/5">
                <div className="container-wide relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold font-display mb-6"
                    >
                        Unheard Stories
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
                    >
                        A safe space where silence finds a voice. Read stories from our community or share your own.
                    </motion.p>
                </div>
                <WaveDivider variant="wave" color="hsl(var(--background))" className="-mb-1" />
            </section>

            {/* Stories Grid */}
            <section className="py-20 bg-background min-h-[50vh]">
                <div className="container-wide">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : stories.length === 0 ? (
                        <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-border">
                            <Quote className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold mb-2">No stories yet</h3>
                            <p className="text-muted-foreground">Be the first to share your journey.</p>
                        </div>
                    ) : (
                        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                            <AnimatePresence>
                                {stories.map((story, i) => (
                                    <motion.div
                                        key={story.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="break-inside-avoid"
                                    >
                                        <div className="bg-card border border-border/50 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                            <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/10 group-hover:text-primary/20 transition-colors" />

                                            <h3 className="text-xl font-display font-semibold mb-4 pr-10">{story.title}</h3>
                                            <p className="text-muted-foreground leading-relaxed whitespace-pre-line mb-6 text-sm">
                                                {story.content}
                                            </p>

                                            <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                                                        {story.is_anonymous ? (
                                                            <span className="text-[10px]">?</span>
                                                        ) : (
                                                            <span className="text-[10px] uppercase">{(story.name || "A")[0]}</span>
                                                        )}
                                                    </div>
                                                    <span className="font-medium">
                                                        {story.is_anonymous ? "Anonymous" : story.name}
                                                    </span>
                                                </div>
                                                <span>{formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </section>

            {/* Share Story Form */}
            <div id="share-story-form">
                <ShareStory />
            </div>

        </Layout>
    );
}
