import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables, InsertTables } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { ImageUpload } from "./ImageUpload";

type Resource = Tables<"resources">;

export function ResourcesManager() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "",
    image: "",
    download_url: "",
    is_premium: false,
    price: "",
    published: false,
  });

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching resources", description: error.message, variant: "destructive" });
    } else {
      setResources(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const generateSlug = (title: string) => {
      return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    };

    const payload = {
      title: form.title,
      slug: generateSlug(form.title),
      description: form.description || null,
      type: form.type || null,
      image: form.image || null,
      download_url: form.download_url || null,
      is_premium: form.is_premium,
      price: form.is_premium && form.price ? parseFloat(form.price) : null,
      published: form.published,
    };

    let error;

    if (editingResource) {
      const result = await supabase
        .from("resources")
        .update(payload)
        .eq("id", editingResource.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("resources")
        .insert([payload]);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      toast({
        title: editingResource ? "Error updating resource" : "Error creating resource",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    toast({ title: editingResource ? "Resource updated successfully" : "Resource created successfully" });
    fetchResources();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    const { error } = await supabase.from("resources").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting resource", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Resource deleted successfully" });
      fetchResources();
    }
  };

  const togglePublished = async (resource: Resource) => {
    const nextPublished = !resource.published;

    const { error } = await supabase
      .from("resources")
      .update({ published: nextPublished })
      .eq("id", resource.id);

    if (error) {
      toast({ title: "Error updating resource", description: error.message, variant: "destructive" });
      return;
    }

    fetchResources();
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      type: "",
      image: "",
      download_url: "",
      is_premium: false,
      price: "",
      published: false,
    });
    setEditingResource(null);
    setIsOpen(false);
  };

  const openEdit = (resource: Resource) => {
    setEditingResource(resource);
    setForm({
      title: resource.title,
      description: resource.description || "",
      type: resource.type || "",
      image: resource.image || "",
      download_url: resource.download_url || "",
      is_premium: resource.is_premium || false,
      price: resource.price ? resource.price.toString() : "",
      published: resource.published,
    });
    setIsOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Resources ({resources.length})</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingResource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Input
                  id="type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  placeholder="e.g., PDF, Worksheet, Guide"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="download_url">Download URL</Label>
                <Input
                  id="download_url"
                  value={form.download_url}
                  onChange={(e) => setForm({ ...form, download_url: e.target.value })}
                />
              </div>

              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                label="Cover Image"
                folder="resources"
              />

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2 border p-3 rounded-md">
                <Switch
                  id="is_premium"
                  checked={form.is_premium}
                  onCheckedChange={(checked) => setForm({ ...form, is_premium: checked })}
                />
                <Label htmlFor="is_premium">Premium Resource (Paid)</Label>
              </div>

              {form.is_premium && (
                <div className="space-y-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Switch
                  id="published"
                  checked={form.published}
                  onCheckedChange={(checked) => setForm({ ...form, published: checked })}
                />
                <Label htmlFor="published">Published</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingResource ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {resources.map((resource) => (
          <Card key={resource.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-4">
                {resource.image && (
                  <img
                    src={resource.image}
                    alt={resource.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <CardTitle className="text-lg font-medium">{resource.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePublished(resource)}
                  title={resource.published ? "Unpublish" : "Publish"}
                >
                  {resource.published ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(resource)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(resource.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{resource.description || "No description"}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {resource.type && <span className="bg-secondary px-2 py-1 rounded">{resource.type}</span>}
                <span>{new Date(resource.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {resources.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">No resources yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
}