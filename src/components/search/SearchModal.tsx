import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, FileText, Mic, BookOpen, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface SearchResult {
  type: "blog" | "podcast" | "resource";
  title: string;
  description: string;
  slug: string;
  url: string;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const searchTerm = `%${query}%`;

      try {
        const [blogs, podcasts, resources] = await Promise.all([
          supabase
            .from('blogs')
            .select('*')
            .or(`title.ilike.${searchTerm},excerpt.ilike.${searchTerm}`)
            .eq('published', true)
            .limit(3),
          supabase
            .from('podcasts')
            .select('*')
            .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .eq('published', true)
            .limit(3),
          supabase
            .from('resources')
            .select('*')
            .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
            .eq('published', true)
            .limit(3)
        ]);

        const mergedResults: SearchResult[] = [];

        if (blogs.data) {
          blogs.data.forEach(post => mergedResults.push({
            type: "blog",
            title: post.title,
            description: post.excerpt || '',
            slug: post.slug,
            url: `/blog/${post.slug}`
          }));
        }

        if (podcasts.data) {
          podcasts.data.forEach(pod => mergedResults.push({
            type: "podcast",
            title: pod.title,
            description: pod.description || '',
            slug: pod.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            url: `/podcasts` // simplified url since we don't have deep links in podcast page yet
          }));
        }

        if (resources.data) {
          resources.data.forEach(res => mergedResults.push({
            type: "resource",
            title: res.title,
            description: res.description || '',
            slug: res.id,
            url: `/resources`
          }));
        }

        setResults(mergedResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            navigate(results[selectedIndex].url);
            onClose();
          }
          break;
        case "Escape":
          onClose();
          break;
      }
    },
    [isOpen, results, selectedIndex, navigate, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  const getIcon = (type: string) => {
    switch (type) {
      case "blog":
        return <FileText className="w-4 h-4" />;
      case "podcast":
        return <Mic className="w-4 h-4" />;
      case "resource":
        return <BookOpen className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-[20%] -translate-x-1/2 w-full max-w-2xl z-50 px-4"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search articles, podcasts, resources..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
                  autoFocus
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-muted-foreground bg-muted rounded">
                  ESC
                </kbd>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-muted rounded-lg transition-colors sm:hidden"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[400px] overflow-y-auto">
                {query.trim() === "" ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Start typing to search...</p>
                    <p className="text-xs mt-2 opacity-60">
                      Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">↑</kbd>{" "}
                      <kbd className="px-1 py-0.5 bg-muted rounded text-xs">↓</kbd> to navigate,{" "}
                      <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Enter</kbd> to select
                    </p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <p className="text-sm">No results found for "{query}"</p>
                    <p className="text-xs mt-2 opacity-60">Try different keywords</p>
                  </div>
                ) : (
                  <div className="p-2">
                    {results.map((result, index) => (
                      <button
                        key={`${result.type}-${result.slug}`}
                        onClick={() => {
                          navigate(result.url);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${selectedIndex === index
                            ? "bg-primary/10 text-foreground"
                            : "hover:bg-muted text-muted-foreground hover:text-foreground"
                          }`}
                      >
                        <span
                          className={`mt-0.5 p-2 rounded-lg ${selectedIndex === index ? "bg-primary/20 text-primary" : "bg-muted"
                            }`}
                        >
                          {getIcon(result.type)}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{result.title}</div>
                          <div className="text-sm opacity-70 truncate">{result.description}</div>
                          <span className="text-xs capitalize opacity-50">{result.type}</span>
                        </div>
                        {selectedIndex === index && (
                          <ArrowRight className="w-4 h-4 mt-2 text-primary" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
