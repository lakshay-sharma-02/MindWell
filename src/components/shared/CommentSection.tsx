
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Send, User } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface CommentSectionProps {
    postId: string;
    postType: "blog" | "podcast";
}

type Comment = Tables<"comments">;

export function CommentSection({ postId, postType }: CommentSectionProps) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // New Comment State
    const [authorName, setAuthorName] = useState("");
    const [content, setContent] = useState("");

    useEffect(() => {
        fetchComments();
    }, [postId]);

    const fetchComments = async () => {
        try {
            const { data, error } = await supabase
                .from("comments")
                .select("*")
                .eq("post_id", postId)
                .eq("approved", true) // Only show approved/auto-approved
                .order("created_at", { ascending: false });

            if (error) throw error;
            setComments(data || []);
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !authorName.trim()) return;

        setSubmitting(true);
        try {
            const { error } = await supabase.from("comments").insert({
                post_id: postId,
                post_type: postType,
                author_name: authorName,
                content: content,
                approved: true // Auto-approve for now based on requirements
            });

            if (error) throw error;

            toast.success("Comment posted!");
            setContent("");
            // Refresh comments
            fetchComments();
        } catch (error) {
            console.error("Error posting comment:", error);
            toast.error("Failed to post comment");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8 py-10 border-t border-border/50">
            <h3 className="text-2xl font-bold font-display">Comments ({comments.length})</h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="bg-secondary/20 rounded-2xl p-6 space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <Input
                        placeholder="Your name"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        required
                        className="bg-background"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Comment</label>
                    <Textarea
                        placeholder="Share your thoughts..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                        rows={3}
                        className="bg-background resize-none"
                    />
                </div>
                <div className="flex justify-end">
                    <Button type="submit" disabled={submitting}>
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                        Post Comment
                    </Button>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="text-center py-4 text-muted-foreground">Loading comments...</div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No comments yet. Be the first to share your thoughts!</div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                            <Avatar className="w-10 h-10 border border-border">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                    {(comment.author_name?.[0] || "U").toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-semibold">{comment.author_name}</h4>
                                    <span className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed">{comment.content}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
