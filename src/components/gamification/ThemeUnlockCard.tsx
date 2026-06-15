import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Palette, Lock, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Unlockable {
  unlockable_id: string;
  unlock_key: string;
  unlock_type: string;
  name: string;
  description: string;
  icon: string;
  required_level: number | null;
  is_unlocked: boolean;
  is_available: boolean;
  unlocked_at: string | null;
}

export function ThemeUnlockCard() {
  const { user } = useAuth();
  const [themes, setThemes] = useState<Unlockable[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchThemes();
    }
  }, [user]);

  const fetchThemes = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_user_unlockables', {
        p_user_id: user.id,
      });

      if (error) throw error;

      // Filter to only show themes
      const themeData = (data || []).filter((u: Unlockable) => u.unlock_type === 'theme');
      setThemes(themeData);
    } catch (error) {
      console.error('Error fetching themes:', error);
    } finally {
      setLoading(false);
    }
  };

  const unlockTheme = async (unlockKey: string) => {
    if (!user || unlocking) return;

    setUnlocking(unlockKey);

    try {
      const { data, error } = await supabase.rpc('unlock_content', {
        p_user_id: user.id,
        p_unlock_key: unlockKey,
      });

      if (error) throw error;

      const result = data[0];

      if (result.success) {
        toast.success('Theme Unlocked! 🎨', {
          description: result.unlockable_name,
        });
        fetchThemes();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error unlocking theme:', error);
      toast.error('Failed to unlock theme');
    } finally {
      setUnlocking(null);
    }
  };

  const getThemePreview = (themeKey: string) => {
    switch (themeKey) {
      case 'theme_ocean':
        return 'from-blue-500 via-cyan-500 to-teal-500';
      case 'theme_forest':
        return 'from-green-600 via-emerald-500 to-lime-500';
      case 'theme_sunset':
        return 'from-orange-500 via-pink-500 to-purple-500';
      default:
        return 'from-primary via-purple-500 to-pink-500';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (themes.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="font-display font-bold text-lg">Unlockable Themes</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {themes.map((theme, index) => (
          <motion.div
            key={theme.unlockable_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div
              className={cn(
                'relative group overflow-hidden rounded-xl border-2 transition-all duration-300',
                theme.is_unlocked
                  ? 'border-primary/50 hover:border-primary hover:shadow-lg'
                  : theme.is_available
                  ? 'border-muted hover:border-primary/30'
                  : 'border-muted opacity-60'
              )}
            >
              {/* Theme Preview */}
              <div
                className={cn(
                  'h-24 bg-gradient-to-br',
                  getThemePreview(theme.unlock_key)
                )}
              >
                {/* Lock overlay */}
                {!theme.is_unlocked && (
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                    <div className="p-3 rounded-full bg-black/50">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                  </div>
                )}

                {/* Unlocked checkmark */}
                {theme.is_unlocked && (
                  <div className="absolute top-2 right-2">
                    <div className="p-1 rounded-full bg-green-500 text-white">
                      <Check className="w-4 h-4" />
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div className="absolute bottom-2 left-2">
                  <span className="text-3xl drop-shadow-lg">{theme.icon}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 bg-card">
                <h4 className="font-semibold mb-1">{theme.name}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                  {theme.description}
                </p>

                {/* Action */}
                {theme.is_unlocked ? (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full text-xs"
                    onClick={() => toast.info('Theme switching coming soon!')}
                  >
                    Apply Theme
                  </Button>
                ) : theme.is_available ? (
                  <Button
                    size="sm"
                    className="w-full text-xs bg-gradient-to-r from-primary to-purple-600"
                    onClick={() => unlockTheme(theme.unlock_key)}
                    disabled={unlocking === theme.unlock_key}
                  >
                    {unlocking === theme.unlock_key ? 'Unlocking...' : 'Unlock Now'}
                  </Button>
                ) : (
                  <div className="text-xs text-center text-muted-foreground">
                    Requires Level {theme.required_level}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4">
        💡 Unlock new themes by leveling up your account
      </p>
    </Card>
  );
}
