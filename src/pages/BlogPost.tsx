import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/types/database";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Calendar, Share2, Twitter, Facebook, Linkedin, Copy, BookOpen, ChevronRight, Heart, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { GradientOrbs } from "@/components/effects/GradientOrbs";
import { BlogCard } from "@/components/blog/BlogCard";
import { CommentSection } from "@/components/shared/CommentSection";
import { SocialShare } from "@/components/shared/SocialShare";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Blog = Tables<"blogs">;

const categoryColors: Record<string, string> = {
  "Anxiety": "from-emerald-400 to-teal-500",
  "Self-Care": "from-rose-400 to-pink-500",
  "Relationships": "from-violet-400 to-purple-500",
  "Mindfulness": "from-cyan-400 to-blue-500",
  "Depression": "from-amber-400 to-orange-500",
  "Mental Health": "from-indigo-400 to-purple-500",
  "Wellness": "from-green-400 to-emerald-500",
};

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const [post, setPost] = useState<Blog | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;

      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();

      if (error) {
        console.error("Error fetching blog:", error);
      } else if (data) {
        setPost(data);
      }
      setLoading(false);
    };

    const fetchRelatedPosts = async (category: string, postId: string) => {
      const { data: related } = await supabase
        .from("blogs")
        .select("*")
        .eq("category", category)
        .eq("published", true)
        .neq("id", postId)
        .limit(3);

      setRelatedPosts(related || []);
    };

    fetchPost();

    // When post is loaded, fetch related posts
    return () => {
      const currentPost = post;
      if (currentPost?.category) {
        fetchRelatedPosts(currentPost.category, currentPost.id);
      }
    };
  }, [slug, post]);

  // Check if user has liked the post
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user || !post) return;

      const { data } = await supabase
        .from("blog_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("blog_id", post.id)
        .maybeSingle();

      setIsLiked(!!data);
    };

    checkLikeStatus();
  }, [user, post]);

  const handleLike = useCallback(async () => {
    if (!user) {
      toast.error("Please sign in to like articles");
      return;
    }
    if (!post) return;

    setLikeLoading(true);
    try {
      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from("blog_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("blog_id", post.id);

        if (error) throw error;
        setIsLiked(false);
        toast.success("Removed from your loved stories");
      } else {
        // Like
        const { error } = await supabase
          .from("blog_likes")
          .insert({
            user_id: user.id,
            blog_id: post.id
          });

        if (error) throw error;
        setIsLiked(true);
        toast.success("Added to your loved stories");
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    } finally {
      setLikeLoading(false);
    }
  }, [user, post, isLiked]);

  // Calculate reading time
  const readingTime = useMemo(() => {
    return post?.content ? Math.ceil(post.content.split(/\s+/).length / 200) : 5;
  }, [post?.content]);

  if (loading) {
    return (
      <Layout>
        <SEOHead title="Loading..." description="Loading blog post" />
        <div className="container-narrow section-padding flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <SEOHead title="Article Not Found" description="The requested article could not be found." />
        <div className="container-narrow section-padding text-center">
          <h1 className="font-display text-3xl font-semibold mb-4">Article Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The article you're looking for doesn't exist or has been moved.
          </p>
          <Button asChild>
            <Link to="/blog">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const gradientColor = categoryColors[post.category || ""] || "from-primary to-cyan";
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  const shareToLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  return (
    <Layout>
      <SEOHead
        title={post.title}
        description={post.excerpt || ""}
        keywords={post.category || ""}
        ogType="article"
      />

      <article>
        {/* Hero Header */}
        <header className={`relative overflow-hidden py-20 md:py-28 bg-gradient-to-br ${gradientColor}`}>
          <GradientOrbs variant="hero" />

          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.15),transparent_50%)]" />
          <motion.div
            className="absolute top-10 right-10 w-40 h-40 border border-white/20 rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-24 h-24 border border-white/10 rounded-2xl"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          />

          <div className="container-narrow relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-white/70 text-sm mb-8">
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
                <ChevronRight className="w-4 h-4" />
                <Link to="/blog" className="hover:text-white transition-colors">Blog</Link>
                <ChevronRight className="w-4 h-4" />
                <span className="text-white">{post.category || "Uncategorized"}</span>
              </nav>

              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                  {post.category || "Uncategorized"}
                </span>
                <span className="flex items-center gap-2 text-white/80 text-sm">
                  <Clock className="w-4 h-4" />
                  {readingTime} min read
                </span>
                <span className="flex items-center gap-2 text-white/80 text-sm">
                  <Calendar className="w-4 h-4" />
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric"
                  })}
                </span>
              </div>

              {/* Title */}
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-8">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-white/90 leading-relaxed mb-10 max-w-3xl">
                  {post.excerpt}
                </p>
              )}

              {/* Author */}
              {post.author && (
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                    <span className="text-lg font-bold text-white">
                      {post.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-white text-lg">{post.author}</p>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Bottom curve */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 80" className="w-full h-auto fill-background">
              <path d="M0,40 C480,80 960,0 1440,40 L1440,80 L0,80 Z"></path>
            </svg>
          </div>
        </header>

        {/* Featured Image */}
        {post.image && (
          <div className="container-narrow -mt-8 relative z-10">
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              src={post.image}
              alt={post.title}
              className="w-full h-64 md:h-96 object-cover rounded-2xl shadow-xl"
            />
          </div>
        )}

        {/* Content */}
        <div className="container-narrow py-16 md:py-24">
          {post.content ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-p:text-lg prose-p:leading-relaxed prose-a:text-primary hover:prose-a:underline prose-img:rounded-xl prose-img:shadow-lg"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  // Custom rendering for specific elements if needed
                  h2: ({ node, ...props }) => <h2 className="text-3xl font-bold mt-12 mb-6 flex items-center gap-3" {...props}>
                    <span className={`w-1.5 h-8 rounded-full bg-gradient-to-b ${gradientColor}`} />
                    {props.children}
                  </h2>,
                  table: ({ node, ...props }) => (
                    <div className="my-8 w-full overflow-x-auto rounded-lg border border-border shadow-sm">
                      <table className="w-full text-sm text-left" {...props} />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-secondary/50 text-foreground uppercase tracking-wider font-semibold border-b border-border" {...props} />
                  ),
                  tbody: ({ node, ...props }) => (
                    <tbody className="divide-y divide-border bg-card/50" {...props} />
                  ),
                  tr: ({ node, ...props }) => (
                    <tr className="transition-colors hover:bg-secondary/30" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th className="px-6 py-4 font-display" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="px-6 py-4 align-top" {...props} />
                  ),
                  blockquote: ({ node, ...props }) => (
                    <blockquote className="border-l-4 border-primary/50 pl-6 my-8 italic text-xl text-muted-foreground bg-secondary/20 py-4 rounded-r-lg" {...props} />
                  )
                }}
              >
                {post.content}
              </ReactMarkdown>
            </motion.div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No content available for this post.</p>
            </div>
          )}

          {/* Like & Share */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 p-8 rounded-3xl bg-gradient-to-br from-secondary/50 to-secondary/30 border border-border/50"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLike}
                  disabled={likeLoading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full transition-colors ${isLiked
                    ? "bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20"
                    : "bg-rose-500/10 text-rose-500 hover:bg-rose-500/20"
                    }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
                  <span className="font-medium">{isLiked ? "Liked" : "Like this article"}</span>
                </motion.button>
              </div>

              <SocialShare title={post.title} />
            </div>
          </motion.div>

          {/* Comments */}
          {settings.features.blog_comments && (
            <section className="mt-16" id="comments">
              <CommentSection postId={post.id} postType="blog" />
            </section>
          )}
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-20 bg-secondary/30">
            <div className="container-wide">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center justify-between mb-12"
              >
                <div>
                  <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
                    Related Articles
                  </h2>
                  <p className="text-muted-foreground">
                    Continue exploring {(post.category || "similar").toLowerCase()} topics
                  </p>
                </div>
                <Button variant="outline" asChild>
                  <Link to="/blog" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    View All
                  </Link>
                </Button>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedPosts.map((relatedPost, index) => (
                  <motion.div
                    key={relatedPost.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`/blog/${relatedPost.slug}`} className="block group">
                      <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-colors">
                        {relatedPost.image && (
                          <img
                            src={relatedPost.image}
                            alt={relatedPost.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                        <div className="p-6">
                          <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                            {relatedPost.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {relatedPost.excerpt}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </article>
    </Layout >
  );
};

export default BlogPost;