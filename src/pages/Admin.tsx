import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { SEOHead } from "@/components/seo/SEOHead";
import { Button } from "@/components/ui/button";
import {
  LogOut,
  FileText,
  Headphones,
  Download,
  MessageSquare,
  HelpCircle,
  Briefcase,
  LayoutDashboard,
  Users,
  Menu,
  X,
  ShieldCheck
} from "lucide-react";
import { BlogsManager } from "@/components/admin/BlogsManager";
import { PodcastsManager } from "@/components/admin/PodcastsManager";
import { ResourcesManager } from "@/components/admin/ResourcesManager";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { FaqsManager } from "@/components/admin/FaqsManager";
import { ServicesManager } from "@/components/admin/ServicesManager";
import { StoriesManager } from "@/components/admin/StoriesManager";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { UsersManager } from "@/components/admin/UsersManager";
import { CommunityManager } from "@/components/admin/CommunityManager";
import { motion, AnimatePresence } from "framer-motion";

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "blogs", label: "Blogs", icon: FileText },
    { id: "stories", label: "Stories", icon: MessageSquare },
    { id: "resources", label: "Resources", icon: Download },
    { id: "community", label: "Community", icon: ShieldCheck },
    { id: "podcasts", label: "Podcasts", icon: Headphones },
    { id: "services", label: "Services", icon: Briefcase },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare }, // Reusing icon or change if needed
    { id: "faqs", label: "FAQs", icon: HelpCircle },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview": return <AdminOverview />;
      case "users": return <UsersManager />;
      case "blogs": return <BlogsManager />;
      case "stories": return <StoriesManager />;
      case "resources": return <ResourcesManager />;
      case "community": return <CommunityManager />;
      case "podcasts": return <PodcastsManager />;
      case "services": return <ServicesManager />;
      case "testimonials": return <TestimonialsManager />;
      case "faqs": return <FaqsManager />;
      default: return <AdminOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <SEOHead title="Admin Panel" description="Manage your website content" />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transition-transform duration-300 lg:translate-x-0 lg:static lg:block ${mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          }`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-2 font-display font-bold text-xl text-primary">
              <span>Admin Panel</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 truncate">{user.email}</p>
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-border/50">
            <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={signOut}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-card">
          <span className="font-bold">Menu</span>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 scroll-smooth">
          <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
