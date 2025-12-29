import { useState } from "react";
import { createPortal } from "react-dom";
import { Plus, Settings, Eye, EyeOff, LogOut, User, Shield, X, LayoutDashboard, FileText, Mic, BookOpen, MessageSquare, HelpCircle, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useAdminEdit } from "@/hooks/useAdminEdit";
import { useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { SiteSettings } from "@/components/admin/SiteSettings";
import { TestimonialForm } from "@/components/admin/forms/TestimonialForm";
import { FaqForm } from "@/components/admin/forms/FaqForm";

type ContentType = "blog" | "podcast" | "resource" | "testimonial" | "faq" | "service" | null;

export function AdminFloatingPanel() {
  const { user, isAdmin, signOut, loading } = useAuth();
  const { isEditMode, toggleEditMode } = useAdminEdit();
  const [isExpanded, setIsExpanded] = useState(false);
  const [addingType, setAddingType] = useState<ContentType>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast } = useToast();
  const location = useLocation();

  // Don't show panel while loading or if not admin
  if (loading) return null;
  if (!user || !isAdmin) return null;

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  };

  const handleQuickAdd = async (type: ContentType, data: Record<string, unknown>) => {
    if (!type) return;
    setIsSubmitting(true);

    const isMissingPublishedColumn = (err: unknown) => {
      const msg = err instanceof Error ? err.message : String(err);
      return /column\s+"published"\s+does\s+not\s+exist/i.test(msg);
    };

    try {
      let table = "";
      let insertData: Record<string, unknown> = {};

      switch (type) {
        case "blog": {
          table = "blogs";
          const shouldPublish = Boolean(data.published ?? false);

          // Build base insert object with only core columns that always exist
          const baseInsert: Record<string, unknown> = {
            title: data.title,
            slug: generateSlug(data.title as string),
            excerpt: data.excerpt,
            content: data.content || data.excerpt,
            category: data.category || "General",
          };

          // Try inserting with all optional fields first, then retry without missing columns
          const tryInsert = async (payload: Record<string, unknown>): Promise<{ error: unknown | null }> => {
            const { error } = await supabase.from(table).insert(payload);
            return { error };
          };

          const isMissingColumn = (err: unknown, col: string) => {
            const msg = err instanceof Error ? err.message : String(err);
            return new RegExp(`column\\s+"${col}"\\s+(does\\s+not\\s+exist|of\\s+relation)`, "i").test(msg) ||
              msg.includes(`Could not find the '${col}' column`) ||
              msg.includes(`could not find the ${col} column`);
          };

          // Start with full payload including author and published
          let payload: Record<string, unknown> = { ...baseInsert, author: data.author || "Admin", published: shouldPublish };
          let result = await tryInsert(payload);

          // If author column missing, remove it and retry
          if (result.error && isMissingColumn(result.error, "author")) {
            delete payload.author;
            result = await tryInsert(payload);
          }

          // If published column missing, switch to published_at
          if (result.error && isMissingColumn(result.error, "published")) {
            delete payload.published;
            payload.published_at = shouldPublish ? new Date().toISOString() : null;
            result = await tryInsert(payload);
          }

          if (result.error) throw result.error;
          break;
        }
        case "podcast":
          table = "podcasts";
          insertData = {
            title: data.title,
            description: data.description,
            duration: data.duration || "30:00",
            guest_name: data.guest_name,
            audio_url: data.audio_url || "",
            published: data.published ?? false,
          };
          {
            const { error } = await supabase.from(table).insert(insertData);
            if (error) throw error;
          }
          break;
        case "resource":
          table = "resources";
          insertData = {
            title: data.title,
            description: data.description,
            type: data.type || "PDF Guide",
            download_url: data.download_url || "",
            published: data.published ?? false,
          };
          {
            const { error } = await supabase.from(table).insert(insertData);
            if (error) throw error;
          }
          break;
        case "testimonial":
          table = "testimonials";
          insertData = {
            name: data.name,
            role: data.role,
            content: data.content,
            rating: data.rating || 5,
            image_url: data.image_url || "",
            published: data.published ?? false,
          };
          {
            const { error } = await supabase.from(table).insert(insertData);
            if (error) throw error;
          }
          break;
        case "faq":
          table = "faqs";
          insertData = {
            question: data.question,
            answer: data.answer,
            category: data.category || "General",
            sort_order: data.sort_order || 0,
            published: data.published ?? false,
          };
          {
            const { error } = await supabase.from(table).insert(insertData);
            if (error) throw error;
          }
          break;
        case "service":
          table = "booking_services";
          insertData = {
            title: data.title,
            duration: data.duration,
            price: data.price,
            description: data.description,
            features: (data.features as string).split("\n").filter(f => f.trim() !== ""),
            popular: data.popular ?? false,
          };
          {
            const { error } = await supabase.from(table).insert(insertData);
            if (error) throw error;
          }
          break;

      }

      toast({ title: "Created successfully!", description: `New ${type} has been added.` });
      setAddingType(null);

      // Refresh the page to show new content
      window.location.reload();
    } catch (error) {
      console.error("Error adding content:", error);
      toast({ title: "Error", description: getErrorMessage(error), variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast({ title: "Signed out", description: "You have been logged out." });
  };

  const contentTypes = [
    { type: "blog" as const, label: "Blog Post", icon: FileText, color: "text-blue-500" },
    { type: "podcast" as const, label: "Podcast", icon: Mic, color: "text-purple-500" },
    { type: "resource" as const, label: "Resource", icon: BookOpen, color: "text-green-500" },
    { type: "testimonial" as const, label: "Testimonial", icon: MessageSquare, color: "text-amber-500" },
    { type: "faq" as const, label: "FAQ", icon: HelpCircle, color: "text-cyan-500" },
    { type: "service" as const, label: "Service", icon: Settings, color: "text-rose-500" },
  ];

  return createPortal(
    <>
      {/* Floating Admin Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="fixed z-[100]"
        style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 99999 }}
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 w-72 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 bg-primary/5 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">Admin Panel</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground px-2 mb-2">Quick Add</p>
                <div className="grid grid-cols-2 gap-2">
                  {contentTypes.map((item) => (
                    <button
                      key={item.type}
                      onClick={() => setAddingType(item.type)}
                      className="flex items-center gap-2 p-2.5 rounded-lg hover:bg-secondary transition-colors text-left"
                    >
                      <item.icon className={`w-4 h-4 ${item.color}`} />
                      <span className="text-xs font-medium text-foreground">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="p-3 border-t border-border space-y-1">
                <Link
                  to="/admin"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors w-full"
                >
                  <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Full Dashboard</span>
                </Link>
                <button
                  onClick={toggleEditMode}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors w-full"
                >
                  {isEditMode ? (
                    <EyeOff className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-foreground">
                    {isEditMode ? "Exit Edit Mode" : "Edit Mode"}
                  </span>
                </button>
                <button
                  onClick={() => setSettingsOpen(true)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-secondary transition-colors w-full"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Site Settings</span>
                </button>
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-border">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-destructive/10 transition-colors w-full text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toggle Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors ${isExpanded ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-secondary"
            }`}
        >
          {isExpanded ? (
            <X className="w-5 h-5" />
          ) : (
            <Shield className="w-5 h-5" />
          )}
        </motion.button>

        {/* Edit Mode Indicator */}
        {isEditMode && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-card"
          />
        )}
      </motion.div>

      {/* Add Content Dialogs */}
      <Dialog open={addingType === "blog"} onOpenChange={() => setAddingType(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Add New Blog Post
            </DialogTitle>
          </DialogHeader>
          <BlogForm onSubmit={(data) => handleQuickAdd("blog", data)} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>

      <Dialog open={addingType === "podcast"} onOpenChange={() => setAddingType(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-purple-500" />
              Add New Podcast
            </DialogTitle>
          </DialogHeader>
          <PodcastForm onSubmit={(data) => handleQuickAdd("podcast", data)} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>

      <Dialog open={addingType === "resource"} onOpenChange={() => setAddingType(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-500" />
              Add New Resource
            </DialogTitle>
          </DialogHeader>
          <ResourceForm onSubmit={(data) => handleQuickAdd("resource", data)} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>

      <Dialog open={addingType === "testimonial"} onOpenChange={() => setAddingType(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              Add New Testimonial
            </DialogTitle>
          </DialogHeader>
          <TestimonialForm onSubmit={(data) => handleQuickAdd("testimonial", data)} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>

      <Dialog open={addingType === "faq"} onOpenChange={() => setAddingType(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-500" />
              Add New FAQ
            </DialogTitle>
          </DialogHeader>
          <FaqForm onSubmit={(data) => handleQuickAdd("faq", data)} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>

      <Dialog open={addingType === "service"} onOpenChange={() => setAddingType(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-rose-500" />
              Add New Service
            </DialogTitle>
          </DialogHeader>
          <ServiceForm onSubmit={(data) => handleQuickAdd("service", data)} isSubmitting={isSubmitting} />
        </DialogContent>
      </Dialog>

      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Global Site Settings</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <SiteSettings />
          </div>
        </DialogContent>
      </Dialog>


    </>,
    document.body
  );
}

// Form Components are now imported from @/components/admin/forms/

/* 
  Note: ServiceForm, BlogForm, PodcastForm, ResourceForm should also be extracted 
  to separate files in @/components/admin/forms/ for consistency, 
  but for now we are reusing TestimonialForm and FaqForm as requested.
  
  I will keep the others here for now or extract them if I have time. 
  Actually, to clean this file up, I should ideally extract all.
  But I only created TestimonialForm and FaqForm.
  
  Let's replace the local TestimonialForm and FaqForm with imports.
*/

function BlogForm({ onSubmit, isSubmitting }: { onSubmit: (data: Record<string, unknown>) => void; isSubmitting: boolean }) {
  const [data, setData] = useState({ title: "", excerpt: "", content: "", category: "General", author: "Admin", published: false });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="space-y-4">
      <div><Label>Title</Label><Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} required /></div>
      <div><Label>Category</Label><Input value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })} /></div>
      <div><Label>Author</Label><Input value={data.author} onChange={(e) => setData({ ...data, author: e.target.value })} /></div>
      <div><Label>Excerpt</Label><Textarea value={data.excerpt} onChange={(e) => setData({ ...data, excerpt: e.target.value })} required /></div>
      <div><Label>Content</Label><Textarea value={data.content} onChange={(e) => setData({ ...data, content: e.target.value })} rows={4} /></div>
      <div className="flex items-center gap-2"><Switch checked={data.published} onCheckedChange={(v) => setData({ ...data, published: v })} /><Label>Publish immediately</Label></div>
      <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Creating..." : "Create Blog Post"}</Button>
    </form>
  );
}

function PodcastForm({ onSubmit, isSubmitting }: { onSubmit: (data: Record<string, unknown>) => void; isSubmitting: boolean }) {
  const [data, setData] = useState({ title: "", description: "", guest_name: "", duration: "30:00", audio_url: "", published: false });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="space-y-4">
      <div><Label>Title</Label><Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} required /></div>
      <div><Label>Guest Name</Label><Input value={data.guest_name} onChange={(e) => setData({ ...data, guest_name: e.target.value })} /></div>
      <div><Label>Duration</Label><Input value={data.duration} onChange={(e) => setData({ ...data, duration: e.target.value })} placeholder="30:00" /></div>
      <div><Label>Audio URL</Label><Input value={data.audio_url} onChange={(e) => setData({ ...data, audio_url: e.target.value })} /></div>
      <div><Label>Description</Label><Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} required /></div>
      <div className="flex items-center gap-2"><Switch checked={data.published} onCheckedChange={(v) => setData({ ...data, published: v })} /><Label>Publish immediately</Label></div>
      <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Creating..." : "Create Podcast"}</Button>
    </form>
  );
}

function ResourceForm({ onSubmit, isSubmitting }: { onSubmit: (data: Record<string, unknown>) => void; isSubmitting: boolean }) {
  const [data, setData] = useState({ title: "", description: "", type: "PDF Guide", download_url: "", published: false });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="space-y-4">
      <div><Label>Title</Label><Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} required /></div>
      <div><Label>Type</Label><Input value={data.type} onChange={(e) => setData({ ...data, type: e.target.value })} placeholder="PDF Guide, Video, etc." /></div>
      <div><Label>Download URL</Label><Input value={data.download_url} onChange={(e) => setData({ ...data, download_url: e.target.value })} /></div>
      <div><Label>Description</Label><Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} required /></div>
      <div className="flex items-center gap-2"><Switch checked={data.published} onCheckedChange={(v) => setData({ ...data, published: v })} /><Label>Publish immediately</Label></div>
      <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Creating..." : "Create Resource"}</Button>
    </form>
  );
}

function ServiceForm({ onSubmit, isSubmitting }: { onSubmit: (data: Record<string, unknown>) => void; isSubmitting: boolean }) {
  const [data, setData] = useState({ title: "", duration: "50 minutes", price: "$150", description: "", features: "", popular: false });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(data); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Title</Label><Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} required /></div>
        <div><Label>Price</Label><Input value={data.price} onChange={(e) => setData({ ...data, price: e.target.value })} required /></div>
      </div>
      <div><Label>Duration</Label><Input value={data.duration} onChange={(e) => setData({ ...data, duration: e.target.value })} required /></div>
      <div><Label>Description</Label><Textarea value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} required /></div>
      <div><Label>Features (one per line)</Label><Textarea value={data.features} onChange={(e) => setData({ ...data, features: e.target.value })} rows={4} placeholder="Feature 1&#10;Feature 2" /></div>
      <div className="flex items-center gap-2"><Switch checked={data.popular} onCheckedChange={(v) => setData({ ...data, popular: v })} /><Label>Mark as Popular</Label></div>
      <Button type="submit" disabled={isSubmitting} className="w-full">{isSubmitting ? "Creating..." : "Create Service"}</Button>
    </form>
  );
}


