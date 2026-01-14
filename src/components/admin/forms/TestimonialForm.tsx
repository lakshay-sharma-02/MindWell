import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface TestimonialFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
    onCancel?: () => void;
}

export function TestimonialForm({ initialData, onSubmit, isSubmitting, onCancel }: TestimonialFormProps) {
    const [data, setData] = useState({
        name: "",
        role: "",
        content: "",
        rating: 5,
        published: false
    });

    useEffect(() => {
        if (initialData) {
            setData({
                name: initialData.name || "",
                role: initialData.role || "",
                content: initialData.content || "",
                rating: initialData.rating || 5,
                published: initialData.published ?? false
            });
        }
    }, [initialData]);

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="space-y-4">
            <div>
                <Label>Name</Label>
                <Input
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    required
                />
            </div>
            <div>
                <Label>Role</Label>
                <Input
                    value={data.role}
                    onChange={(e) => setData({ ...data, role: e.target.value })}
                    placeholder="CEO, Parent, etc."
                />
            </div>
            <div>
                <Label>Rating (1-5)</Label>
                <Input
                    type="number"
                    min={1}
                    max={5}
                    value={data.rating}
                    onChange={(e) => setData({ ...data, rating: parseInt(e.target.value) })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <RichTextEditor
                    value={data.content}
                    onChange={(value) => setData({ ...data, content: value })}
                />
            </div>
            <div className="flex items-center gap-2">
                <Switch
                    checked={data.published}
                    onCheckedChange={(v) => setData({ ...data, published: v })}
                />
                <Label>Publish immediately</Label>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Testimonial"}
                </Button>
            </div>
        </form>
    );
}
