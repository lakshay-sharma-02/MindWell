
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Heart, Calendar, Trash2, Sun } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

interface GratitudeLog {
    id: string;
    content: string;
    created_at: string;
}

export function GratitudeJournal() {
    const [logs, setLogs] = useState<GratitudeLog[]>([]);
    const [newEntry, setNewEntry] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        checkUser();
    }, []);

    useEffect(() => {
        if (user) fetchLogs();
    }, [user]);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('gratitude_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Error fetching gratitude logs:', error);
            toast.error("Failed to load your journal.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEntry.trim()) return;
        if (!user) {
            toast.error("Please sign in to save your journal.");
            return;
        }

        setSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('gratitude_logs')
                .insert([
                    { user_id: user.id, content: newEntry.trim() }
                ])
                .select()
                .single();

            if (error) throw error;

            setLogs([data, ...logs]);
            setNewEntry("");
            toast.success("Saved to your gratitude journal!");
        } catch (error) {
            console.error('Error saving gratitude log:', error);
            toast.error("Failed to save entry.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const { error } = await supabase
                .from('gratitude_logs')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setLogs(logs.filter(log => log.id !== id));
            toast.success("Entry deleted.");
        } catch (error) {
            console.error('Error deleting log:', error);
            toast.error("Failed to delete entry.");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="grid gap-8 md:grid-cols-[1fr_1.5fr]">
            {/* Input Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="border-none shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-2xl font-display text-orange-700 dark:text-orange-400">
                            <Sun className="w-6 h-6" />
                            Daily Gratitude
                        </CardTitle>
                        <CardDescription className="text-base text-orange-800/80 dark:text-orange-200/80">
                            Take a moment to reflect. What is one thing you are grateful for today?
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Textarea
                                placeholder="Today, I am grateful for..."
                                className="min-h-[150px] text-lg bg-white/50 dark:bg-black/20 border-orange-200 dark:border-orange-800 focus-visible:ring-orange-400 resize-none p-4 rounded-xl placeholder:text-muted-foreground/50"
                                value={newEntry}
                                onChange={(e) => setNewEntry(e.target.value)}
                            />
                            <Button
                                type="submit"
                                disabled={submitting || !newEntry.trim()}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70"
                            >
                                {submitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                ) : (
                                    <Heart className="w-5 h-5 mr-2 fill-current" />
                                )}
                                Save to Journal
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>

            {/* History Grid */}
            <div className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                    <h3 className="text-xl font-semibold text-foreground/80">Your Collection</h3>
                    <span className="text-sm text-muted-foreground">{logs.length} moments</span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <AnimatePresence mode="popLayout">
                        {logs.map((log) => (
                            <motion.div
                                key={log.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Card className="h-full bg-card/50 hover:bg-card transition-colors border-border/50 hover:border-border group relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange-400 to-amber-400 opacity-50" />
                                    <CardContent className="p-5 pt-6">
                                        <p className="text-lg leading-relaxed text-foreground/90 font-medium whitespace-pre-wrap mb-4">
                                            "{log.content}"
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(log.created_at), "MMM d, yyyy")}
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDelete(log.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                <span className="sr-only">Delete</span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {logs.length === 0 && (
                        <div className="col-span-full py-12 text-center text-muted-foreground bg-secondary/10 rounded-xl border border-dashed border-border">
                            <Sun className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                            <p>No gratitude logs yet.</p>
                            <p className="text-sm mt-1 opacity-70">Start by writing down one simple thing.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
