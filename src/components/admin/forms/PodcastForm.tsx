import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface PodcastFormProps {
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
}

export function PodcastForm({ onSubmit, isSubmitting }: PodcastFormProps) {
    const [data, setData] = useState({
        title: "",
        description: "",
        guest_name: "",
        duration: "30:00",
        audio_url: "",
        published: false
    });

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="space-y-4">
            <div>
                <Label>Title</Label>
                <Input
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    required
                />
            </div>
            <div>
                <Label>Guest Name</Label>
                <Input
                    value={data.guest_name}
                    onChange={(e) => setData({ ...data, guest_name: e.target.value })}
                />
            </div>
            <div>
                <Label>Duration</Label>
                <Input
                    value={data.duration}
                    onChange={(e) => setData({ ...data, duration: e.target.value })}
                    placeholder="30:00"
                />
            </div>
            <div>
                <Label>Audio URL</Label>
                <Input
                    value={data.audio_url}
                    onChange={(e) => setData({ ...data, audio_url: e.target.value })}
                />
            </div>
            <div>
                <Label>Description</Label>
                <Textarea
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    required
                />
            </div>
            <div className="flex items-center gap-2">
                <Switch
                    checked={data.published}
                    onCheckedChange={(v) => setData({ ...data, published: v })}
                />
                <Label>Publish immediately</Label>
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Creating..." : "Create Podcast"}
            </Button>
        </form>
    );
}
