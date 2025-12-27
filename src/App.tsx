import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AuthPopup } from "@/components/auth/AuthPopup";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import ScrollToTop from "@/components/utils/ScrollToTop";

// Lazy load pages for performance
const Index = lazy(() => import("./pages/Index"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Podcasts = lazy(() => import("./pages/Podcasts"));
const Resources = lazy(() => import("./pages/Resources"));
const About = lazy(() => import("./pages/About"));
const Book = lazy(() => import("./pages/Book"));
const Contact = lazy(() => import("./pages/Contact"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Services = lazy(() => import("./pages/Services"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Stories = lazy(() => import("./pages/Stories"));
const Profile = lazy(() => import("./pages/Profile"));
const CommunitySupport = lazy(() => import("./pages/CommunitySupport"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Tools = lazy(() => import("./pages/Tools"));

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.3 }}
      >
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
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
      </motion.div>
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

const App = () => (
  <HelmetProvider>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ScrollToTop />
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AuthPopup />
              <GlobalOverlays />
              <AnimatedRoutes />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
