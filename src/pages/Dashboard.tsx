
import { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { useAuth } from "@/hooks/useAuth";
import { WelcomeWidget } from "@/components/dashboard/WelcomeWidget";
import { MoodSummaryWidget } from "@/components/dashboard/MoodSummaryWidget";
import { QuickActionsWidget } from "@/components/dashboard/QuickActionsWidget";
import { RecommendedWidget } from "@/components/dashboard/RecommendedWidget";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <Layout>
            <SEOHead
                title="My Sanctuary | MindWell"
                description="Your personalized mental wellness dashboard."
            />

            <div className="container-wide py-24 min-h-screen bg-secondary/5">
                <div className="max-w-6xl mx-auto space-y-6">
                    {/* Top Row: Welcome (Full Width) */}
                    <WelcomeWidget userName={profile?.full_name} />

                    {/* Middle Row: Mood & Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 h-[300px]">
                            <MoodSummaryWidget userId={user.id} />
                        </div>
                        <div className="h-[300px]">
                            <QuickActionsWidget />
                        </div>
                    </div>

                    {/* Bottom Row: Recommendations */}
                    <div className="pt-2">
                        <RecommendedWidget />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
