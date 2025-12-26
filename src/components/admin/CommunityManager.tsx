import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trash2, MessageCircle, CheckCircle, XCircle, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CommunityPost {
    id: string;
    title: string;
    description: string;
    solution: string | null;
    category: string;
    is_published: boolean;
    created_at: string;
}

export function CommunityManager() {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();
    const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
    const [solution, setSolution] = useState("");
    const [isSolutionDialogOpen, setIsSolutionDialogOpen] = useState(false);

    const fetchPosts = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("community_posts")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching posts:", error);
            toast({ title: "Error", description: "Failed to fetch posts", variant: "destructive" });
        } else {
            setPosts(data as CommunityPost[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handlePublish = async (post: CommunityPost, newSolution: string) => {
        if (!newSolution.trim()) {
            toast({ title: "Error", description: "Solution cannot be empty.", variant: "destructive" });
            return;
        }

        const { error } = await supabase
            .from("community_posts")
            .update({ is_published: true, solution: newSolution })
            .eq("id", post.id);

        if (error) {
            toast({ title: "Error", description: "Failed to publish post.", variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Post published successfully." });
            setIsSolutionDialogOpen(false);
            fetchPosts();
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) return;

        const { error } = await supabase
            .from("community_posts")
            .delete()
            .eq("id", id);

        if (error) {
            toast({ title: "Error", description: "Failed to delete post.", variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Post deleted successfully." });
            fetchPosts();
        }
    };

    const handleUnpublish = async (id: string) => {
        const { error } = await supabase
            .from("community_posts")
            .update({ is_published: false })
            .eq("id", id);

        if (error) {
            toast({ title: "Error", description: "Failed to unpublish.", variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Post unpublished." });
            fetchPosts();
        }
    }

    const openSolutionDialog = (post: CommunityPost) => {
        setSelectedPost(post);
        setSolution(post.solution || "");
        setIsSolutionDialogOpen(true);
    };

    const filteredPosts = posts.filter(
        (post) =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold font-display">Community Support</h2>
                    <p className="text-muted-foreground">Manage user questions and expert answers.</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search posts..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8">
                                    Loading posts...
                                </TableCell>
                            </TableRow>
                        ) : filteredPosts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No posts found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredPosts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell>
                                        {post.is_published ? (
                                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                                                <CheckCircle className="w-3 h-3 mr-1" /> Published
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                                                <XCircle className="w-3 h-3 mr-1" /> Pending
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium max-w-[200px] truncate" title={post.title}>
                                        {post.title}
                                    </TableCell>
                                    <TableCell>{post.category || "General"}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => openSolutionDialog(post)}
                                            >
                                                <MessageCircle className="w-4 h-4 mr-1" />
                                                {post.is_published ? "Edit Answer" : "Answer"}
                                            </Button>

                                            {post.is_published && (
                                                <Button size="sm" variant="ghost" onClick={() => handleUnpublish(post.id)} title="Unpublish">
                                                    <XCircle className="w-4 h-4 text-yellow-600" />
                                                </Button>
                                            )}

                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(post.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isSolutionDialogOpen} onOpenChange={setIsSolutionDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Expert Solution</DialogTitle>
                    </DialogHeader>
                    {selectedPost && (
                        <div className="space-y-4 py-4">
                            <div className="p-4 bg-secondary/30 rounded-lg">
                                <h4 className="font-semibold mb-2 text-sm text-primary">User Question:</h4>
                                <p className="font-medium mb-1">{selectedPost.title}</p>
                                <p className="text-sm text-muted-foreground">{selectedPost.description}</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Your Expert Answer</label>
                                <Textarea
                                    placeholder="Type your helpful, professional response here..."
                                    className="min-h-[150px]"
                                    value={solution}
                                    onChange={(e) => setSolution(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsSolutionDialogOpen(false)}>Cancel</Button>
                                <Button onClick={() => handlePublish(selectedPost, solution)}>
                                    {selectedPost.is_published ? "Update & Publish" : "Publish to Community"}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
