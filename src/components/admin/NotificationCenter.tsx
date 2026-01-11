
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Bell, Check, Info, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const notifications = [
    {
        id: 1,
        title: "New User Registered",
        description: "Sarah M. has joined the platform.",
        time: "2 min ago",
        read: false,
        type: "info"
    },
    {
        id: 2,
        title: "Story Pending Review",
        description: "A new user story requires your approval.",
        time: "1 hour ago",
        read: false,
        type: "warning"
    },
    {
        id: 3,
        title: "System Update",
        description: "The system was successfully updated.",
        time: "5 hours ago",
        read: true,
        type: "success"
    },
];

export function NotificationCenter() {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                    <Bell className="w-5 h-5" />
                    {notifications.some(n => !n.read) && (
                        <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b border-border/50">
                    <h4 className="font-semibold text-sm">Notifications</h4>
                </div>
                <ScrollArea className="h-[300px]">
                    <div className="flex flex-col">
                        {notifications.map((notification) => (
                            <button
                                key={notification.id}
                                className={`p-4 text-left hover:bg-muted/50 transition-colors border-b border-border/50 last:border-0 flex gap-3 ${!notification.read ? 'bg-primary/5' : ''}`}
                            >
                                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notification.type === 'info' ? 'bg-blue-500' :
                                        notification.type === 'warning' ? 'bg-amber-500' :
                                            'bg-green-500'
                                    }`} />
                                <div>
                                    <p className="text-sm font-medium leading-none mb-1">{notification.title}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{notification.description}</p>
                                    <p className="text-[10px] text-muted-foreground mt-2">{notification.time}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
                <div className="p-2 border-t border-border/50 bg-muted/20">
                    <Button variant="ghost" size="sm" className="w-full text-xs h-8">
                        Mark all as read
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
