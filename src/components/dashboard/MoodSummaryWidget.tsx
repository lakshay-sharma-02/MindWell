
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Smile, Meh, Frown, Angry, Frown as Sad, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const MOOD_ICONS: Record<string, any> = {
    happy: Smile,
    neutral: Meh,
    sad: Sad,
    anxious: Frown,
    angry: Angry,
};

const MOOD_COLORS: Record<string, string> = {
    happy: "text-green-500 bg-green-500/10",
    neutral: "text-yellow-500 bg-yellow-500/10",
    sad: "text-blue-500 bg-blue-500/10",
    anxious: "text-purple-500 bg-purple-500/10",
    angry: "text-red-500 bg-red-500/10",
};

interface MoodSummaryWidgetProps {
    userId: string;
}

export function MoodSummaryWidget({ userId }: MoodSummaryWidgetProps) {
    const [loading, setLoading] = useState(true);
    const [recentMoods, setRecentMoods] = useState<any[]>([]);

    useEffect(() => {
        const fetchMoods = async () => {
            const { data } = await supabase
                .from("mood_logs")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false })
                .limit(5);

            if (data) setRecentMoods(data);
            setLoading(false);
        };

        if (userId) fetchMoods();
    }, [userId]);

    const latestMood = recentMoods[0];
    const LatestIcon = latestMood ? MOOD_ICONS[latestMood.mood] || Meh : Meh;
    const latestColor = latestMood ? MOOD_COLORS[latestMood.mood] || "text-gray-500 bg-gray-500/10" : "text-gray-500";

    if (loading) {
        return (
            <Card className="h-full flex items-center justify-center p-6">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display">Mood Check-in</CardTitle>
                <CardDescription>Your emotional trends</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
                {recentMoods.length > 0 ? (
                    <>
                        <div className="flex items-center gap-4 mb-6">
                            <div className={`p-4 rounded-2xl ${latestColor}`}>
                                <LatestIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Latest log</p>
                                <h3 className="text-xl font-bold capitalize">{latestMood.mood}</h3>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(latestMood.created_at), "h:mm a, MMM d")}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-2 justify-between items-end mt-auto">
                            {/* Mini visualization of history dots */}
                            <div className="flex gap-1.5">
                                {recentMoods.slice(0, 5).reverse().map((log) => {
                                    const colorClass = MOOD_COLORS[log.mood]?.split(" ")[0] || "text-gray-400";
                                    return (
                                        <div
                                            key={log.id}
                                            className={`w-2 h-8 rounded-full opacity-50 ${colorClass.replace("text-", "bg-")}`}
                                            title={`${log.mood} - ${format(new Date(log.created_at), "MMM d")}`}
                                        />
                                    )
                                })}
                            </div>
                            <Button variant="ghost" size="sm" className="text-xs" asChild>
                                <Link to="/tools">View All <ArrowRight className="w-3 h-3 ml-1" /></Link>
                            </Button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-6">
                        <p className="text-muted-foreground text-sm mb-4">No mood logs yet.</p>
                        <Button size="sm" className="w-full" asChild>
                            <Link to="/tools">Log First Mood</Link>
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
