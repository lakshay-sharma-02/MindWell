import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Heart, Search, User, ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Services", href: "/services" },
  {
    name: "Resources",
    items: [
      { name: "Library", href: "/resources", description: "Access our collection of mental health resources." },
      { name: "Blog", href: "/blog", description: "Read the latest articles and insights." },
      { name: "Podcasts", href: "/podcasts", description: "Listen to our curated podcasts." },
      { name: "Stories", href: "/stories", description: "Real stories from our community." },
      { name: "Quiz", href: "/quiz", description: "Check your mental well-being." },
    ]
  },
  { name: "Community", href: "/community" },
  {
    name: "Company",
    items: [
      { name: "About", href: "/about", description: "Learn more about our mission." },
      { name: "Contact", href: "/contact", description: "Get in touch with us." },
    ]
  },
];

interface HeaderProps {
  onSearchClick?: () => void;
}

import { useSiteSettings } from "@/hooks/useSiteSettings";

// ... existing imports ...

export function Header({ onSearchClick }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { settings } = useSiteSettings();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    // Initial check
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const isGroupActive = (items: { href: string }[]) => {
    return items.some(item => isActive(item.href));
  };

  const { user } = useAuth();

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
        ? "glass-panel"
        : "bg-background/60 backdrop-blur-md"
        }`}
    >
      <nav className="container-wide" aria-label="Global">
        <div className="flex items-center justify-between h-16 lg:h-[4.5rem]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 2 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-10 h-10 flex items-center justify-center"
            >
              <img src="/logo.png" alt="Psyche Space Logo" className="w-full h-full object-contain" />
            </motion.div>
            <span className="font-display text-xl font-semibold text-foreground">
              {settings.global_info.title}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:items-center lg:gap-1">
            <NavigationMenu>
              <NavigationMenuList>
                {navigation.map((item) => {
                  if (item.items) {
                    return (
                      <NavigationMenuItem key={item.name}>
                        <NavigationMenuTrigger
                          className={cn(
                            "bg-transparent hover:bg-secondary/50 data-[state=open]:bg-secondary/50",
                            isGroupActive(item.items) && "text-primary bg-primary/5"
                          )}
                        >
                          {item.name}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                            {item.items.map((subItem) => (
                              <ListItem
                                key={subItem.name}
                                title={subItem.name}
                                href={subItem.href}
                                active={isActive(subItem.href)}
                              >
                                {subItem.description}
                              </ListItem>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    );
                  }

                  return (
                    <NavigationMenuItem key={item.name}>
                      <NavigationMenuLink asChild>
                        <Link
                          to={item.href}
                          className={cn(
                            navigationMenuTriggerStyle(),
                            "bg-transparent hover:bg-transparent animated-underline",
                            isActive(item.href) && "text-primary font-medium"
                          )}
                        >
                          {item.name}
                        </Link>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  );
                })}
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* CTA Button & Theme Toggle */}
          <div className="hidden lg:flex lg:items-center lg:gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSearchClick}
              className="p-2.5 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
              title="Search (⌘K)"
            >
              <Search className="w-5 h-5" />
            </motion.button>
            <ThemeToggle />

            {user ? (
              <Link to="/dashboard">
                <Avatar className="w-10 h-10 border-2 border-primary/20 hover:border-primary transition-colors cursor-pointer">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {user.email?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            ) : (
              <Button variant="ghost" size="sm" asChild className="rounded-full text-muted-foreground hover:text-primary">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}

            <Button variant="default" size="default" className="btn-glow ml-2" asChild>
              <Link to="/book">Book Session</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle />
            <motion.button
              whileTap={{ scale: 0.9 }}
              type="button"
              className="p-2.5 rounded-xl bg-secondary/60 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
              className="lg:hidden overflow-hidden border-t border-border/50"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y < -50) setMobileMenuOpen(false);
              }}
            >
              <motion.div
                className="py-6 space-y-2" // Increased vertical padding
                initial={{ y: -10 }}
                animate={{ y: 0 }}
                exit={{ y: -10 }}
              >
                {navigation.map((item, index) => {
                  if (item.items) {
                    return (
                      <Collapsible key={item.name} className="w-full">
                        <CollapsibleTrigger className="flex w-full items-center justify-between px-6 py-4 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/60 active:bg-secondary/80 rounded-xl transition-colors [&[data-state=open]>svg]:rotate-180">
                          {item.name}
                          <ChevronDown className="h-5 w-5 transition-transform duration-200" />
                        </CollapsibleTrigger>
                        <CollapsibleContent className="space-y-1 pt-1 pb-2">
                          {item.items.map((subItem) => (
                            <Link
                              key={subItem.name}
                              to={subItem.href}
                              onClick={() => setMobileMenuOpen(false)}
                              className={`block px-6 py-3.5 mx-2 rounded-xl text-sm font-medium transition-colors pl-8 ${isActive(subItem.href)
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 active:bg-secondary/80"
                                }`}
                            >
                              {subItem.name}
                            </Link>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    );
                  }

                  return (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-6 py-4 rounded-xl text-base font-medium transition-colors ${isActive(item.href)
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60 active:bg-secondary/80"
                          }`}
                      >
                        {item.name}
                      </Link>
                    </motion.div>
                  );
                })}

                <div className="border-t border-border/50 my-6 pt-6 mx-6">
                  {user ? (
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 bg-primary/10 text-primary font-semibold hover:bg-primary/20 hover:text-primary border border-primary/20 h-12 text-base"
                      asChild
                    >
                      <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <User className="w-5 h-5" />
                        Dashboard
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full justify-start gap-2 border-primary/20 hover:bg-primary/5 h-12 text-base" asChild>
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                        <User className="w-5 h-5" />
                        Sign In
                      </Link>
                    </Button>
                  )}

                  <Button variant="default" className="w-full btn-glow mt-4 h-12 text-base" asChild>
                    <Link to="/book" onClick={() => setMobileMenuOpen(false)}>
                      Book a Session
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header >
  );
}

const ListItem = ({ className, title, children, href, active, ...props }: any) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          to={href}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            active && "bg-accent/50 text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
};
