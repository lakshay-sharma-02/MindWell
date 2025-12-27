
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, Wind, PenTool, BookOpen } from "lucide-react";

export function QuickActionsWidget() {
    const actions = [
        { label: "Mental Quiz", icon: Heart, href: "/quiz", color: "text-rose-500", bg: "hover:bg-rose-500/10" },
        { label: "Breathe", icon: Wind, href: "/tools", color: "text-sky-500", bg: "hover:bg-sky-500/10" },
        { label: "Journal", icon: PenTool, href: "/tools", color: "text-amber-500", bg: "hover:bg-amber-500/10" },
        { label: "Read Blog", icon: BookOpen, href: "/blog", color: "text-emerald-500", bg: "hover:bg-emerald-500/10" },
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
                            className={`h-auto py-4 flex flex-col gap-2 items-center justify-center border-border/50 transition-colors ${action.bg}`}
                            asChild
                        >
                            <Link to={action.href}>
                                <action.icon className={`w-6 h-6 ${action.color}`} />
                                <span className="text-xs font-medium">{action.label}</span>
                            </Link>
                        </Button>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
