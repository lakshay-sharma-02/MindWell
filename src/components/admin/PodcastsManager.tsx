import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/types/database";
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

type Podcast = Tables<"podcasts">;

export function PodcastsManager() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingPodcast, setEditingPodcast] = useState<Podcast | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    audio_url: "",
    image: "",
    guest: "",
    published: false,
  });

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const fetchPodcasts = async () => {
    const { data, error } = await supabase
      .from("podcasts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching podcasts", description: error.message, variant: "destructive" });
    } else {
      setPodcasts(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      description: form.description || null,
      duration: form.duration || null,
      audio_url: form.audio_url || null,
      image: form.image || null,
      guest: form.guest || null,
      published: form.published,
    };

    let error;

    if (editingPodcast) {
      const result = await supabase
        .from("podcasts")
        .update(payload)
        .eq("id", editingPodcast.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("podcasts")
        .insert([payload]);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      toast({ 
        title: editingPodcast ? "Error updating podcast" : "Error creating podcast", 
        description: error.message, 
        variant: "destructive" 
      });
      return;
    }

    toast({ title: editingPodcast ? "Podcast updated successfully" : "Podcast created successfully" });
    fetchPodcasts();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this podcast?")) return;

    const { error } = await supabase.from("podcasts").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting podcast", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Podcast deleted successfully" });
      fetchPodcasts();
    }
  };

  const togglePublished = async (podcast: Podcast) => {
    const nextPublished = !podcast.published;

    const { error } = await supabase
      .from("podcasts")
      .update({ published: nextPublished })
      .eq("id", podcast.id);

    if (error) {
      toast({ title: "Error updating podcast", description: error.message, variant: "destructive" });
      return;
    }

    fetchPodcasts();
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      duration: "",
      audio_url: "",
      image: "",
      guest: "",
      published: false,
    });
    setEditingPodcast(null);
    setIsOpen(false);
  };

  const openEdit = (podcast: Podcast) => {
    setEditingPodcast(podcast);
    setForm({
      title: podcast.title,
      description: podcast.description || "",
      duration: podcast.duration || "",
      audio_url: podcast.audio_url || "",
      image: podcast.image || "",
      guest: podcast.guest || "",
      published: podcast.published,
    });
    setIsOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Podcasts ({podcasts.length})</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Podcast
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPodcast ? "Edit Podcast" : "Add New Podcast"}</DialogTitle>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="guest">Guest</Label>
                  <Input
                    id="guest"
                    value={form.guest}
                    onChange={(e) => setForm({ ...form, guest: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="e.g., 45:30"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="audio_url">Audio URL</Label>
                <Input
                  id="audio_url"
                  value={form.audio_url}
                  onChange={(e) => setForm({ ...form, audio_url: e.target.value })}
                />
              </div>
              
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                label="Cover Image"
                folder="podcasts"
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
                  {saving ? "Saving..." : editingPodcast ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {podcasts.map((podcast) => (
          <Card key={podcast.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-4">
                {podcast.image && (
                  <img 
                    src={podcast.image} 
                    alt={podcast.title} 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <CardTitle className="text-lg font-medium">{podcast.title}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePublished(podcast)}
                  title={podcast.published ? "Unpublish" : "Publish"}
                >
                  {podcast.published ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(podcast)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(podcast.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{podcast.description || "No description"}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {podcast.guest && <span>Guest: {podcast.guest}</span>}
                {podcast.duration && <span>{podcast.duration}</span>}
                <span>{new Date(podcast.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {podcasts.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">No podcasts yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
}