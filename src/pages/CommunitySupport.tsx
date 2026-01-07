import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Search, Sparkles, User, ShieldCheck, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AskQuestionDialog } from "@/components/community/AskQuestionDialog";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { WaveDivider } from "@/components/shared/WaveDivider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

// Local interface since we can't regenerate types immediately
interface CommunityPost {
    id: string;
    title: string;
    description: string;
    solution: string | null;
    category: string;
    is_published: boolean;
    created_at: string;
}

const CommunitySupport = () => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const { user, isAdmin } = useAuth();
    const { toast } = useToast();

    const fetchPosts = async () => {
        setLoading(true);
        let query = supabase
            .from("community_posts")
            .select("*")
            .order("created_at", { ascending: false });

        // If not admin, only show published
        if (!isAdmin) {
            query = query.eq("is_published", true);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching posts:", error);
        } else {
            setPosts(data as CommunityPost[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, [isAdmin]);

    const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category))).filter(Boolean)];

    const filteredPosts = posts.filter((post) => {
        const matchesSearch =
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handlePublish = async (id: string, solution: string) => {
        if (!solution) {
            toast({ title: "Error", description: "Answer cannot be empty.", variant: "destructive" });
            return;
        }

        const { error } = await supabase
            .from("community_posts")
            .update({ is_published: true, solution })
            .eq("id", id);

        if (error) {
            toast({ title: "Error", description: "Failed to publish.", variant: "destructive" });
        } else {
            toast({ title: "Published", description: "This question is now live." });
            fetchPosts();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post?")) return;

        const { error } = await supabase
            .from("community_posts")
            .delete()
            .eq("id", id);

        if (error) {
            toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" });
        } else {
            toast({ title: "Deleted", description: "Post has been removed." });
            fetchPosts();
        }
    };

    return (
        <Layout>
            <SEOHead
                title="Community Support - Psyche Space"
                description="A safe space to share challenges and find expert solutions for mental wellness."
            />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-primary/5">
                <div className="container-wide relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Safe & Anonymous Support</span>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-bold font-display mb-6"
                    >
                        You Are Not Alone
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
                    >
                        Browse questions from the community and find expert guidance. We're here to help each other grow.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <AskQuestionDialog />
                    </motion.div>
                </div>
                <WaveDivider variant="wave" color="hsl(var(--background))" className="-mb-1" />
            </section>

            {/* Content Section */}
            <section className="py-12 bg-background min-h-[60vh]">
                <div className="container-wide">

                    {/* Filters */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-12">
                        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto mask-linear-fade">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                                        }`}
                                >
                                    {cat || "General"}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search topics..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 rounded-full bg-background border-border shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Posts Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredPosts.length > 0 ? (
                        <div className="grid gap-6 max-w-4xl mx-auto">
                            {filteredPosts.map((post) => (
                                <PostCard key={post.id} post={post} isAdmin={isAdmin} onPublish={handlePublish} onDelete={handleDelete} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-dashed border-border">
                            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-medium mb-2">No posts found</h3>
                            <p className="text-muted-foreground mb-6">
                                Be the first to ask a question or try a different search.
                            </p>
                            <AskQuestionDialog />
                        </div>
                    )}
                </div>
            </section>
        </Layout>
    );
};

// Sub-component for individual post
const PostCard = ({ post, isAdmin, onPublish, onDelete }: { post: CommunityPost, isAdmin: boolean, onPublish: (id: string, solution: string) => void, onDelete: (id: string) => void }) => {
    const [adminSolution, setAdminSolution] = useState(post.solution || "");
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-card rounded-2xl p-6 border transition-all ${!post.is_published && isAdmin ? "border-yellow-400/50 bg-yellow-50/10" : "border-border shadow-sm hover:shadow-md"
                }`}
        >
            <div className="flex justify-between items-start mb-4">
                <span className="inline-block px-3 py-1 rounded-full bg-secondary text-xs font-semibold text-foreground">
                    {post.category || "General"}
                </span>
                {!post.is_published && isAdmin && (
                    <span className="text-xs font-bold text-yellow-600 bg-yellow-100 px-2 py-1 rounded border border-yellow-200">
                        Unpublished Review
                    </span>
                )}
                {isAdmin && (
                    <button
                        onClick={() => onDelete(post.id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors ml-2"
                        title="Delete Post"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <h3 className="text-xl font-display font-bold text-foreground mb-3">
                {post.title}
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
                {post.description}
            </p>

            {/* Solution Section */}
            {(post.is_published || isAdmin) && (
                <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm">

                    <div className="flex items-center gap-2 mb-4 text-primary font-bold tracking-tight">
                        <div className="p-1.5 bg-primary/10 rounded-full">
                            <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="uppercase text-xs tracking-wider">Expert Perspective</span>
                    </div>

                    {post.is_published ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed
                            prose-headings:font-display prose-headings:font-bold prose-headings:text-primary
                            prose-p:text-base prose-p:my-3 prose-p:opacity-90
                            prose-li:marker:text-primary/70
                            prose-strong:text-primary/90 prose-strong:font-semibold">
                            <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>
                                {post.solution || ""}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        // Admin Answer Input
                        <div className="space-y-4">
                            <textarea
                                className="w-full p-4 rounded-lg border border-primary/20 bg-background/50 text-base min-h-[150px] focus:ring-2 focus:ring-primary/20 transition-all font-body leading-relaxed"
                                placeholder="Type your expert solution here... (supports Markdown)"
                                value={adminSolution}
                                onChange={(e) => setAdminSolution(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <Button
                                    size="sm"
                                    onClick={() => onPublish(post.id, adminSolution)}
                                    disabled={!adminSolution.trim()}
                                    className="shadow-md hover:shadow-lg transition-shadow"
                                >
                                    Publish Answer
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </motion.div>
    );
};


export default CommunitySupport;
