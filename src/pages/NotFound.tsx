import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, BookOpen, Headphones, Mail, Sparkles } from "lucide-react";
import { Layout } from "@/components/layout/Layout";

const popularPages = [
  { name: "Blog", href: "/blog", icon: BookOpen, description: "Read our articles" },
  { name: "Podcasts", href: "/podcasts", icon: Headphones, description: "Listen & learn" },
  { name: "Resources", href: "/resources", icon: Sparkles, description: "Free downloads" },
  { name: "Contact", href: "/contact", icon: Mail, description: "Get in touch" },
];

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <section className="min-h-[80vh] flex items-center relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-secondary/20 to-background" />
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-primary/15 rounded-full blur-[120px]"
          />
          <motion.div
            animate={{ 
              scale: [1.1, 1, 1.1],
              opacity: [0.08, 0.15, 0.08],
            }}
            transition={{ duration: 12, repeat: Infinity, delay: 3 }}
            className="absolute bottom-[20%] right-[15%] w-[350px] h-[350px] bg-accent/12 rounded-full blur-[100px]"
          />
        </div>

        {/* Floating decorative elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: [0, 0.5, 0],
                y: [0, -30, 0],
                x: [0, Math.random() * 20 - 10, 0]
              }}
              transition={{ 
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: i * 0.8
              }}
              className="absolute w-2 h-2 rounded-full bg-primary/30"
              style={{
                left: `${15 + i * 15}%`,
                top: `${30 + Math.random() * 40}%`
              }}
            />
          ))}
        </div>

        <div className="container-wide relative">
          <div className="max-w-2xl mx-auto text-center">
            {/* 404 Number */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="mb-8"
            >
              <span className="font-display text-[120px] md:text-[180px] font-bold leading-none text-gradient-animate">
                404
              </span>
            </motion.div>

            {/* Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
                Let's Find Your Way Back
              </h1>
              <p className="text-muted-foreground max-w-md mx-auto">
                The page you're looking for seems to have wandered off. 
                Don't worry—even the best journeys have unexpected detours.
              </p>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center mb-12"
            >
              <Button variant="hero" size="lg" className="btn-glow" asChild>
                <Link to="/">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <Button variant="outline" size="lg" onClick={() => window.history.back()}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go Back
              </Button>
            </motion.div>

            {/* Popular Pages */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-sm text-muted-foreground mb-4">Or explore these popular pages:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {popularPages.map((page, index) => (
                  <motion.div
                    key={page.href}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    <Link
                      to={page.href}
                      className="group flex flex-col items-center p-4 rounded-xl bg-card/60 border border-border/50 hover:border-primary/30 hover:shadow-card transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <page.icon className="w-5 h-5 text-primary" />
                      </div>
                      <span className="font-medium text-sm text-foreground">{page.name}</span>
                      <span className="text-xs text-muted-foreground">{page.description}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Search Suggestion */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-sm text-muted-foreground"
            >
              Looking for something specific?{" "}
              <span className="text-primary">Press ⌘K</span> to search.
            </motion.p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NotFound;
