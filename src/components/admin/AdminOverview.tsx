import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Download, MessageSquare, ArrowUpRight, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdminStats {
    total_users: number;
    total_blogs: number;
    total_resources: number;
    pending_stories: number;
}

const mockChartData = [
    { name: 'Mon', users: 4 },
    { name: 'Tue', users: 7 },
    { name: 'Wed', users: 5 },
    { name: 'Thu', users: 12 },
    { name: 'Fri', users: 18 },
    { name: 'Sat', users: 24 },
    { name: 'Sun', users: 35 },
];

const recentActivity = [
    { text: "New user registration: Sarah M.", time: "2 min ago" },
    { text: "Story submission pending review", time: "15 min ago" },
    { text: "New comment on 'Stress Relief'", time: "1 hour ago" },
    { text: "Resource 'Anxiety Guide' downloaded", time: "3 hours ago" },
];

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
            color: "text-primary",
            bg: "bg-primary/10",
        },
        {
            title: "Published Blogs",
            value: stats?.total_blogs || 0,
            icon: FileText,
            color: "text-sage",
            bg: "bg-sage/10",
        },
        {
            title: "Resources",
            value: stats?.total_resources || 0,
            icon: Download,
            color: "text-terracotta",
            bg: "bg-terracotta/10",
        },
        {
            title: "Pending Stories",
            value: stats?.pending_stories || 0,
            icon: MessageSquare,
            color: "text-accent",
            bg: "bg-accent/10",
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
                                <ArrowUpRight className="w-3 h-3 mr-1 text-sage" />
                                Updated just now
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Analytics Chart */}
                <Card className="lg:col-span-2 border-border/50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            User Growth
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockChartData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    stroke="hsl(var(--primary))"
                                    fillOpacity={1}
                                    fill="url(#colorUsers)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Recent Activity Feed */}
                <Card className="border-border/50 h-full">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentActivity.map((activity, i) => (
                                <div key={i} className="flex items-start gap-3 relative pb-6 last:pb-0">
                                    {/* Timeline line */}
                                    {i !== recentActivity.length - 1 && (
                                        <div className="absolute left-[5px] top-6 bottom-0 w-[1px] bg-border" />
                                    )}
                                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-medium">{activity.text}</p>
                                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
