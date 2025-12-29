import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Bell, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Announcement {
    id: string;
    title: string;
    content: string;
    is_active: boolean;
}

export function AnnouncementBanner() {
    const [announcement, setAnnouncement] = useState<Announcement | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        fetchAnnouncement();
    }, []);

    const fetchAnnouncement = async () => {
        try {
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .maybeSingle();

            if (error) throw error;

            if (data) {
                // Check if user dismissed this specific announcement
                const dismissedId = sessionStorage.getItem('dismissed_announcement');
                if (dismissedId !== data.id) {
                    setAnnouncement(data);
                    setIsVisible(true);
                }
            }
        } catch (error) {
            console.error('Error fetching announcement:', error);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        if (announcement) {
            sessionStorage.setItem('dismissed_announcement', announcement.id);
        }
    };

    if (!announcement || !isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-primary text-primary-foreground relative z-50 overflow-hidden"
            >
                <div className="container mx-auto px-4 py-3 flex items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start sm:items-center gap-3 flex-1">
                        <div className="p-1.5 bg-white/20 rounded-lg shrink-0">
                            <Bell className="w-4 h-4" />
                        </div>
                        <div className="text-sm font-medium">
                            <span className="font-bold mr-2">{announcement.title}:</span>
                            <span className="opacity-90">{announcement.content}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0"
                        aria-label="Dismiss announcement"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
