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
import { Plus, Pencil, Trash2, Eye, EyeOff, Star } from "lucide-react";

type Testimonial = Tables<"testimonials">;

export function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState<InsertTables<"testimonials">>({
    name: "",
    role: "",
    content: "",
    rating: 5,
    published: false,
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching testimonials", description: error.message, variant: "destructive" });
    } else {
      setTestimonials(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTestimonial) {
      const { error } = await supabase
        .from("testimonials")
        .update(form)
        .eq("id", editingTestimonial.id);

      if (error) {
        toast({ title: "Error updating testimonial", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Testimonial updated successfully" });
        fetchTestimonials();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("testimonials").insert([form]);

      if (error) {
        toast({ title: "Error creating testimonial", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Testimonial created successfully" });
        fetchTestimonials();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;

    const { error } = await supabase.from("testimonials").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting testimonial", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Testimonial deleted successfully" });
      fetchTestimonials();
    }
  };

  const togglePublished = async (testimonial: Testimonial) => {
    const { error } = await supabase
      .from("testimonials")
      .update({ published: !testimonial.published })
      .eq("id", testimonial.id);

    if (error) {
      toast({ title: "Error updating testimonial", description: error.message, variant: "destructive" });
    } else {
      fetchTestimonials();
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      role: "",
      content: "",
      rating: 5,
      published: false,
    });
    setEditingTestimonial(null);
    setIsOpen(false);
  };

  const openEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setForm({
      name: testimonial.name,
      role: testimonial.role || "",
      content: testimonial.content,
      rating: testimonial.rating,
      published: testimonial.published,
    });
    setIsOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Testimonials ({testimonials.length})</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Testimonial
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role/Title</Label>
                  <Input
                    id="role"
                    value={form.role || ""}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={4}
                  required
                />
              </div>
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
                <Button type="submit">
                  {editingTestimonial ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-lg font-medium">{testimonial.name}</CardTitle>
                {testimonial.role && <p className="text-sm text-muted-foreground">{testimonial.role}</p>}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePublished(testimonial)}
                  title={testimonial.published ? "Unpublish" : "Publish"}
                >
                  {testimonial.published ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(testimonial)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(testimonial.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">"{testimonial.content}"</p>
            </CardContent>
          </Card>
        ))}

        {testimonials.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">No testimonials yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
}
