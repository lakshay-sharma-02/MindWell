
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { WelcomeWidget } from "@/components/dashboard/WelcomeWidget";
import { MoodSummaryWidget } from "@/components/dashboard/MoodSummaryWidget";
import { QuickActionsWidget } from "@/components/dashboard/QuickActionsWidget";
import { RecommendedWidget } from "@/components/dashboard/RecommendedWidget";
import { DailyAffirmationWidget } from "@/components/dashboard/DailyAffirmationWidget";
import { useNavigate } from "react-router-dom";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { supabase } from "@/integrations/supabase/client";

import { motion, Variants } from "framer-motion";

export default function Dashboard() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/auth");
        } else if (user) {
            fetchProfile();
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

                    <motion.div variants={item}>
                        <DailyAffirmationWidget />
                    </motion.div>

                    {/* Middle Row: Mood & Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <motion.div variants={item} className="md:col-span-2 h-[300px]">
                            <MoodSummaryWidget userId={user.id} />
                        </motion.div>
                        <motion.div variants={item} className="h-auto">
                            <QuickActionsWidget />
                        </motion.div>
                    </div>

                    {/* Bottom Row: Recommendations */}
                    <motion.div variants={item} className="pt-2">
                        <RecommendedWidget />
                    </motion.div>
                </motion.div>
            </div>
        </Layout>
    );
}
