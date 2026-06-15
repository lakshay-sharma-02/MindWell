
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
import { AIMoodInsights } from "@/components/ai/AIMoodInsights";
import { useXP, XP_AMOUNTS } from "@/hooks/useXP";

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
    const { awardXP } = useXP();
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

            // Award XP for mood log
            await awardXP(
                XP_AMOUNTS.MOOD_LOG,
                'mood_log',
                `Logged mood: ${selectedMood}`,
                { mood: selectedMood, has_note: !!note.trim() }
            );

            // Check for badge eligibility
            await supabase.rpc('check_badge_eligibility', {
                p_user_id: user.id
            });

            // Increment challenge progress if applicable
            await supabase.rpc('increment_challenge_progress', {
                p_user_id: user.id,
                p_challenge_type: 'mood_tracking'
            });

            toast.success("Mood logged successfully! +10 XP");
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
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Mood Logger */}
            <div className="glass-card p-8 rounded-3xl">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-display font-bold mb-2">How are you feeling today?</h2>
                    <p className="text-muted-foreground">Select your mood and add optional notes</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Mood Selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {MOODS.map((mood) => {
                            const Icon = mood.icon;
                            const isSelected = selectedMood === mood.value;
                            return (
                                <motion.button
                                    key={mood.value}
                                    type="button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setSelectedMood(mood.value)}
                                    className={`p-6 rounded-2xl border-2 transition-all ${
                                        isSelected
                                            ? `${mood.bg} border-current scale-105 shadow-lg`
                                            : "bg-card border-border hover:border-primary/30"
                                    }`}
                                >
                                    <Icon className={`w-10 h-10 mx-auto mb-2 ${isSelected ? mood.color : "text-muted-foreground"}`} />
                                    <p className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                                        {mood.label}
                                    </p>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Optional Note */}
                    <div>
                        <label className="block text-sm font-medium mb-2">How are you feeling? (Optional)</label>
                        <Textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Share more about your mood..."
                            className="min-h-[100px] resize-none"
                        />
                    </div>

                    <Button type="submit" size="lg" className="w-full btn-glow" disabled={!selectedMood || isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Calendar className="w-5 h-5 mr-2" />
                                Log Mood (+10 XP)
                            </>
                        )}
                    </Button>
                </form>
            </div>

            {/* AI Mood Insights */}
            <AIMoodInsights />

            {/* Recent History */}
            <div className="glass-card p-6 rounded-3xl">
                <div className="flex items-center gap-2 mb-4">
                    <History className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-bold text-lg">Recent Mood Logs</h3>
                </div>

                {loadingHistory ? (
                    <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    </div>
                ) : history.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No mood logs yet. Start tracking today!</p>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence>
                            {history.map((log, index) => {
                                const mood = MOODS.find((m) => m.value === log.mood);
                                const Icon = mood?.icon || Smile;
                                return (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`p-4 rounded-xl border ${mood?.bg || "bg-card"}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0">
                                                <Icon className={`w-6 h-6 ${mood?.color || "text-muted-foreground"}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2 mb-1">
                                                    <span className="font-semibold capitalize">{log.mood}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {format(new Date(log.created_at), "MMM d, h:mm a")}
                                                    </span>
                                                </div>
                                                {log.note && (
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{log.note}</p>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
