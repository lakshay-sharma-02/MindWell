import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ResourceFormProps {
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
}

export function ResourceForm({ onSubmit, isSubmitting }: ResourceFormProps) {
    const [data, setData] = useState({
        title: "",
        description: "",
        type: "PDF Guide",
        download_url: "",
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
                <Label>Type</Label>
                <Input
                    value={data.type}
                    onChange={(e) => setData({ ...data, type: e.target.value })}
                    placeholder="PDF Guide, Video, etc."
                />
            </div>
            <div>
                <Label>Download URL</Label>
                <Input
                    value={data.download_url}
                    onChange={(e) => setData({ ...data, download_url: e.target.value })}
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
                {isSubmitting ? "Creating..." : "Create Resource"}
            </Button>
        </form>
    );
}
