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

type Blog = Tables<"blogs">;

export function BlogsManager() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image: "",
    category: "",
    author: "",
    published: false,
  });

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error fetching blogs", description: error.message, variant: "destructive" });
    } else {
      setBlogs(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: form.title,
      slug: form.slug || generateSlug(form.title),
      excerpt: form.excerpt || null,
      content: form.content || null,
      image: form.image || null,
      category: form.category || null,
      author: form.author || null,
      published: form.published,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (editingBlog) {
      const result = await supabase
        .from("blogs")
        .update(payload)
        .eq("id", editingBlog.id);
      error = result.error;
    } else {
      const result = await supabase
        .from("blogs")
        .insert([payload]);
      error = result.error;
    }

    setSaving(false);

    if (error) {
      toast({ 
        title: editingBlog ? "Error updating blog" : "Error creating blog", 
        description: error.message, 
        variant: "destructive" 
      });
      return;
    }

    toast({ title: editingBlog ? "Blog updated successfully" : "Blog created successfully" });
    fetchBlogs();
    resetForm();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog?")) return;

    const { error } = await supabase.from("blogs").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting blog", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Blog deleted successfully" });
      fetchBlogs();
    }
  };

  const togglePublished = async (blog: Blog) => {
    const nextPublished = !blog.published;

    const { error } = await supabase
      .from("blogs")
      .update({ published: nextPublished, updated_at: new Date().toISOString() })
      .eq("id", blog.id);

    if (error) {
      toast({ title: "Error updating blog", description: error.message, variant: "destructive" });
      return;
    }

    fetchBlogs();
  };

  const resetForm = () => {
    setForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      image: "",
      category: "",
      author: "",
      published: false,
    });
    setEditingBlog(null);
    setIsOpen(false);
  };

  const openEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      image: blog.image || "",
      category: blog.category || "",
      author: blog.author || "",
      published: blog.published,
    });
    setIsOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Blogs ({blogs.length})</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Blog
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingBlog ? "Edit Blog" : "Add New Blog"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated from title"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                  />
                </div>
              </div>
              
              <ImageUpload
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
                label="Cover Image"
                folder="blogs"
              />

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  rows={3}
                  placeholder="Brief summary of the blog post..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={10}
                  placeholder="Full blog content..."
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
                  {saving ? "Saving..." : editingBlog ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {blogs.map((blog) => (
          <Card key={blog.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-4">
                {blog.image && (
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}
                <div>
                  <CardTitle className="text-lg font-medium">{blog.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{blog.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePublished(blog)}
                  title={blog.published ? "Unpublish" : "Publish"}
                >
                  {blog.published ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(blog)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(blog.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{blog.excerpt || "No excerpt"}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {blog.category && <span className="bg-secondary px-2 py-1 rounded">{blog.category}</span>}
                {blog.author && <span>By {blog.author}</span>}
                <span>{new Date(blog.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {blogs.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">No blogs yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
}