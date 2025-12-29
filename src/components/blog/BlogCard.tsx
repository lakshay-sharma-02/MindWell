import { useState } from "react";
import { Link } from "react-router-dom";
import { Clock, ArrowUpRight, Pencil, Check, X, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface BlogCardProps {
  post: BlogPost;
  featured?: boolean;
  onUpdate?: () => void;
  className?: string;
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  "Anxiety": { bg: "bg-primary/10", text: "text-primary" },
  "Self-Care": { bg: "bg-accent/10", text: "text-accent" },
  "Relationships": { bg: "bg-violet/10", text: "text-violet" },
  "Mindfulness": { bg: "bg-cyan/10", text: "text-cyan" },
  "Depression": { bg: "bg-amber/10", text: "text-amber" },
};

export function BlogCard({ post, featured = false, onUpdate, className = "" }: BlogCardProps) {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
  });

  const colors = categoryColors[post.category] || { bg: "bg-primary/10", text: "text-primary" };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("blogs")
        .update({
          title: editData.title,
          excerpt: editData.excerpt,
          category: editData.category,
        })
        .eq("id", post.id);

      if (error) throw error;

      toast({ title: "Saved!", description: "Blog post updated successfully." });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error saving:", error);
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;

    try {
      const { error } = await supabase.from("blogs").delete().eq("id", post.id);
      if (error) throw error;

      toast({ title: "Deleted", description: "Blog post has been removed." });
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting:", error);
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleCancel = () => {
    setEditData({
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
    });
    setIsEditing(false);
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`group relative bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-400 border border-border/50 hover:border-primary/20 ${featured ? 'md:col-span-2' : ''} ${isEditing ? 'ring-2 ring-primary' : ''} ${className}`}
    >
      {/* Admin Edit Controls */}
      {isAdmin && !isEditing && (
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={(e) => { e.preventDefault(); setIsEditing(true); }}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); handleDelete(); }}
            className="p-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors shadow-lg"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Save/Cancel Controls */}
      {isEditing && (
        <div className="absolute top-4 right-4 z-20 flex gap-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50"
            title="Save"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors shadow-lg"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <Link to={`/blog/${post.slug}`} className={`block ${isEditing ? 'pointer-events-none' : ''}`}>
        {/* Image area with gradient overlay */}
        <div className={`relative ${featured ? 'aspect-[2/1]' : 'aspect-[16/10]'} bg-secondary overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary to-accent/10" />
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-foreground/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-foreground/5" />
          </div>

          {/* Category pill - editable */}
          <div className="absolute top-4 left-4">
            {isEditing ? (
              <input
                type="text"
                value={editData.category}
                onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-card border border-primary"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={`px-3 py-1.5 rounded-full ${colors.bg} ${colors.text} text-xs font-medium backdrop-blur-sm`}>
                {post.category}
              </span>
            )}
          </div>

          {!isEditing && (
            <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-border/50">
              <ArrowUpRight className="w-4 h-4 text-foreground" />
            </div>
          )}
        </div>
      </Link>

      <div className={`p-5 ${featured ? 'md:p-6' : ''}`}>
        <div className="flex items-center gap-3 mb-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            {post.readingTime} min read
          </span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span className="text-xs text-muted-foreground">
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric"
            })}
          </span>
        </div>

        {/* Title - editable */}
        {isEditing ? (
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className={`w-full font-display ${featured ? 'text-xl md:text-2xl' : 'text-lg'} font-semibold text-foreground mb-2 bg-transparent border-b border-primary focus:outline-none`}
          />
        ) : (
          <Link to={`/blog/${post.slug}`}>
            <h3 className={`font-display ${featured ? 'text-xl md:text-2xl' : 'text-lg'} font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-snug`}>
              {post.title}
            </h3>
          </Link>
        )}

        {/* Excerpt - editable */}
        {isEditing ? (
          <textarea
            value={editData.excerpt}
            onChange={(e) => setEditData({ ...editData, excerpt: e.target.value })}
            rows={2}
            className="w-full text-muted-foreground text-sm leading-relaxed mb-4 bg-transparent border border-primary rounded p-2 focus:outline-none resize-none"
          />
        ) : (
          <p className={`text-muted-foreground text-sm leading-relaxed mb-4 ${featured ? 'line-clamp-3' : 'line-clamp-2'}`}>
            {post.excerpt}
          </p>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {post.author.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {post.author.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {post.author.credentials}
            </p>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
