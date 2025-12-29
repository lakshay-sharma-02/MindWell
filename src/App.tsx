import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AuthPopup } from "@/components/auth/AuthPopup";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AdminProvider } from "@/contexts/AdminContext";
import { AnimatePresence, m, LazyMotion, domAnimation } from "framer-motion";
import ScrollToTop from "@/components/utils/ScrollToTop";
import { PageSkeleton } from "@/components/layout/PageSkeleton";
import { lazyWithRetry } from "@/utils/lazyWithRetry";
import { SmoothScroll } from "@/components/utils/SmoothScroll";

// Lazy load pages for performance with retry logic
const Index = lazyWithRetry(() => import("./pages/Index"));
const Blog = lazyWithRetry(() => import("./pages/Blog"));
const BlogPost = lazyWithRetry(() => import("./pages/BlogPost"));
const Podcasts = lazyWithRetry(() => import("./pages/Podcasts"));
const Resources = lazyWithRetry(() => import("./pages/Resources"));
const About = lazyWithRetry(() => import("./pages/About"));
const Book = lazyWithRetry(() => import("./pages/Book"));
const Contact = lazyWithRetry(() => import("./pages/Contact"));
const Quiz = lazyWithRetry(() => import("./pages/Quiz"));
const Services = lazyWithRetry(() => import("./pages/Services"));
const Auth = lazyWithRetry(() => import("./pages/Auth"));
const Admin = lazyWithRetry(() => import("./pages/Admin"));
const NotFound = lazyWithRetry(() => import("./pages/NotFound"));
const Checkout = lazyWithRetry(() => import("./pages/Checkout"));
const Stories = lazyWithRetry(() => import("./pages/Stories"));
const Profile = lazyWithRetry(() => import("./pages/Profile"));
const CommunitySupport = lazyWithRetry(() => import("./pages/CommunitySupport"));
const Dashboard = lazyWithRetry(() => import("./pages/Dashboard"));
const Tools = lazyWithRetry(() => import("./pages/Tools"));

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      {/* 
        Using LazyMotion with domAnimation significantly reduces bundle size 
        by checking features only when needed. 
      */}
      <LazyMotion features={domAnimation}>
        <m.div
          key={location.pathname}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Suspense fallback={<PageSkeleton />}>
            <Routes location={location}>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/podcasts" element={<Podcasts />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/about" element={<About />} />
              <Route path="/book" element={<Book />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/services" element={<Services />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/stories" element={<Stories />} />
              <Route path="/community" element={<CommunitySupport />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </m.div>
      </LazyMotion>
    </AnimatePresence>
  );
}

import { FeatureTour } from "@/components/onboarding/FeatureTour";

function GlobalOverlays() {
  const { hasSeenTour, completeTour, user, loading } = useAuth();

  if (loading || !user) return null;

  return (
    <FeatureTour
      isOpen={!hasSeenTour}
      onComplete={completeTour}
      onSkip={completeTour}
    />
  );
}

import MaintenancePage from "@/pages/MaintenancePage";
import { useSiteSettings } from "@/hooks/useSiteSettings";

const App = () => {
  const { settings, loading: settingsLoading } = useSiteSettings();
  // Move user/auth check to a wrapper or use inside App content if possible, 
  // but typically we need it here. However, AuthProvider is inside.
  // We might need to lift the logic or create a wrapper component inside AuthProvider.
  // For now, let's create a MainContent component that has access to auth context.

  return (
    <HelmetProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <SmoothScroll />
            <ScrollToTop />
            <AuthProvider>
              <TooltipProvider>
                <AdminProvider>
                  <Toaster />
                  <Sonner />
                  <AuthPopup />
                  <GlobalOverlays />
                  <AppContent />
                </AdminProvider>
              </TooltipProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </ThemeProvider>
    </HelmetProvider>
  )
};

// Extract content to use contexts
function AppContent() {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading skeleton while settings load
  if (settingsLoading) return <PageSkeleton />;

  // Check strict maintenance mode
  // Allow access to /auth and /admin even in maintenance mode for admins to login
  const isRestrictedPath = !['/auth', '/admin'].includes(location.pathname);

  if (settings.features.maintenance_mode && isRestrictedPath && !isAdmin) {
    return <MaintenancePage />;
  }

  return <AnimatedRoutes />;
}

export default App;
