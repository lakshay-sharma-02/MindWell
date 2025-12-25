
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Check, X, Trash2, Quote, Clock, User, CalendarDays, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatDistanceToNow, format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

type Story = Tables<"stories">;

export function StoriesManager() {
    const [stories, setStories] = useState<Story[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("stories")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setStories(data || []);
        } catch (error) {
            console.error("Error fetching stories:", error);
            toast.error("Failed to load stories");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const { error } = await supabase
                .from("stories")
                .update({ approved: true })
                .eq("id", id);

            if (error) throw error;
            toast.success("Story approved and published");
            fetchStories();
        } catch (error) {
            console.error("Error approving story:", error);
            toast.error("Failed to approve story");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this story permanently?")) return;

        try {
            const { error } = await supabase
                .from("stories")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Story deleted");
            fetchStories();
        } catch (error) {
            console.error("Error deleting story:", error);
            toast.error("Failed to delete story");
        }
    };

    const pendingStories = stories.filter(s => !s.approved);
    const approvedStories = stories.filter(s => s.approved);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight font-display">Community Board</h2>
                    <p className="text-muted-foreground mt-1">Review and manage stories shared by the community.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary/30 rounded-lg border border-border/50">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium">{stories.length} Total Stories</span>
                </div>
            </div>

            <Tabs defaultValue="pending" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-8">
                    <TabsTrigger value="pending" className="relative data-[state=active]:bg-primary/10 data-[state=active]:text-primary transition-all">
                        Pending Review
                        {pendingStories.length > 0 && (
                            <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">
                                {pendingStories.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="published" className="data-[state=active]:bg-green-500/10 data-[state=active]:text-green-600 transition-all">
                        Published
                    </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    <TabsContent value="pending" className="mt-0 focus-visible:outline-none">
                        {isLoading ? (
                            <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                        ) : pendingStories.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-20 border-2 border-dashed border-border/50 rounded-3xl bg-secondary/5"
                            >
                                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Check className="w-8 h-8 text-muted-foreground/50" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">All Caught Up</h3>
                                <p className="text-muted-foreground">There are no pending stories waiting for review.</p>
                            </motion.div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {pendingStories.map((story, i) => (
                                    <StoryCard
                                        key={story.id}
                                        story={story}
                                        index={i}
                                        onApprove={() => handleApprove(story.id)}
                                        onDelete={() => handleDelete(story.id)}
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="published" className="mt-0 focus-visible:outline-none">
                        {isLoading ? (
                            <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                        ) : approvedStories.length === 0 ? (
                            <div className="text-center py-20 border-border/50 rounded-3xl">
                                <p className="text-muted-foreground">No approved stories yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {approvedStories.map((story, i) => (
                                    <StoryCard
                                        key={story.id}
                                        story={story}
                                        index={i}
                                        onDelete={() => handleDelete(story.id)}
                                        isPublished
                                    />
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </AnimatePresence>
            </Tabs>
        </div>
    );
}

function StoryCard({ story, index, onApprove, onDelete, isPublished }: { story: Story, index: number, onApprove?: () => void, onDelete: () => void, isPublished?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card className="h-full flex flex-col group hover:shadow-lg transition-all duration-300 border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="space-y-4 pb-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1.5">
                            <h3 className="font-display font-bold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                                {story.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <Badge variant={story.is_anonymous ? "secondary" : "outline"} className="rounded-md font-normal">
                                    {story.is_anonymous ? "Anonymous" : story.name || "Unknown"}
                                </Badge>
                                <span className="flex items-center gap-1 bg-secondary/50 px-2 py-0.5 rounded-md">
                                    <Clock className="w-3 h-3" />
                                    {formatDistanceToNow(new Date(story.created_at), { addSuffix: true })}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="flex-grow">
                    <div className="relative p-4 bg-secondary/10 rounded-xl border border-secondary/20">
                        <Quote className="absolute -top-3 -left-2 w-6 h-6 text-primary/20 fill-primary/10" />
                        <p className="text-sm text-foreground/80 leading-relaxed italic line-clamp-[8]">
                            {story.content}
                        </p>
                    </div>
                </CardContent>

                <CardFooter className="pt-4 border-t border-border/50 bg-secondary/5 flex justify-between gap-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onDelete}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors w-full sm:w-auto"
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                    </Button>

                    {!isPublished && onApprove && (
                        <Button
                            size="sm"
                            onClick={onApprove}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all w-full sm:w-auto"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Approve
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </motion.div>
    )
}
