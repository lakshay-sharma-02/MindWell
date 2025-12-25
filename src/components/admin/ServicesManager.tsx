
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, X, Check, Save } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

type Service = Tables<"booking_services">;

export function ServicesManager() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        duration: "50 minutes",
        price: "$150",
        description: "",
        features: "",
        popular: false
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("booking_services")
                .select("*")
                .order("created_at", { ascending: true });

            if (error) throw error;
            setServices(data || []);
        } catch (error) {
            console.error("Error fetching services:", error);
            toast.error("Failed to load services");
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenDialog = (service?: Service) => {
        if (service) {
            setEditingService(service);
            setFormData({
                title: service.title,
                duration: service.duration,
                price: service.price,
                description: service.description,
                features: service.features.join("\n"),
                popular: service.popular
            });
        } else {
            setEditingService(null);
            setFormData({
                title: "",
                duration: "50 minutes",
                price: "$150",
                description: "",
                features: "",
                popular: false
            });
        }
        setIsDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const featuresArray = formData.features.split("\n").filter(f => f.trim() !== "");

            const payload = {
                title: formData.title,
                duration: formData.duration,
                price: formData.price,
                description: formData.description,
                features: featuresArray,
                popular: formData.popular
            };

            if (editingService) {
                const { error } = await supabase
                    .from("booking_services")
                    .update(payload)
                    .eq("id", editingService.id);

                if (error) throw error;
                toast.success("Service updated successfully");
            } else {
                const { error } = await supabase
                    .from("booking_services")
                    .insert(payload);

                if (error) throw error;
                toast.success("Service created successfully");
            }

            setIsDialogOpen(false);
            fetchServices();
        } catch (error) {
            console.error("Error saving service:", error);
            toast.error("Failed to save service");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this service?")) return;

        try {
            const { error } = await supabase
                .from("booking_services")
                .delete()
                .eq("id", id);

            if (error) throw error;
            toast.success("Service deleted");
            fetchServices();
        } catch (error) {
            console.error("Error deleting service:", error);
            toast.error("Failed to delete service");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Services</h2>
                    <p className="text-muted-foreground">Manage your booking services and pricing</p>
                </div>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="h-64 rounded-xl bg-card border animate-pulse" />
                    ))
                ) : services.length === 0 ? (
                    <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl">
                        <p className="text-muted-foreground">No services found. Create one to get started.</p>
                    </div>
                ) : (
                    services.map((service) => (
                        <Card key={service.id} className="relative overflow-hidden">
                            {service.popular && (
                                <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-bl-xl">
                                    Popular
                                </div>
                            )}
                            <CardHeader>
                                <CardTitle className="flex justify-between items-start gap-2">
                                    <span className="truncate">{service.title}</span>
                                </CardTitle>
                                <CardDescription>{service.duration} • {service.price}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                    {service.description}
                                </p>
                                <div className="space-y-1">
                                    {service.features.slice(0, 3).map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <Check className="w-3 h-3 text-primary" />
                                            <span className="truncate">{feature}</span>
                                        </div>
                                    ))}
                                    {service.features.length > 3 && (
                                        <p className="text-xs text-muted-foreground pl-5">+{service.features.length - 3} more</p>
                                    )}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 border-t pt-4 bg-secondary/10">
                                <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(service)}>
                                    <Pencil className="w-4 h-4 mr-2" />
                                    Edit
                                </Button>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(service.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </Button>
                            </CardFooter>
                        </Card>
                    ))
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                    placeholder="$150"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="duration">Duration</Label>
                            <Input
                                id="duration"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                required
                                placeholder="50 minutes"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="features">Features (one per line)</Label>
                            <Textarea
                                id="features"
                                value={formData.features}
                                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                rows={5}
                                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <Switch
                                id="popular"
                                checked={formData.popular}
                                onCheckedChange={(checked) => setFormData({ ...formData, popular: checked })}
                            />
                            <Label htmlFor="popular">Mark as Most Popular</Label>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingService ? "Update Service" : "Create Service"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
