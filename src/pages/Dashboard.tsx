
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { WelcomeWidget } from "@/components/dashboard/WelcomeWidget";
import { MoodSummaryWidget } from "@/components/dashboard/MoodSummaryWidget";
import { QuickActionsWidget } from "@/components/dashboard/QuickActionsWidget";
import { RecommendedWidget } from "@/components/dashboard/RecommendedWidget";
import { DailyAffirmationWidget } from "@/components/dashboard/DailyAffirmationWidget";
import { StreakWidget } from "@/components/dashboard/StreakWidget";
import { MentalHealthScoreWidget } from "@/components/dashboard/MentalHealthScoreWidget";
import { AICrisisPredictor } from "@/components/ai/AICrisisPredictor";
import { AIWeeklyReport } from "@/components/ai/AIWeeklyReport";
import { AIGoalSetter } from "@/components/ai/AIGoalSetter";
import { useNavigate } from "react-router-dom";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { supabase } from "@/integrations/supabase/client";
import { DailyRewardWheel } from "@/components/engagement/DailyRewardWheel";
import { DailyCheckInWidget } from "@/components/engagement/DailyCheckInWidget";

import { motion, Variants } from "framer-motion";

export default function Dashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({ moodLogs: 0, journalEntries: 0, daysActive: 0 });
    const [moodHistory, setMoodHistory] = useState<any[]>([]);
    const [journalHistory, setJournalHistory] = useState<any[]>([]);
    const [streakDays, setStreakDays] = useState(0);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/auth");
        } else if (user) {
            fetchProfile();
            fetchStats();
        }
    }, [user, loading, navigate]);

    const fetchProfile = async () => {
        const { data } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user!.id)
            .single();

        if (data) setProfile(data);
    };

    const fetchStats = async () => {
        // Fetch mood logs count and data
        const { data: moods, count: moodCount } = await supabase
            .from("mood_logs")
            .select("*", { count: 'exact' })
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false })
            .limit(30);

        if (moods) setMoodHistory(moods);

        // Fetch gratitude entries count (as journal proxy)
        const { data: journals, count: journalCount } = await supabase
            .from("gratitude_entries")
            .select("*", { count: 'exact' })
            .eq("user_id", user!.id)
            .order("created_at", { ascending: false })
            .limit(30);

        if (journals) setJournalHistory(journals);

        // Calculate days active
        const { data: firstActivity } = await supabase
            .from("mood_logs")
            .select("created_at")
            .eq("user_id", user!.id)
            .order("created_at", { ascending: true })
            .limit(1);

        const daysActive = firstActivity?.length
            ? Math.floor((Date.now() - new Date(firstActivity[0].created_at).getTime()) / (1000 * 60 * 60 * 24))
            : 0;

        // Get streak
        const currentStreak = parseInt(localStorage.getItem(`streak_${user!.id}`) || "0");
        setStreakDays(currentStreak);

        setStats({
            moodLogs: moodCount || 0,
            journalEntries: journalCount || 0,
            daysActive: daysActive || 0,
        });
    };

    if (loading || !user) {
        return <PageSkeleton />;
    }

    const container: Variants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
    };

    return (
        <Layout>
            <SEOHead
                title="My Sanctuary | Psyche Space"
                description="Your personalized mental wellness dashboard."
            />

            <div className="container-wide py-24 min-h-screen bg-secondary/5">
                <motion.div
                    className="max-w-6xl mx-auto space-y-6"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    {/* Top Row: Welcome (Full Width) */}
                    <motion.div variants={item}>
                        <WelcomeWidget userName={profile?.full_name} />
                    </motion.div>

                    {/* Daily Reward Wheel - First thing users see! */}
                    <motion.div variants={item}>
                        <DailyRewardWheel />
                    </motion.div>

                    {/* Daily Check-ins Widget */}
                    <motion.div variants={item}>
                        <DailyCheckInWidget />
                    </motion.div>

                    <motion.div variants={item}>
                        <DailyAffirmationWidget />
                    </motion.div>

                    {/* Streak & Score Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <motion.div variants={item}>
                            <StreakWidget userId={user.id} />
                        </motion.div>
                        <motion.div variants={item}>
                            <MentalHealthScoreWidget
                                userId={user.id}
                                moodLogs={stats.moodLogs}
                                journalEntries={stats.journalEntries}
                                daysActive={stats.daysActive}
                                lastActiveDate={new Date().toISOString()}
                            />
                        </motion.div>
                    </div>

                    {/* Middle Row: Mood & Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div variants={item} className="md:col-span-2 h-[300px]">
                            <MoodSummaryWidget userId={user.id} />
                        </motion.div>
                        <motion.div variants={item} className="h-auto">
                            <QuickActionsWidget />
                        </motion.div>
                    </div>

                    {/* AI-Powered Features Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div variants={item}>
                            <AIGoalSetter
                                userId={user.id}
                                moodData={{
                                    averageMood: moodHistory.length > 0 ? moodHistory[0].mood : 'neutral',
                                    consistency: Math.min(100, (stats.moodLogs / 30) * 100),
                                    recentPatterns: [],
                                }}
                            />
                        </motion.div>
                        <motion.div variants={item}>
                            <AICrisisPredictor
                                moodHistory={moodHistory.map(m => ({
                                    mood: m.mood,
                                    note: m.note,
                                    created_at: m.created_at,
                                }))}
                                userId={user.id}
                            />
                        </motion.div>
                    </div>

                    {/* Weekly Report */}
                    <motion.div variants={item}>
                        <AIWeeklyReport
                            moodLogs={moodHistory.map(m => ({
                                mood: m.mood,
                                note: m.note,
                                created_at: m.created_at,
                            }))}
                            journalEntries={journalHistory.map(j => ({
                                content: j.entry,
                                created_at: j.created_at,
                            }))}
                            streakDays={streakDays}
                            toolsUsed={['Mood Tracker', 'Gratitude Journal']}
                        />
                    </motion.div>

                    {/* Bottom Row: Recommendations */}
                    <motion.div variants={item} className="pt-2">
                        <RecommendedWidget />
                    </motion.div>
                </motion.div>
            </div>
        </Layout>
    );
}
