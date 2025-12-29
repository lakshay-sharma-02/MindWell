import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface BlogFormProps {
    initialData?: any; // Add initialData support if needed later, though quick add doesn't use it yet
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
}

export function BlogForm({ onSubmit, isSubmitting }: BlogFormProps) {
    const [data, setData] = useState({
        title: "",
        excerpt: "",
        content: "",
        category: "General",
        author: "Admin",
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
                <Label>Category</Label>
                <Input
                    value={data.category}
                    onChange={(e) => setData({ ...data, category: e.target.value })}
                />
            </div>
            <div>
                <Label>Author</Label>
                <Input
                    value={data.author}
                    onChange={(e) => setData({ ...data, author: e.target.value })}
                />
            </div>
            <div>
                <Label>Excerpt</Label>
                <Textarea
                    value={data.excerpt}
                    onChange={(e) => setData({ ...data, excerpt: e.target.value })}
                    required
                />
            </div>
            <div>
                <Label>Content</Label>
                <Textarea
                    value={data.content}
                    onChange={(e) => setData({ ...data, content: e.target.value })}
                    rows={4}
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
                {isSubmitting ? "Creating..." : "Create Blog Post"}
            </Button>
        </form>
    );
}
