import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Download, MessageSquare, ArrowUpRight, Activity, Plus, CheckCircle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface AdminStats {
    total_users: number;
    total_blogs: number;
    total_resources: number;
    pending_stories: number;
}

const mockChartData = [
    { name: 'Mon', users: 4, visits: 120 },
    { name: 'Tue', users: 7, visits: 135 },
    { name: 'Wed', users: 5, visits: 140 },
    { name: 'Thu', users: 12, visits: 250 },
    { name: 'Fri', users: 18, visits: 320 },
    { name: 'Sat', users: 24, visits: 380 },
    { name: 'Sun', users: 35, visits: 450 },
];

const recentActivity = [
    { text: "New user registration: Sarah M.", time: "2 min ago", type: "user" },
    { text: "Story submission pending review", time: "15 min ago", type: "alert" },
    { text: "New comment on 'Stress Relief'", time: "1 hour ago", type: "message" },
    { text: "Resource 'Anxiety Guide' downloaded", time: "3 hours ago", type: "download" },
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
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            gradient: "from-blue-500/20 to-blue-600/5",
            trend: "+12%"
        },
        {
            title: "Published Blogs",
            value: stats?.total_blogs || 0,
            icon: FileText,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            gradient: "from-emerald-500/20 to-emerald-600/5",
            trend: "+4%"
        },
        {
            title: "Resources",
            value: stats?.total_resources || 0,
            icon: Download,
            color: "text-violet-500",
            bg: "bg-violet-500/10",
            gradient: "from-violet-500/20 to-violet-600/5",
            trend: "+8%"
        },
        {
            title: "Pending Stories",
            value: stats?.pending_stories || 0,
            icon: MessageSquare,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            gradient: "from-amber-500/20 to-amber-600/5",
            trend: "Action Needed"
        },
    ];

    const quickActions = [
        { label: "New Blog Post", icon: Plus, color: "text-green-500", bg: "bg-green-100 dark:bg-green-900/20" },
        { label: "Add Resource", icon: Download, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/20" },
        { label: "Review Stories", icon: CheckCircle, color: "text-amber-500", bg: "bg-amber-100 dark:bg-amber-900/20" },
        { label: "User Settings", icon: Users, color: "text-purple-500", bg: "bg-purple-100 dark:bg-purple-900/20" },
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-display font-bold text-foreground">Dashboard</h2>
                    <p className="text-muted-foreground">Overview of your platform's performance.</p>
                </div>
                <div className="flex gap-2">
                    <Button className="shadow-lg shadow-primary/25">
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className={`border-none shadow-lg relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300`}>
                            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-50 group-hover:opacity-100 transition-opacity`} />
                            <CardContent className="p-6 relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${stat.bg}`}>
                                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                    <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${stat.trend === "Action Needed" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"}`}>
                                        {stat.trend !== "Action Needed" && <TrendingUp className="w-3 h-3 mr-1" />}
                                        {stat.trend}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                                    <div className="text-3xl font-bold">{stat.value}</div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Analytics Chart */}
                <Card className="lg:col-span-2 border-border/50 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Growth Analytics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockChartData}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                    dy={10}
                                />
                                <YAxis
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid hsl(var(--border))',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                        backgroundColor: 'hsl(var(--card))'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="users"
                                    name="New Users"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorUsers)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="visits"
                                    name="Page Visits"
                                    stroke="hsl(var(--accent))"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorVisits)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <div className="space-y-8">
                    {/* Quick Actions */}
                    <Card className="border-border/50 shadow-md">
                        <CardHeader>
                            <CardTitle>Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4">
                                {quickActions.map((action, i) => (
                                    <button
                                        key={i}
                                        className="flex flex-col items-center justify-center p-4 rounded-xl border border-border/50 hover:bg-secondary/50 transition-colors group cursor-pointer"
                                    >
                                        <div className={`p-3 rounded-full mb-3 ${action.bg} group-hover:scale-110 transition-transform`}>
                                            <action.icon className={`w-5 h-5 ${action.color}`} />
                                        </div>
                                        <span className="text-xs font-medium text-center">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity Feed */}
                    <Card className="border-border/50 shadow-md">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {recentActivity.map((activity, i) => (
                                    <div key={i} className="flex items-start gap-4 relative">
                                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${activity.type === 'alert' ? 'bg-amber-500' :
                                                activity.type === 'user' ? 'bg-blue-500' :
                                                    'bg-green-500'
                                            }`} />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium leading-none">{activity.text}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
