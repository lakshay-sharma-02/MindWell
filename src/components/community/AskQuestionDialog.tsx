import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { MessageSquarePlus } from "lucide-react";

const CATEGORIES = [
    "Anxiety",
    "Depression",
    "Relationships",
    "Work/Career",
    "Sleep",
    "General Wellness",
    "Other",
];

export function AskQuestionDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast({
                title: "Authentication required",
                description: "Please sign in to post a question.",
                variant: "destructive",
            });
            return;
        }

        if (!formData.title || !formData.description || !formData.category) {
            toast({
                title: "Missing fields",
                description: "Please fill in all fields.",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.from("community_posts").insert({
                user_id: user.id,
                title: formData.title,
                description: formData.description,
                category: formData.category,
                is_published: false, // Explicitly false, though default handles it
            });

            if (error) throw error;

            toast({
                title: "Question Submitted",
                description: "Your question has been sent for review. It will be published once an admin provides a solution.",
            });

            setOpen(false);
            setFormData({ title: "", description: "", category: "" });
        } catch (error) {
            console.error("Error submitting question:", error);
            toast({
                title: "Error",
                description: "Failed to submit question. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 shadow-lg hover:shadow-xl transition-all">
                    <MessageSquarePlus className="w-4 h-4" />
                    Ask for Help
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Share Your Concern</DialogTitle>
                    <DialogDescription>
                        Submit your question or challenge anonymously. Our experts will review it and publish a helpful solution for the community.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="category">Topic</Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value) =>
                                setFormData({ ...formData, category: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select a topic" />
                            </SelectTrigger>
                            <SelectContent>
                                {CATEGORIES.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="title">Subject</Label>
                        <Input
                            id="title"
                            placeholder="e.g., Feeling overwhelmed at work"
                            value={formData.title}
                            onChange={(e) =>
                                setFormData({ ...formData, title: e.target.value })
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe what you're going through..."
                            className="min-h-[120px]"
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Submitting..." : "Submit Question"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
