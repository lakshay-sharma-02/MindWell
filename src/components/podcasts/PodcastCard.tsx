import { useState, useRef } from "react";
import { Play, Pause, Clock, User, Pencil, Check, X, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  duration: string;
  season: number;
  episodeNumber: number;
  audioUrl: string;
  guest?: {
    name: string;
    title: string;
  };
  topics: string[];
}

interface PodcastCardProps {
  episode: PodcastEpisode;
  variant?: "light" | "dark";
  onUpdate?: () => void;
}

export function PodcastCard({ episode, variant = "light", onUpdate }: PodcastCardProps) {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    title: episode.title,
    description: episode.description,
    duration: episode.duration,
  });
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("podcasts")
        .update({
          title: editData.title,
          description: editData.description,
          duration: editData.duration,
        })
        .eq("id", episode.id);

      if (error) throw error;

      toast({ title: "Saved!", description: "Podcast updated successfully." });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Error saving:", error);
      toast({ title: "Error", description: "Failed to save changes.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this podcast?")) return;

    try {
      const { error } = await supabase.from("podcasts").delete().eq("id", episode.id);
      if (error) throw error;

      toast({ title: "Deleted", description: "Podcast has been removed." });
      onUpdate?.();
    } catch (error) {
      console.error("Error deleting:", error);
      toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
    }
  };

  const handleCancel = () => {
    setEditData({
      title: episode.title,
      description: episode.description,
      duration: episode.duration,
    });
    setIsEditing(false);
  };

  const isDark = variant === "dark";

  return (
    <motion.article 
      whileHover={{ y: -5 }}
      className={`relative rounded-2xl p-6 transition-all duration-300 ${
        isDark 
          ? "bg-white/10 backdrop-blur-sm border border-white/10 hover:bg-white/15" 
          : "bg-card shadow-soft hover:shadow-card border border-border/50"
      } ${isEditing ? 'ring-2 ring-primary' : ''}`}
    >
      {/* Admin Edit Controls */}
      {isAdmin && !isEditing && (
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors shadow-lg"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Save/Cancel Controls */}
      {isEditing && (
        <div className="absolute top-4 right-4 z-20 flex gap-1">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-50"
            title="Save"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={handleCancel}
            className="p-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-colors shadow-lg"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={togglePlay}
          className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${
            isDark 
              ? "bg-gradient-to-br from-terracotta to-rose text-white" 
              : "bg-gradient-to-br from-primary to-cyan text-white"
          }`}
          aria-label={isPlaying ? "Pause episode" : "Play episode"}
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6 ml-1" />
          )}
        </motion.button>

        <div className="flex-1 min-w-0">
          <div className={`flex items-center gap-2 text-xs mb-1 ${isDark ? "text-white/60" : "text-muted-foreground"}`}>
            <span className="font-semibold">S{episode.season} E{episode.episodeNumber}</span>
            <span>•</span>
            {isEditing ? (
              <input
                type="text"
                value={editData.duration}
                onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
                className="w-16 px-1 bg-transparent border-b border-primary focus:outline-none text-xs"
                placeholder="00:00"
              />
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {episode.duration}
              </span>
            )}
          </div>
          
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className={`w-full font-display text-lg font-semibold bg-transparent border-b border-primary focus:outline-none ${isDark ? "text-white" : "text-foreground"}`}
            />
          ) : (
            <h3 className={`font-display text-lg font-semibold line-clamp-2 ${isDark ? "text-white" : "text-foreground"}`}>
              {episode.title}
            </h3>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={editData.description}
          onChange={(e) => setEditData({ ...editData, description: e.target.value })}
          rows={2}
          className={`w-full text-sm leading-relaxed mb-4 bg-transparent border border-primary rounded p-2 focus:outline-none resize-none ${isDark ? "text-white/70" : "text-muted-foreground"}`}
        />
      ) : (
        <p className={`text-sm leading-relaxed mb-4 line-clamp-2 ${isDark ? "text-white/70" : "text-muted-foreground"}`}>
          {episode.description}
        </p>
      )}

      {episode.guest && (
        <div className={`flex items-center gap-2 mb-4 p-3 rounded-lg ${isDark ? "bg-white/10" : "bg-sage-light/50"}`}>
          <User className={`w-4 h-4 ${isDark ? "text-white/80" : "text-primary"}`} />
          <div className="text-sm">
            <span className={`font-medium ${isDark ? "text-white" : "text-foreground"}`}>{episode.guest.name}</span>
            <span className={isDark ? "text-white/60" : "text-muted-foreground"}> • {episode.guest.title}</span>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {episode.topics.slice(0, 3).map((topic) => (
          <span
            key={topic}
            className={`px-2 py-1 rounded-md text-xs font-medium ${
              isDark 
                ? "bg-white/10 text-white/80" 
                : "bg-secondary text-secondary-foreground"
            }`}
          >
            {topic}
          </span>
        ))}
      </div>

      <audio
        ref={audioRef}
        src={episode.audioUrl}
        onEnded={() => setIsPlaying(false)}
      />
    </motion.article>
  );
}
