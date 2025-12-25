import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Download, MessageSquare, ArrowUpRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminStats {
    total_users: number;
    total_blogs: number;
    total_resources: number;
    pending_stories: number;
}

export function AdminOverview() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const { data, error } = await supabase.rpc('get_admin_stats');
            if (error) throw error;
            setStats(data as AdminStats);
        } catch (error) {
            console.error("Error fetching admin stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: "Total Users",
            value: stats?.total_users || 0,
            icon: Users,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
        },
        {
            title: "Published Blogs",
            value: stats?.total_blogs || 0,
            icon: FileText,
            color: "text-green-500",
            bg: "bg-green-500/10",
        },
        {
            title: "Resources",
            value: stats?.total_resources || 0,
            icon: Download,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
        },
        {
            title: "Pending Stories",
            value: stats?.pending_stories || 0,
            icon: MessageSquare,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-display font-bold text-foreground">Dashboard Overview</h2>
                <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <Card key={index} className="border-border/50 shadow-sm hover:shadow-md transition-all">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                <ArrowUpRight className="w-3 h-3 mr-1 text-green-500" />
                                Updated just now
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions or Recent Activity could go here */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-border/50">
                    <CardHeader>
                        <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Database Connection</span>
                                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 font-medium">Healthy</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">API Latency</span>
                                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-500 font-medium">24ms</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm">Last Backup</span>
                                <span className="text-xs text-muted-foreground">Today, 04:00 AM</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Placeholder for more widgets */}
            </div>
        </div>
    );
}
