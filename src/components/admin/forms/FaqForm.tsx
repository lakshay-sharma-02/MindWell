import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/RichTextEditor";

interface FaqFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
    onCancel?: () => void;
}

export function FaqForm({ initialData, onSubmit, isSubmitting, onCancel }: FaqFormProps) {
    const [data, setData] = useState({
        question: "",
        answer: "",
        category: "General",
        sort_order: 0,
        published: false
    });

    useEffect(() => {
        if (initialData) {
            setData({
                question: initialData.question || "",
                answer: initialData.answer || "",
                category: initialData.category || "General",
                sort_order: initialData.sort_order || 0,
                published: initialData.published ?? false
            });
        }
    }, [initialData]);

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="space-y-4">
            <div>
                <Label>Question</Label>
                <Input
                    value={data.question}
                    onChange={(e) => setData({ ...data, question: e.target.value })}
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
                <Label>Sort Order</Label>
                <Input
                    type="number"
                    value={data.sort_order}
                    onChange={(e) => setData({ ...data, sort_order: parseInt(e.target.value) })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="answer">Answer</Label>
                <RichTextEditor
                    value={data.answer}
                    onChange={(value) => setData({ ...data, answer: value })}
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
                    {isSubmitting ? "Saving..." : "Save FAQ"}
                </Button>
            </div>
        </form>
    );
}
