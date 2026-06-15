import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Lock, Sparkles, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Badge {
  badge_id: string;
  badge_key: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: "common" | "rare" | "legendary";
  is_unlocked: boolean;
  unlocked_at: string | null;
  is_secret: boolean;
}

export function BadgeCollection() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    if (user) {
      fetchBadges();
    }
  }, [user]);

  const fetchBadges = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("get_user_badge_collection", {
        p_user_id: user.id,
      });

      if (error) throw error;

      setBadges(data || []);
    } catch (error) {
      console.error("Error fetching badges:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "from-purple-500 via-pink-500 to-amber-500";
      case "rare":
        return "from-amber-500 to-orange-500";
      default:
        return "from-blue-500 to-cyan-500";
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case "legendary":
        return "border-purple-500/50";
      case "rare":
        return "border-amber-500/50";
      default:
        return "border-blue-500/50";
    }
  };

  const categories = [
    { key: "all", label: "All", icon: "🏆" },
    { key: "streak", label: "Streaks", icon: "🔥" },
    { key: "mood", label: "Mood", icon: "😊" },
    { key: "journal", label: "Journal", icon: "📝" },
    { key: "community", label: "Community", icon: "🤝" },
    { key: "ai", label: "AI", icon: "🤖" },
    { key: "tools", label: "Tools", icon: "🛠️" },
    { key: "milestone", label: "Milestones", icon: "⭐" },
  ];

  const filteredBadges =
    filter === "all"
      ? badges
      : badges.filter((b) => b.category === filter);

  const unlockedCount = badges.filter((b) => b.is_unlocked).length;
  const totalCount = badges.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold mb-2">Badge Collection</h2>
            <p className="text-muted-foreground">
              Collect badges by completing challenges and reaching milestones
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">
              {unlockedCount}/{totalCount}
            </div>
            <p className="text-sm text-muted-foreground">Unlocked</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-primary to-purple-600"
            />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap h-auto p-1 bg-secondary/30">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.key}
              value={cat.key}
              className="flex items-center gap-2 whitespace-nowrap"
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredBadges.map((badge, index) => (
              <motion.div
                key={badge.badge_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className={cn(
                    "relative p-6 text-center transition-all duration-300 group",
                    badge.is_unlocked
                      ? `hover:shadow-xl hover:-translate-y-1 border-2 ${getRarityBorder(badge.rarity)}`
                      : "opacity-60 hover:opacity-80"
                  )}
                >
                  {/* Rarity Badge */}
                  <div className="absolute top-2 right-2">
                    <UIBadge
                      variant="secondary"
                      className={cn(
                        "text-xs uppercase font-bold",
                        badge.rarity === "legendary" &&
                          "bg-gradient-to-r from-purple-500 to-amber-500 text-white",
                        badge.rarity === "rare" && "bg-amber-500 text-white",
                        badge.rarity === "common" && "bg-blue-500 text-white"
                      )}
                    >
                      {badge.rarity}
                    </UIBadge>
                  </div>

                  {/* Badge Icon */}
                  <div className="relative mb-4">
                    <div
                      className={cn(
                        "inline-flex items-center justify-center w-20 h-20 rounded-full",
                        badge.is_unlocked
                          ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} shadow-lg`
                          : "bg-muted"
                      )}
                    >
                      {badge.is_unlocked ? (
                        <span className="text-4xl">{badge.icon}</span>
                      ) : (
                        <Lock className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>

                    {/* Sparkle effect for legendary */}
                    {badge.is_unlocked && badge.rarity === "legendary" && (
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 180, 360],
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -top-1 -right-1"
                      >
                        <Sparkles className="w-5 h-5 text-amber-500" />
                      </motion.div>
                    )}
                  </div>

                  {/* Badge Info */}
                  <h3 className="font-display font-bold mb-1">{badge.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {badge.is_unlocked || !badge.is_secret
                      ? badge.description
                      : "???"}
                  </p>

                  {/* Unlock Date */}
                  {badge.is_unlocked && badge.unlocked_at && (
                    <p className="text-xs text-muted-foreground mt-3">
                      Unlocked {new Date(badge.unlocked_at).toLocaleDateString()}
                    </p>
                  )}

                  {/* Locked Overlay */}
                  {!badge.is_unlocked && (
                    <div className="absolute inset-0 bg-black/5 rounded-lg pointer-events-none" />
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {filteredBadges.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No badges in this category yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
