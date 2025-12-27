import { ReactNode, useState, useEffect } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ScrollProgress } from "@/components/effects/ScrollProgress";
import { BackToTop } from "@/components/effects/BackToTop";
import { CursorGlow } from "@/components/effects/CursorGlow";
import { SearchModal } from "@/components/search/SearchModal";
import { SocialProofToast } from "@/components/engagement/SocialProofToast";
import { NewsletterModal } from "@/components/engagement/NewsletterModal";
import { CookieBanner } from "@/components/engagement/CookieBanner";
import { AudioPlayer } from "@/components/audio/AudioPlayer";
import { AdminFloatingPanel } from "@/components/admin/AdminFloatingPanel";
import { PodcastEpisode } from "@/data/podcasts";

interface LayoutProps {
  children: ReactNode;
}

// Create a context for the audio player
import { createContext, useContext } from "react";

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

import { FeatureTour } from "@/components/onboarding/FeatureTour";
import { useAuth } from "@/hooks/useAuth";

export function Layout({ children }: LayoutProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState<PodcastEpisode | null>(null);
  const [isPlayerMinimized, setIsPlayerMinimized] = useState(false);
  const { hasSeenTour, completeTour, user, loading } = useAuth(); // Get tour status

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
      <div className="min-h-screen flex flex-col relative">
        <CursorGlow />
        <ScrollProgress />
        <Header onSearchClick={() => setIsSearchOpen(true)} />
        <main className="flex-1">{children}</main>
        <Footer />
        <BackToTop />

        {/* Feature Tour */}
        {!loading && user && (
          <FeatureTour
            isOpen={!hasSeenTour}
            onComplete={completeTour}
            onSkip={completeTour}
          />
        )}

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
        <SocialProofToast />
        <NewsletterModal />
        <CookieBanner />

        {/* Admin Panel */}
        <AdminFloatingPanel />
      </div>
    </AudioContext.Provider>
  );
}
