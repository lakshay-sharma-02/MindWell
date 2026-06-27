import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
    Smile, Meh, Frown, Angry, Frown as Sad, 
    Loader2, Calendar, History, Briefcase, 
    Coffee, Moon, Users, Dumbbell, Book, 
    Heart, Check
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Tables } from "@/types/database";
import { Link } from "react-router-dom";
import { AIMoodInsights } from "@/components/ai/AIMoodInsights";
import { useXP, XP_AMOUNTS } from "@/hooks/useXP";
import { useOfflineSupport } from "@/utils/offlineSupport";
import { cn } from "@/lib/utils";

type MoodLog = Tables<"mood_logs">;

// 1. Core Moods (Broad Categories)
const CORE_MOODS = [
    { value: "happy", label: "Happy", icon: Smile, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20", glow: "shadow-green-500/20" },
    { value: "neutral", label: "Okay", icon: Meh, color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/20", glow: "shadow-yellow-500/20" },
    { value: "sad", label: "Sad", icon: Sad, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20", glow: "shadow-blue-500/20" },
    { value: "anxious", label: "Anxious", icon: Frown, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20", glow: "shadow-purple-500/20" },
    { value: "angry", label: "Angry", icon: Angry, color: "text-red-500", bg: "bg-red-500/10 border-red-500/20", glow: "shadow-red-500/20" },
];

// 2. Sub-Emotions (Emotion Wheel)
const SUB_EMOTIONS: Record<string, string[]> = {
    happy: ["Joyful", "Proud", "Optimistic", "Peaceful", "Loved", "Excited", "Grateful"],
    neutral: ["Bored", "Calm", "Indifferent", "Pensive", "Tired", "Distracted"],
    sad: ["Lonely", "Guilty", "Depressed", "Disappointed", "Grief", "Apathetic"],
    anxious: ["Overwhelmed", "Worried", "Insecure", "Nervous", "Stressed", "Panicked"],
    angry: ["Frustrated", "Annoyed", "Furious", "Resentful", "Jealous", "Irritated"],
};

// 3. Activity Tags
const ACTIVITIES = [
    { id: "work", label: "Work", icon: Briefcase },
    { id: "family", label: "Family", icon: Users },
    { id: "friends", label: "Friends", icon: Heart },
    { id: "exercise", label: "Exercise", icon: Dumbbell },
    { id: "sleep", label: "Sleep", icon: Moon },
    { id: "hobbies", label: "Hobbies", icon: Book },
    { id: "relax", label: "Relaxing", icon: Coffee },
];

export function MoodTracker() {
    const { user } = useAuth();
    const { awardXP } = useXP();
    const { isOffline, addToQueue } = useOfflineSupport();
    
    // State
    const [step, setStep] = useState<1 | 2>(1);
    const [selectedMood, setSelectedMood] = useState<string | null>(null);
    const [selectedSubEmotion, setSelectedSubEmotion] = useState<string | null>(null);
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
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

    const toggleActivity = (activityId: string) => {
        setSelectedActivities(prev => 
            prev.includes(activityId) 
                ? prev.filter(id => id !== activityId)
                : [...prev, activityId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!selectedMood) {
            toast.error("Please select a mood");
            return;
        }

        setIsSubmitting(true);
        const logData = {
            user_id: user.id,
            mood: selectedMood,
            sub_emotion: selectedSubEmotion,
            activities: selectedActivities.length > 0 ? selectedActivities : null,
            note: note.trim() || null,
        };

        try {
            if (isOffline) {
                // Queue for offline
                addToQueue({
                    url: '/rest/v1/mood_logs',
                    method: 'POST',
                    body: logData
                });
                
                // Optimistic update
                setHistory([{
                    id: 'temp-' + Date.now(),
                    ...logData,
                    created_at: new Date().toISOString()
                } as MoodLog, ...history]);
                
                toast.success("Saved offline! Will sync when connected.");
            } else {
                const { error } = await supabase.from("mood_logs").insert(logData);
                if (error) throw error;

                // Award XP
                await awardXP(
                    XP_AMOUNTS.MOOD_LOG,
                    'mood_log',
                    `Logged mood: ${selectedSubEmotion || selectedMood}`,
                    { mood: selectedMood, has_note: !!note.trim() }
                );

                await supabase.rpc('check_badge_eligibility', { p_user_id: user.id });
                await supabase.rpc('increment_challenge_progress', { p_user_id: user.id, p_challenge_type: 'mood_tracking' });

                toast.success("Mood logged successfully! +10 XP");
                fetchHistory();
            }

            // Reset
            setStep(1);
            setSelectedMood(null);
            setSelectedSubEmotion(null);
            setSelectedActivities([]);
            setNote("");
            
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

    const currentMoodConfig = MOODS.find(m => m.value === selectedMood);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Mood Logger */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl shadow-xl border-border/50 overflow-hidden relative">
                
                {/* Background glow based on selected mood */}
                {selectedMood && currentMoodConfig && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 0.1 }} 
                        className={cn("absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] pointer-events-none", currentMoodConfig.bg)} 
                    />
                )}

                <div className="mb-8 text-center relative z-10">
                    <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">How are you feeling today?</h2>
                    <p className="text-muted-foreground">Select your mood to track your emotional well-being</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                    
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                    {CORE_MOODS.map((mood) => {
                                        const Icon = mood.icon;
                                        const isSelected = selectedMood === mood.value;
                                        return (
                                            <motion.button
                                                key={mood.value}
                                                type="button"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setSelectedMood(mood.value);
                                                    setSelectedSubEmotion(null); // Reset sub-emotion
                                                    setTimeout(() => setStep(2), 300); // Auto advance
                                                }}
                                                className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-3 ${
                                                    isSelected
                                                        ? `${mood.bg} border-current scale-105 shadow-[0_0_20px_rgba(0,0,0,0.1)] ${mood.glow}`
                                                        : "bg-card border-border hover:border-primary/30"
                                                }`}
                                            >
                                                <Icon className={`w-12 h-12 ${isSelected ? mood.color : "text-muted-foreground/50 transition-colors"}`} />
                                                <p className={`text-sm font-semibold tracking-wide uppercase ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                                                    {mood.label}
                                                </p>
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && selectedMood && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-8"
                            >
                                {/* Selected Core Mood Header */}
                                <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl">
                                    <Button 
                                        type="button" 
                                        variant="ghost" 
                                        onClick={() => setStep(1)}
                                        className="text-muted-foreground hover:text-foreground"
                                    >
                                        &larr; Back
                                    </Button>
                                    <div className="flex items-center gap-2">
                                        {(() => {
                                            const cfg = MOODS.find(m => m.value === selectedMood);
                                            const Icon = cfg?.icon || Smile;
                                            return <Icon className={`w-6 h-6 ${cfg?.color}`} />;
                                        })()}
                                        <span className="font-semibold capitalize text-lg">{selectedMood}</span>
                                    </div>
                                </div>

                                {/* Nuanced Emotion Wheel */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Specifically, I feel...</label>
                                    <div className="flex flex-wrap gap-2">
                                        {SUB_EMOTIONS[selectedMood].map((emotion) => (
                                            <button
                                                key={emotion}
                                                type="button"
                                                onClick={() => setSelectedSubEmotion(emotion === selectedSubEmotion ? null : emotion)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                                                    selectedSubEmotion === emotion
                                                        ? "bg-primary text-primary-foreground border-primary shadow-md scale-105"
                                                        : "bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                                                }`}
                                            >
                                                {emotion}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Activity Tags */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Related to...</label>
                                    <div className="flex flex-wrap gap-2">
                                        {ACTIVITIES.map((activity) => {
                                            const Icon = activity.icon;
                                            const isSelected = selectedActivities.includes(activity.id);
                                            return (
                                                <button
                                                    key={activity.id}
                                                    type="button"
                                                    onClick={() => toggleActivity(activity.id)}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${
                                                        isSelected
                                                            ? "bg-secondary text-secondary-foreground border-primary/20 shadow-sm"
                                                            : "bg-card border-border hover:bg-muted"
                                                    }`}
                                                >
                                                    <Icon className="w-4 h-4" />
                                                    {activity.label}
                                                    {isSelected && <Check className="w-3 h-3 ml-1" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Optional Note */}
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Notes (Optional)</label>
                                    <Textarea
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="Add context to your mood..."
                                        className="min-h-[100px] resize-none bg-card/50 backdrop-blur-sm border-border focus-visible:ring-primary/50"
                                    />
                                </div>

                                <Button type="submit" size="lg" className="w-full btn-glow h-14 text-lg font-medium" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Calendar className="w-5 h-5 mr-2" />
                                            Save Log (+10 XP)
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                </form>
            </div>

            {/* AI Mood Insights */}
            <AIMoodInsights />

            {/* Recent History */}
            <div className="glass-card p-6 rounded-3xl">
                <div className="flex items-center gap-2 mb-6">
                    <History className="w-5 h-5 text-primary" />
                    <h3 className="font-display font-bold text-xl">Recent History</h3>
                </div>

                {loadingHistory ? (
                    <div className="text-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                        <p className="text-muted-foreground">No mood logs yet. Start tracking today!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {history.map((log, index) => {
                                const moodCfg = CORE_MOODS.find((m) => m.value === log.mood);
                                const Icon = moodCfg?.icon || Smile;
                                return (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`p-5 rounded-2xl border ${moodCfg?.bg || "bg-card"} shadow-sm`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 mt-1">
                                                <Icon className={`w-8 h-8 ${moodCfg?.color || "text-muted-foreground"}`} />
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-2">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="font-semibold text-lg capitalize text-foreground/90">
                                                            {log.sub_emotion || log.mood}
                                                        </span>
                                                        {log.sub_emotion && (
                                                            <span className="text-sm text-muted-foreground/80 capitalize">
                                                                (Overall: {log.mood})
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs font-medium text-muted-foreground bg-background/50 px-2 py-1 rounded-full">
                                                        {format(new Date(log.created_at), "MMM d, h:mm a")}
                                                    </span>
                                                </div>
                                                
                                                {/* Activities */}
                                                {log.activities && log.activities.length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                                        {log.activities.map(actId => {
                                                            const act = ACTIVITIES.find(a => a.id === actId);
                                                            if (!act) return null;
                                                            const ActIcon = act.icon;
                                                            return (
                                                                <span key={actId} className="inline-flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider bg-background/60 text-muted-foreground px-2 py-0.5 rounded-full border border-border/50">
                                                                    <ActIcon className="w-3 h-3" />
                                                                    {act.label}
                                                                </span>
                                                            )
                                                        })}
                                                    </div>
                                                )}

                                                {log.note && (
                                                    <p className="text-sm text-muted-foreground bg-background/40 p-3 rounded-xl border border-border/30 mt-2">
                                                        "{log.note}"
                                                    </p>
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

// Ensure CORE_MOODS is mapped properly since I renamed it from MOODS for clarity
const MOODS = CORE_MOODS;
