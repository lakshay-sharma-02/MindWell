import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Bell, Mail, Send, Trash2, Plus, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface Announcement {
    id: string;
    title: string;
    content: string;
    is_active: boolean;
    created_at: string;
}

export function CommunicationsManager() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });

    // Newsletter state
    const [newsletterSubject, setNewsletterSubject] = useState("");
    const [newsletterContent, setNewsletterContent] = useState("");
    const [sendingNewsletter, setSendingNewsletter] = useState(false);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAnnouncements(data || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            toast.error("Failed to load announcements");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAnnouncement = async () => {
        try {
            if (!newAnnouncement.title || !newAnnouncement.content) {
                toast.error("Please fill in all fields");
                return;
            }

            const { error } = await supabase
                .from('announcements')
                .insert([{
                    title: newAnnouncement.title,
                    content: newAnnouncement.content,
                    is_active: true
                }]);

            if (error) throw error;

            toast.success("Announcement published");
            setIsDialogOpen(false);
            setNewAnnouncement({ title: "", content: "" });
            fetchAnnouncements();
        } catch (error) {
            console.error('Error creating announcement:', error);
            toast.error("Failed to publish announcement");
        }
    };

    const toggleAnnouncementStatus = async (id: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('announcements')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            fetchAnnouncements();
        } catch (error) {
            console.error('Error updating announcement:', error);
            toast.error("Failed to update status");
        }
    };

    const deleteAnnouncement = async (id: string) => {
        try {
            const { error } = await supabase
                .from('announcements')
                .delete()
                .eq('id', id);

            if (error) throw error;
            toast.success("Announcement deleted");
            fetchAnnouncements();
        } catch (error) {
            console.error('Error deleting announcement:', error);
            toast.error("Failed to delete announcement");
        }
    };

    const handleSendNewsletter = async () => {
        if (!newsletterSubject || !newsletterContent) {
            toast.error("Please fill in subject and content");
            return;
        }

        setSendingNewsletter(true);
        // Simulate sending newsletter
        await new Promise(resolve => setTimeout(resolve, 2000));
        setSendingNewsletter(false);
        toast.success("Newsletter sent to mock recipients (integration required)");
        setNewsletterSubject("");
        setNewsletterContent("");
    };

    return (
        <div className="space-y-6 max-w-5xl animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-display font-bold">Communications Center</h2>
                <p className="text-muted-foreground">Manage announcements and user communications.</p>
            </div>

            <Tabs defaultValue="announcements" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="announcements" className="gap-2">
                        <Bell className="w-4 h-4" />
                        Announcements
                    </TabsTrigger>
                    <TabsTrigger value="newsletter" className="gap-2">
                        <Mail className="w-4 h-4" />
                        Newsletter
                    </TabsTrigger>
                </TabsList>

                {/* Announcements Tab */}
                <TabsContent value="announcements" className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">System Announcements</h3>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="w-4 h-4" />
                                    New Announcement
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Create New Announcement</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title</Label>
                                        <Input
                                            id="title"
                                            value={newAnnouncement.title}
                                            onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                                            placeholder="e.g., Scheduled Maintenance"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="content">Content</Label>
                                        <Textarea
                                            id="content"
                                            value={newAnnouncement.content}
                                            onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                                            placeholder="Announcement details..."
                                            rows={5}
                                        />
                                    </div>
                                    <Button onClick={handleCreateAnnouncement} className="w-full">
                                        Publish
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid gap-4">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : announcements.length === 0 ? (
                            <div className="text-center p-12 border rounded-xl bg-muted/20">
                                <p className="text-muted-foreground">No announcements found.</p>
                            </div>
                        ) : (
                            announcements.map((announcement) => (
                                <Card key={announcement.id}>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <div className="space-y-1">
                                            <CardTitle className="text-base font-medium">
                                                {announcement.title}
                                            </CardTitle>
                                            <CardDescription className="text-xs">
                                                {new Date(announcement.created_at).toLocaleDateString()}
                                            </CardDescription>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={announcement.is_active ? "default" : "secondary"}>
                                                {announcement.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                            <Switch
                                                checked={announcement.is_active}
                                                onCheckedChange={() => toggleAnnouncementStatus(announcement.id, announcement.is_active)}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => deleteAnnouncement(announcement.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {announcement.content}
                                        </p>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>

                {/* Newsletter Tab */}
                <TabsContent value="newsletter">
                    <Card>
                        <CardHeader>
                            <CardTitle>Send Newsletter</CardTitle>
                            <CardDescription>
                                Compose and send emails to all registered users.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject Line</Label>
                                <Input
                                    id="subject"
                                    value={newsletterSubject}
                                    onChange={(e) => setNewsletterSubject(e.target.value)}
                                    placeholder="e.g., Monthly Wellness Update"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="body">Email Body (HTML/Text)</Label>
                                <Textarea
                                    id="body"
                                    value={newsletterContent}
                                    onChange={(e) => setNewsletterContent(e.target.value)}
                                    placeholder="Write your message here..."
                                    className="min-h-[300px] font-mono text-sm"
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSendNewsletter}
                                    disabled={sendingNewsletter}
                                    className="gap-2"
                                >
                                    {sendingNewsletter ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                    Send Blast
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
