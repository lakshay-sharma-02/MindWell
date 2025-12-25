
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Smile, Meh, Frown, Angry, Frown as Sad, Loader2, Calendar, History } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Tables } from "@/types/database";
import { Link } from "react-router-dom";

type MoodLog = Tables<"mood_logs">;

const MOODS = [
    { value: "happy", label: "Happy", icon: Smile, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
    { value: "neutral", label: "Okay", icon: Meh, color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20" },
    { value: "sad", label: "Sad", icon: Sad, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    { value: "anxious", label: "Anxious", icon: Frown, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
    { value: "angry", label: "Angry", icon: Angry, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20" },
];

export function MoodTracker() {
    const { user } = useAuth();
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [history, setHistory] = useState<MoodLog[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(true);

    useEffect(() => {
        if (user) {
            fetchHistory();
        } else {
            setLoadingHistory(false);
        }
    }, [user]);

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from("mood_logs")
                .select("*")
                .eq("user_id", user!.id)
                .order("created_at", { ascending: false })
                .limit(5);

            if (error) throw error;
            setHistory(data || []);
        } catch (error) {
            console.error("Error fetching mood history:", error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!selectedMood) {
            toast.error("Please select a mood");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase.from("mood_logs").insert({
                user_id: user.id,
                mood: selectedMood,
                note: note.trim() || null,
            });

            if (error) throw error;

            toast.success("Mood logged successfully");
            setSelectedMood(null);
            setNote("");
            fetchHistory();
        } catch (error) {
            console.error("Error logging mood:", error);
            toast.error("Failed to log mood");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return (
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-3xl p-8 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                    <Smile className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-3">Track Your Journey</h3>
                <p className="text-muted-foreground mb-8 max-w-xs mx-auto">
                    Log your daily moods and identify patterns over time. Sign in to start your wellness journal.
                </p>
                <Button asChild size="lg" className="btn-glow">
                    <Link to="/auth">Sign In to Track Mood</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Logger */}
            <div className="bg-card border border-border/50 rounded-3xl p-6 md:p-8 shadow-sm">
                <h3 className="text-xl font-display font-bold mb-6">How are you feeling?</h3>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-5 gap-3 mb-8">
                        {MOODS.map((m) => {
                            const isSelected = selectedMood === m.value;
                            return (
                                <button
                                    key={m.value}
                                    type="button"
                                    onClick={() => setSelectedMood(m.value)}
                                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${isSelected
                                            ? `${m.bg} ring-2 ring-primary ring-offset-2 ring-offset-background scale-105`
                                            : "hover:bg-secondary hover:scale-105"
                                        }`}
                                >
                                    <m.icon className={`w-8 h-8 ${isSelected ? m.color : "text-muted-foreground"}`} />
                                    <span className="text-xs font-medium">{m.label}</span>
                                </button>
                            )
                        })}
                    </div>

                    <div className="space-y-4 mb-6">
                        <label className="text-sm font-medium text-muted-foreground">Add a note (optional)</label>
                        <Textarea
                            placeholder="What's on your mind today?"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="resize-none h-32 bg-background/50 focus:bg-background transition-colors"
                        />
                    </div>

                    <Button type="submit" disabled={isSubmitting || !selectedMood} className="w-full">
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <History className="w-4 h-4 mr-2" />}
                        Log Mood
                    </Button>
                </form>
            </div>

            {/* History */}
            <div className="bg-secondary/20 rounded-3xl p-6 md:p-8">
                <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    Recent History
                </h3>

                {loadingHistory ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-2xl">
                        <p className="text-muted-foreground italic">No logs yet. Start today!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {history.map((log) => {
                            const moodDef = MOODS.find(m => m.value === log.mood) || MOODS[1];
                            return (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="bg-background rounded-2xl p-4 flex gap-4 items-start shadow-sm border border-border/50"
                                >
                                    <div className={`p-2 rounded-xl ${moodDef.bg}`}>
                                        <moodDef.icon className={`w-5 h-5 ${moodDef.color}`} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold capitalize text-sm">{moodDef.label}</span>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(log.created_at), "MMM d, h:mm a")}
                                            </span>
                                        </div>
                                        {log.note && (
                                            <p className="text-sm text-muted-foreground leading-snug">"{log.note}"</p>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
