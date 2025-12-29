import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface ServiceFormProps {
    initialData?: any;
    onSubmit: (data: any) => void;
    isSubmitting: boolean;
    onCancel?: () => void;
}

export function ServiceForm({ initialData, onSubmit, isSubmitting, onCancel }: ServiceFormProps) {
    const [data, setData] = useState({
        title: "",
        duration: "50 minutes",
        price: "$150",
        description: "",
        features: "",
        popular: false
    });

    useEffect(() => {
        if (initialData) {
            setData({
                title: initialData.title || "",
                duration: initialData.duration || "50 minutes",
                price: initialData.price || "$150",
                description: initialData.description || "",
                features: Array.isArray(initialData.features) ? initialData.features.join("\n") : (initialData.features || ""),
                popular: initialData.popular || false
            });
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(data);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Title</Label>
                    <Input
                        value={data.title}
                        onChange={(e) => setData({ ...data, title: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <Label>Price</Label>
                    <Input
                        value={data.price}
                        onChange={(e) => setData({ ...data, price: e.target.value })}
                        required
                    />
                </div>
            </div>
            <div>
                <Label>Duration</Label>
                <Input
                    value={data.duration}
                    onChange={(e) => setData({ ...data, duration: e.target.value })}
                    required
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
            <div>
                <Label>Features (one per line)</Label>
                <Textarea
                    value={data.features}
                    onChange={(e) => setData({ ...data, features: e.target.value })}
                    rows={4}
                    placeholder="Feature 1&#10;Feature 2"
                />
            </div>
            <div className="flex items-center gap-2">
                <Switch
                    checked={data.popular}
                    onCheckedChange={(v) => setData({ ...data, popular: v })}
                />
                <Label>Mark as Popular</Label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
                {onCancel && (
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button type="submit" disabled={isSubmitting} className={onCancel ? "" : "w-full"}>
                    {isSubmitting ? "Saving..." : (initialData ? "Update Service" : "Create Service")}
                </Button>
            </div>
        </form>
    );
}
