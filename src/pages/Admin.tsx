import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
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
  ShieldCheck,
  Settings,
  Search,
  ChevronRight
} from "lucide-react";
import { Calendar } from "lucide-react";
import { BlogsManager } from "@/components/admin/BlogsManager";
import { BookingsManager } from "@/components/admin/BookingsManager";
import { PodcastsManager } from "@/components/admin/PodcastsManager";
import { ResourcesManager } from "@/components/admin/ResourcesManager";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { FaqsManager } from "@/components/admin/FaqsManager";
import { ServicesManager } from "@/components/admin/ServicesManager";
import { StoriesManager } from "@/components/admin/StoriesManager";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { UsersManager } from "@/components/admin/UsersManager";
import { CommunityManager } from "@/components/admin/CommunityManager";
import { SiteSettings } from "@/components/admin/SiteSettings";
import { ContentManager } from "@/components/admin/ContentManager";
import { CommunicationsManager } from "@/components/admin/CommunicationsManager";
import { AdminProfile } from "@/components/admin/AdminProfile";
import { CommandPalette } from "@/components/admin/CommandPalette";
import { NotificationCenter } from "@/components/admin/NotificationCenter";
import { motion, AnimatePresence } from "framer-motion";

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const navigate = useNavigate();

  // Handle keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

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
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "testimonials", label: "Testimonials", icon: MessageSquare },
    { id: "faqs", label: "FAQs", icon: HelpCircle },
    { id: "communications", label: "Communications", icon: MessageSquare },
    { id: "content", label: "Page Content", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "profile", label: "Profile", icon: Users },
  ];

  const renderContent = () => {
    const components = {
      overview: AdminOverview,
      users: UsersManager,
      blogs: BlogsManager,
      stories: StoriesManager,
      resources: ResourcesManager,
      community: CommunityManager,
      podcasts: PodcastsManager,
      services: ServicesManager,
      bookings: BookingsManager,
      testimonials: TestimonialsManager,
      faqs: FaqsManager,
      communications: CommunicationsManager,
      content: ContentManager,
      settings: SiteSettings,
      profile: AdminProfile,
    };

    const Component = components[activeTab as keyof typeof components] || AdminOverview;

    return (
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
      >
        <Component />
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex font-body selection:bg-primary/20">
      <SEOHead title="Admin Panel" description="Manage your website content" />
      <CommandPalette open={commandOpen} setOpen={setCommandOpen} />

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-md z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Navigation - Glassmorphism */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-card/80 backdrop-blur-xl border-r border-border transition-transform duration-300 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:block ${mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          }`}
      >
        <div className="h-full flex flex-col p-4">
          <div className="flex items-center gap-3 px-4 py-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground shadow-glow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-foreground">Admin</h1>
              <p className="text-xs text-muted-foreground">Control Center</p>
            </div>
          </div>

          <div className="px-4 mb-6">
            <button
              onClick={() => setCommandOpen(true)}
              className="w-full flex items-center gap-2 bg-secondary/50 hover:bg-secondary border border-border/50 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all group"
            >
              <Search className="w-4 h-4 group-hover:text-primary transition-colors" />
              <span>Quick search...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 space-y-1 custom-scrollbar">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all group relative overflow-hidden ${activeTab === item.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  }`}
              >
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary shadow-lg shadow-primary/25 rounded-xl z-0"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className="flex items-center gap-3 relative z-10">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </div>
                {activeTab === item.id && (
                  <ChevronRight className="w-4 h-4 relative z-10 opacity-50" />
                )}
              </button>
            ))}
          </div>

          <div className="p-4 mt-auto border-t border-border/50">
            <div className="flex items-center gap-3 px-2 py-3 mb-2 rounded-xl bg-secondary/30">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                {user.email?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <Button variant="ghost" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={signOut}>
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col min-h-screen bg-muted/10">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between p-4 md:px-8 border-b border-border/50 bg-background/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-5 h-5" />
            </Button>
            <h2 className="text-lg font-semibold lg:hidden">
              {menuItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <NotificationCenter />
            <Button variant="outline" size="sm" className="hidden md:flex" onClick={() => window.open('/', '_blank')}>
              Visit Site
            </Button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;

