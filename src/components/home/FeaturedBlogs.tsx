import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlogPost } from "@/data/blogPosts";

export function FeaturedBlogs() {
  const [featured, setFeatured] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) {
          console.error('Error fetching blogs:', error);
          return;
        }

        if (data) {
          const mappedPosts: BlogPost[] = data.map(post => ({
            id: post.id,
            slug: post.slug,
            title: post.title,
            excerpt: post.excerpt || '',
            content: post.content || '',
            category: post.category || 'General',
            tags: [], // Metadata not available in current schema
            author: {
              name: post.author || 'Unheard Pages',
              avatar: '/placeholder.svg',
              credentials: ''
            },
            publishedAt: new Date(post.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }),
            readingTime: Math.ceil((post.content?.split(' ').length || 0) / 200),
            featuredImage: post.image || '/placeholder.svg'
          }));
          setFeatured(mappedPosts);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return null; // Or a skeleton loader
  }

  return (
    <section className="section-padding bg-background relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-px h-48 bg-gradient-to-b from-transparent via-border to-transparent opacity-50" />
        <div className="absolute top-20 right-1/3 w-px h-32 bg-gradient-to-b from-transparent via-primary/20 to-transparent opacity-40" />
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
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3"
            >
              <BookOpen className="w-4 h-4" />
              Latest Articles
            </motion.div>
            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3">
              Insights for Your Journey
            </h2>
            <p className="text-muted-foreground max-w-lg">
              Evidence-based insights for your mental health journey, written with care.
            </p>
          </div>

          <Button variant="ghost" size="sm" className="group hidden md:flex text-muted-foreground hover:text-foreground" asChild>
            <Link to="/blog">
              View all articles
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        {featured.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.12 }}
              >
                <Link
                  to={`/blog/${post.slug}`}
                  className="group block bg-card rounded-2xl overflow-hidden border border-border/50 shadow-soft hover:shadow-card hover:border-primary/20 transition-all duration-500"
                >
                  {/* Image with overlay */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Category badge */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-xs font-medium text-foreground border border-border/50">
                        {post.category}
                      </span>
                    </div>

                    {/* Reading time */}
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/90 backdrop-blur-sm text-xs font-medium text-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readingTime} min read
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {post.excerpt}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <span className="text-xs text-muted-foreground">
                        {post.publishedAt}
                      </span>
                      <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read more
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No articles found.
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10 md:hidden"
        >
          <Button variant="outline" size="sm" className="group" asChild>
            <Link to="/blog">
              View All Articles
              <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
