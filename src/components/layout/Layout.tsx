import { ReactNode, useState, useEffect, createContext, useContext } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { AdminFloatingPanel } from "@/components/admin/AdminFloatingPanel";
import { AdminEditProvider } from "@/hooks/useAdminEdit";
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { SearchModal } from "@/components/search/SearchModal";

import { NewsletterModal } from "@/components/engagement/NewsletterModal";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { CookieBanner } from "@/components/engagement/CookieBanner";
import { AudioPlayer } from "@/components/audio/AudioPlayer";

import { CrisisBanner } from "@/components/shared/CrisisBanner";
import { AnnouncementBanner } from "@/components/layout/AnnouncementBanner";
import { PodcastEpisode } from "@/data/podcasts";

interface LayoutProps {
  children: ReactNode;
}

interface AudioContextType {
  playEpisode: (episode: PodcastEpisode) => void;
}

export const AudioContext = createContext<AudioContextType | null>(null);

export const useAudioPlayer = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioProvider");
  }
  return context;
};

export function Layout({ children }: LayoutProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);

  // Global keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const playEpisode = (episode: PodcastEpisode) => {
    setCurrentEpisode(episode);
    setIsPlayerMinimized(false);
  };

  return (
    <AudioContext.Provider value={{ playEpisode }}>
      <AdminEditProvider>
        <div className="min-h-screen flex flex-col bg-background font-body relative">
          <CrisisBanner />
          <AnnouncementBanner />
          <CursorGlow />
          <ScrollProgress />
          <Header onSearchClick={() => setIsSearchOpen(true)} />

          <main className="flex-grow pt-16 lg:pt-[4.5rem] relative z-10">
            {children}
          </main>

          <Footer />
          <AdminFloatingPanel />

          {/* Search Modal */}
          <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

          {/* Audio Player */}
          {currentEpisode && (
            <AudioPlayer
              episode={currentEpisode}
              onClose={() => setCurrentEpisode(null)}
              isMinimized={isPlayerMinimized}
              onToggleMinimize={() => setIsPlayerMinimized(!isPlayerMinimized)}
            />
          )}

          {/* Engagement Features */}
          <ChatWidget />
          <NewsletterModal />
          <CookieBanner />
        </div>
      </AdminEditProvider>
    </AudioContext.Provider>
  );
}
