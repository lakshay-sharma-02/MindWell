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
      <section className="relative overflow-hidden py-24 md:py-32 bg-gradient-to-b from-secondary/50 via-background to-background">
        <GradientOrbs variant="section" />

        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        <div className="container-wide relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 border border-primary/20 backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              Expert Insights & Research
            </motion.span>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-8 tracking-tight leading-110">
              Mental Health{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-accent animate-gradient-x">
                Insights
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto font-light">
              Deep dives, evidence-based articles, and practical strategies for your
              wellness journey.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center gap-4 mt-12"
            >
              {[
                { icon: BookOpen, value: `${blogs.length}+`, label: "Articles" },
                { icon: TrendingUp, value: "50K+", label: "Monthly Readers" },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center justify-center p-4 min-w-[120px]"
                >
                  <p className="font-display font-bold text-3xl text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wider font-medium">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-y border-border/50 bg-background/80 backdrop-blur-xl sticky top-16 lg:top-20 z-40 transition-all duration-300 shadow-sm">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row gap-6 lg:items-center lg:justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative flex-1 max-w-xl group"
            >
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search for topics, key terms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-2xl border border-border bg-secondary/30 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-inner"
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
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 border ${selectedCategory === category
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-foreground hover:bg-secondary"
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
              className="mt-6 flex items-center gap-3 flex-wrap pl-1"
            >
              <Tag className="w-4 h-4 text-muted-foreground/70" />
              {allTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${selectedTags.includes(tag)
                      ? "bg-accent/20 text-accent-foreground border border-accent/20"
                      : "bg-transparent text-muted-foreground hover:text-primary border border-transparent hover:border-primary/10"
                    }`}
                >
                  #{tag}
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && selectedCategory === "All" && selectedTags.length === 0 && !searchQuery ? (
        <section className="py-16 bg-background">
          <div className="container-wide">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-10 text-center md:text-left"
            >
              <span className="text-xs font-bold text-primary tracking-widest uppercase border-b-2 border-primary pb-1">Featured Article</span>
            </motion.div>
            {/* Featured Post - Keeping it grid/flex but ensuring it looks grand */}
            <BlogCard post={featuredPost} featured onUpdate={fetchBlogs} className="shadow-xl ring-1 ring-border/50" />
          </div>
        </section>
      ) : null}

      {/* Posts Grid - Masonry */}
      <section className="section-padding bg-background min-h-[50vh]">
        <div className="container-wide">
          {filteredPosts.length > 0 ? (
            <div className={`columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8 ${selectedCategory === "All" && !searchQuery ? 'mt-8' : ''}`}>
              {(selectedCategory === "All" && selectedTags.length === 0 && !searchQuery ? regularPosts : filteredPosts).map((post, index) => (
                <div key={post.id} className="break-inside-avoid">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "50px" }}
                    transition={{ duration: 0.5, delay: (index % 3) * 0.1 }}
                  >
                    <BlogCard post={post} onUpdate={fetchBlogs} />
                  </motion.div>
                </div>
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
