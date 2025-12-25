import { useState, useMemo, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { BlogCard } from "@/components/blog/BlogCard";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/types/database";
import { Search, Tag, Sparkles, BookOpen, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { GradientOrbs } from "@/components/effects/GradientOrbs";

type DbBlog = Tables<"blogs">;

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar: string;
    credentials: string;
  };
  publishedAt: string;
  readingTime: number;
  featuredImage: string;
}

const transformDbBlog = (blog: DbBlog): BlogPost => ({
  id: blog.id,
  slug: blog.slug,
  title: blog.title,
  excerpt: blog.excerpt || "",
  content: blog.content || "",
  category: blog.category || "General",
  tags: [],
  author: {
    name: blog.author || "Unknown",
    avatar: "/placeholder.svg",
    credentials: "",
  },
  publishedAt: blog.created_at,
  readingTime: Math.ceil((blog.content?.length || 0) / 1000),
  featuredImage: blog.image || "/placeholder.svg",
});

const Blog = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const fetchBlogs = async () => {
    // Some DBs use `published` (boolean), others use `published_at` (timestamp).
    // We'll try `published` first, then fall back to `published_at`.
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      const msg = error.message || "";
      if (/column\s+"published"\s+does\s+not\s+exist/i.test(msg)) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("blogs")
          .select("*")
          .not("published_at", "is", null)
          .order("created_at", { ascending: false });

        if (!fallbackError && fallbackData) {
          setBlogs(fallbackData.map(transformDbBlog));
        }
      }
    } else if (data) {
      setBlogs(data.map(transformDbBlog));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const categories = useMemo(() => {
    const cats = ["All", ...new Set(blogs.map((b) => b.category))];
    return cats;
  }, [blogs]);

  const allTags = useMemo(() => {
    return [...new Set(blogs.flatMap((post) => post.tags))];
  }, [blogs]);

  const filteredPosts = useMemo(() => {
    return blogs.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "All" || post.category === selectedCategory;

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => post.tags.includes(tag));

      return matchesSearch && matchesCategory && matchesTags;
    });
  }, [blogs, searchQuery, selectedCategory, selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const featuredPost = blogs[0];
  const regularPosts = filteredPosts.filter((p) => p.id !== featuredPost?.id);

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
        title="Blog"
        description="Explore evidence-based articles on mental health, anxiety, depression, relationships, and personal growth. Written by licensed psychologists and mental health experts."
        keywords="mental health blog, psychology articles, anxiety tips, depression resources, self-care, mindfulness"
      />

      {/* Hero Header */}
      <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-b from-secondary/50 to-background">
        <GradientOrbs variant="section" />
        
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />

        <div className="container-wide relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <motion.span 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              Expert Insights
            </motion.span>
            
            <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-6">
              Mental Health{" "}
              <span className="text-gradient-animate">Insights</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Evidence-based articles and practical strategies for your 
              mental wellness journey, written by licensed professionals.
            </p>

            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { icon: BookOpen, value: `${blogs.length}+`, label: "Articles" },
                { icon: TrendingUp, value: "50K+", label: "Monthly Readers" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-card shadow-soft"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-xl text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 border-b border-border bg-background/95 backdrop-blur-md sticky top-16 lg:top-20 z-40">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative flex-1 max-w-md"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-wrap gap-2"
            >
              {categories.map((category, index) => (
                <motion.button
                  key={category}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                      : "bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {category}
                </motion.button>
              ))}
            </motion.div>
          </div>

          {allTags.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-5 flex items-center gap-3 flex-wrap"
            >
              <Tag className="w-4 h-4 text-muted-foreground" />
              {allTags.slice(0, 8).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    selectedTags.includes(tag)
                      ? "bg-accent text-accent-foreground shadow-md"
                      : "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && selectedCategory === "All" && selectedTags.length === 0 && !searchQuery && (
        <section className="py-16 bg-background">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <span className="text-sm font-medium text-primary uppercase tracking-wider">Featured Article</span>
            </motion.div>
            <BlogCard post={featuredPost} featured onUpdate={fetchBlogs} />
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(selectedCategory === "All" && selectedTags.length === 0 && !searchQuery ? regularPosts : filteredPosts).map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <BlogCard post={post} onUpdate={fetchBlogs} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg mb-4">
                No articles found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                  setSelectedTags([]);
                }}
                className="text-primary hover:underline font-medium"
              >
                Clear all filters
              </button>
            </motion.div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Blog;
