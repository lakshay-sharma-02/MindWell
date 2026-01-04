import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceFormSchema, ServiceValues } from "@/lib/schemas/serviceSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tables } from "@/types/database";

// Define the shape of data anticipated from the database
type Service = Tables<"booking_services">;

interface ServiceFormProps {
    initialData?: Service | null;
    onSubmit: (data: ServiceValues) => void;
    isSubmitting: boolean;
    onCancel?: () => void;
}

export function ServiceForm({ initialData, onSubmit, isSubmitting, onCancel }: ServiceFormProps) {
    const form = useForm<ServiceValues>({
        resolver: zodResolver(serviceFormSchema),
        defaultValues: {
            title: "",
            duration: "50 minutes",
            price: "₹1500",
            description: "",
            features: "",
            popular: false
        }
    });

    useEffect(() => {
        if (initialData) {
            form.reset({
                title: initialData.title,
                duration: initialData.duration,
                price: initialData.price,
                description: initialData.description,
                features: Array.isArray(initialData.features)
                    ? initialData.features.join("\n")
                    : (initialData.features as string) || "",
                popular: initialData.popular || false
            });
        }
    }, [initialData, form]);

    const handleSubmit = (values: ServiceValues) => {
        onSubmit(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g. Individual Therapy" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Price</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="e.g. ₹1500" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Duration</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="e.g. 50 minutes" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea {...field} placeholder="Brief description of the service..." />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="features"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Features (one per line)</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    rows={4}
                                    placeholder="Feature 1&#10;Feature 2"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="popular"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Mark as Popular</FormLabel>
                            </div>
                            <FormControl>
                                <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                        </FormItem>
                    )}
                />

                <div className="flex justify-end gap-2 pt-2">
                    {onCancel && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancel
                        </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting} className={onCancel ? "" : "w-full"}>
                        {isSubmitting ? <span className="animate-pulse">Saving...</span> : (initialData ? "Update Service" : "Create Service")}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
