import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Wind, PenTool, BookOpen, LogOut, Flame } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export function QuickActionsWidget() {
    const { signOut } = useAuth();

    const actions = [
        { label: "Mental Quiz", icon: Heart, href: "/quiz", color: "text-rose-500", bg: "hover:bg-rose-500/10" },
        { label: "Breathe", icon: Wind, href: "/tools?tab=breathing", color: "text-sky-500", bg: "hover:bg-sky-500/10" },
        { label: "Worry Jar", icon: Flame, href: "/tools?tab=worry", color: "text-orange-500", bg: "hover:bg-orange-500/10" },
        { label: "Journal", icon: PenTool, href: "/tools?tab=gratitude", color: "text-amber-500", bg: "hover:bg-amber-500/10" },
        { label: "Sign Out", icon: LogOut, href: "#", onClick: signOut, color: "text-slate-500", bg: "hover:bg-slate-500/10" },
    ];

    return (
        <Card className="h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-display">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-3">
                    {actions.map((action) => (
                        <Button
                            key={action.label}
                            variant="outline"
                            className={`h-auto py-4 flex flex-col gap-2 items-center justify-center border-border/50 transition-colors ${action.bg} ${action.label === "Sign Out" ? "col-span-2" : ""}`}
                            asChild
                        >
                            {action.onClick ? (
                                <div onClick={action.onClick} className="flex flex-col items-center gap-2 w-full h-full cursor-pointer">
                                    <action.icon className={`w-6 h-6 ${action.color}`} />
                                    <span className="text-xs font-medium">{action.label}</span>
                                </div>
                            ) : (
                                <Link to={action.href}>
                                    <action.icon className={`w-6 h-6 ${action.color}`} />
                                    <span className="text-xs font-medium">{action.label}</span>
                                </Link>
                            )}
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
