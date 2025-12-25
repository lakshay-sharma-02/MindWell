import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  X,
  Minimize2,
} from "lucide-react";
import { PodcastEpisode } from "@/data/podcasts";

interface AudioPlayerProps {
  episode: PodcastEpisode | null;
  onClose: () => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export function AudioPlayer({ episode, onClose, isMinimized, onToggleMinimize }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  useEffect(() => {
    if (episode && audioRef.current) {
      audioRef.current.src = episode.audioUrl;
      audioRef.current.play();
      setIsPlaying(true);
    }
  }, [episode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime += seconds;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const changePlaybackRate = () => {
    if (!audioRef.current) return;
    const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!episode) return null;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isMinimized) {
    return (
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <audio ref={audioRef} />
        <div className="bg-card border border-border rounded-full shadow-lg p-2 flex items-center gap-2">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <button
            onClick={onToggleMinimize}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <Minimize2 className="w-4 h-4 rotate-180" />
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border"
    >
      <audio ref={audioRef} />
      
      {/* Progress Bar */}
      <div
        className="h-1 bg-muted cursor-pointer group"
        onClick={handleProgressClick}
      >
        <div
          className="h-full bg-primary transition-all group-hover:h-1.5"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="container-wide py-4">
        <div className="flex items-center gap-4">
          {/* Episode Info */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm text-foreground truncate">
              {episode.title}
            </h4>
            <p className="text-xs text-muted-foreground">
              Episode {episode.episodeNumber} • {episode.duration}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => skip(-15)}
              className="p-2 hover:bg-muted rounded-full transition-colors hidden sm:block"
              title="Skip back 15s"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            
            <button
              onClick={() => skip(15)}
              className="p-2 hover:bg-muted rounded-full transition-colors hidden sm:block"
              title="Skip forward 15s"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Time */}
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground min-w-[100px]">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          {/* Speed & Volume */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={changePlaybackRate}
              className="px-2 py-1 text-xs font-medium bg-muted hover:bg-muted/80 rounded transition-colors"
            >
              {playbackRate}x
            </button>
            
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleMinimize}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              title="Minimize"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
