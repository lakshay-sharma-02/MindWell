import { useState, useEffect, useMemo } from "react";
import { Layout } from "@/components/layout/Layout";
import { SEOHead } from "@/components/seo/SEOHead";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/types/database";
import { Button } from "@/components/ui/button";
import { FileText, Download, Sparkles, Pencil, Check, X, Trash2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type DbResource = Tables<"resources">;

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  image: string;
  downloadUrl: string;
  isPremium: boolean;
  price: number | null;
}

interface ResourceCardProps {
  resource: Resource;
  index: number;
  onUpdate: () => void;
  isPurchased: boolean;
}

function ResourceCard({ resource, index, onUpdate, isPurchased }: ResourceCardProps) {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    title: resource.title,
    description: resource.description,
    type: resource.type,
  });

  // Check if resource is accessible (Free OR Purchased OR Admin)
  const isAccessible = !resource.isPremium || isPurchased || isAdmin;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("resources")
        .update({
          title: editData.title,
          description: editData.description,
          type: editData.type,
        })
        .eq("id", resource.id);

      if (error) throw error;

      toast({ title: "Saved!", description: "Resource updated successfully." });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error saving:", error);
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this resource?")) return;

    try {
      const { error } = await supabase.from("resources").delete().eq("id", resource.id);
      if (error) throw error;

      toast({ title: "Deleted", description: "Resource has been removed." });
      onUpdate();
    } catch (error) {
      console.error("Error deleting:", error);
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleCancel = () => {
    setEditData({
      title: resource.title,
      description: resource.description,
      type: resource.type,
    });
    setIsEditing(false);
  };

  const handleAction = () => {
    if (isAccessible) {
      if (resource.downloadUrl) window.open(resource.downloadUrl, '_blank');
      else toast({ title: "Error", description: "Download link not found.", variant: "destructive" });
    } else {
      // Go to checkout
      navigate("/checkout", {
        state: {
          bookingData: null, // It's not a booking
          resourceData: resource
        }
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className={`group relative bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-elevated transition-all border border-border/50 ${isEditing ? 'ring-2 ring-primary' : ''}`}
    >
      {/* Admin Edit Controls */}
      {isAdmin && !isEditing && (
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors shadow-lg"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Save/Cancel Controls */}
      {isEditing && (
        <div className="absolute top-4 right-4 z-20 flex gap-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50"
            title="Save"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors shadow-lg"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="h-40 bg-gradient-to-br from-primary/20 to-accent/20 relative">
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <FileText className="w-10 h-10 text-foreground drop-shadow-lg" />
          {isEditing ? (
            <input
              type="text"
              value={editData.type}
              onChange={(e) => setEditData({ ...editData, type: e.target.value })}
              className="px-2 py-1 bg-background border border-primary rounded text-sm font-medium"
            />
          ) : (
            <span className="text-foreground/90 font-medium">{resource.type}</span>
          )}
        </div>
        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${resource.isPremium ? 'bg-amber-100 text-amber-800' : 'bg-background text-primary'}`}>
          {resource.isPremium ? (
            <>
              {isAccessible ? <Check className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {isAccessible ? 'Purchased' : `$${resource.price}`}
            </>
          ) : (
            <>
              <Sparkles className="w-3 h-3" /> Free
            </>
          )}
        </div>
      </div>
      <div className="p-6">
        <span className="text-xs font-semibold text-muted-foreground uppercase">{resource.type}</span>

        {isEditing ? (
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="w-full font-display text-xl font-bold text-foreground mt-1 mb-2 bg-transparent border-b border-primary focus:outline-none"
          />
        ) : (
          <h3 className="font-display text-xl font-bold text-foreground mt-1 mb-2">{resource.title}</h3>
        )}

        {isEditing ? (
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            rows={2}
            className="w-full text-sm text-muted-foreground mb-4 bg-transparent border border-primary rounded p-2 focus:outline-none resize-none"
          />
        ) : (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{resource.description}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-primary">
            {isAccessible ? 'Ready to Download' : 'Premium Resource'}
          </span>
          <Button
            size="sm"
            variant={isAccessible ? "outline" : "default"}
            onClick={handleAction}
            disabled={isEditing}
          >
            {isAccessible ? (
              <>
                <Download className="w-4 h-4 mr-1" /> Download
              </>
            ) : (
              <>
                Buy for ${resource.price}
              </>
            )}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

const transformDbResource = (resource: DbResource): Resource => ({
  id: resource.id,
  title: resource.title,
  description: resource.description || "",
  type: resource.type || "PDF",
  image: resource.image || "/placeholder.svg",
  downloadUrl: resource.download_url || "",
  isPremium: resource.is_premium || false,
  price: resource.price,
});

const Resources = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasedIds, setPurchasedIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { user } = useAuth();

  const fetchResources = async () => {
    // Some DBs use `published` (boolean), others use `published_at` (timestamp).
    // We'll try `published` first, then fall back to `published_at`.
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });

    if (error) {
      const msg = error.message || "";
      if (/column\s+"published"\s+does\s+not\s+exist/i.test(msg)) {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("resources")
          .select("*")
          .not("published_at", "is", null)
          .order("created_at", { ascending: false });

        if (!fallbackError && fallbackData) {
          setResources(fallbackData.map(transformDbResource));
        }
      }
    } else if (data) {
      setResources(data.map(transformDbResource));
    }

    setLoading(false);
  };

  useEffect(() => {
    const fetchPurchased = async () => {
      if (!user) return;
      const { data } = await supabase
        .from("purchased_resources")
        .select("resource_id")
        .eq("user_id", user.id);

      if (data) {
        setPurchasedIds(data.map(p => p.resource_id));
      }
    };
    fetchPurchased();
  }, [user]);

  useEffect(() => {
    fetchResources();
  }, []);

  const resourceCategories = useMemo(() => {
    const types = ["All", ...new Set(resources.map((r) => r.type))];
    return types;
  }, [resources]);

  const filteredResources = resources.filter((resource) => {
    return selectedCategory === "All" || resource.type === selectedCategory;
  });

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHead
        title="Resources"
        description="Download professional PDF guides, workbooks, and toolkits for mental health. Free and premium resources crafted by licensed psychologists."
        keywords="mental health PDF, psychology workbook, anxiety guide, self-care toolkit, therapy resources"
      />

      <section className="bg-gradient-hero py-20 md:py-28">
        <div className="container-wide">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-terracotta/10 text-terracotta text-sm font-semibold mb-4">
              <FileText className="w-4 h-4" />
              Downloadable Resources
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              PDF Guides & <span className="text-terracotta">Workbooks</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Professional-grade resources to support your mental health journey.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 border-b border-border bg-background sticky top-16 lg:top-20 z-40">
        <div className="container-wide flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {resourceCategories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === category ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-sage-light"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map((resource, index) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  index={index}
                  onUpdate={fetchResources}
                  isPurchased={purchasedIds.includes(resource.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-24 px-4">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-primary/60" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-3">
                Resources Coming Soon
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto text-lg">
                We're curating professional guides and toolkits just for you.
                Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
