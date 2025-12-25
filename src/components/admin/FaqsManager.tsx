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

type Faq = Tables<"faqs">;

export function FaqsManager() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const { toast } = useToast();

  const [form, setForm] = useState<InsertTables<"faqs">>({
    question: "",
    answer: "",
    category: "",
    sort_order: 0,
    published: false,
  });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast({ title: "Error fetching FAQs", description: error.message, variant: "destructive" });
    } else {
      setFaqs(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingFaq) {
      const { error } = await supabase
        .from("faqs")
        .update(form)
        .eq("id", editingFaq.id);

      if (error) {
        toast({ title: "Error updating FAQ", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "FAQ updated successfully" });
        fetchFaqs();
        resetForm();
      }
    } else {
      const { error } = await supabase.from("faqs").insert([form]);

      if (error) {
        toast({ title: "Error creating FAQ", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "FAQ created successfully" });
        fetchFaqs();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;

    const { error } = await supabase.from("faqs").delete().eq("id", id);

    if (error) {
      toast({ title: "Error deleting FAQ", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "FAQ deleted successfully" });
      fetchFaqs();
    }
  };

  const togglePublished = async (faq: Faq) => {
    const { error } = await supabase
      .from("faqs")
      .update({ published: !faq.published })
      .eq("id", faq.id);

    if (error) {
      toast({ title: "Error updating FAQ", description: error.message, variant: "destructive" });
    } else {
      fetchFaqs();
    }
  };

  const resetForm = () => {
    setForm({
      question: "",
      answer: "",
      category: "",
      sort_order: 0,
      published: false,
    });
    setEditingFaq(null);
    setIsOpen(false);
  };

  const openEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || "",
      sort_order: faq.sort_order,
      published: faq.published,
    });
    setIsOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">FAQs ({faqs.length})</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFaq ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Input
                  id="question"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={form.category || ""}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sort_order">Sort Order</Label>
                  <Input
                    id="sort_order"
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
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
                  {editingFaq ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {faqs.map((faq) => (
          <Card key={faq.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{faq.question}</CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => togglePublished(faq)}
                  title={faq.published ? "Unpublish" : "Publish"}
                >
                  {faq.published ? (
                    <Eye className="w-4 h-4 text-green-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(faq)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(faq.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">{faq.answer}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {faq.category && <span>{faq.category}</span>}
                <span>Order: {faq.sort_order}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {faqs.length === 0 && (
          <p className="text-center py-8 text-muted-foreground">No FAQs yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
}
