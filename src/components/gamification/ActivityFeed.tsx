import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap, TrendingUp, Award, Flame, MessageSquare, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  activity_type: string;
  activity_data: {
    title: string;
    description: string;
    icon: string;
    amount?: number;
    new_level?: number;
    level_title?: string;
    rarity?: string;
  };
  is_read: boolean;
  created_at: string;
}

export function ActivityFeed() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchActivities();

      // Subscribe to real-time activity updates
      const channel = supabase
        .channel('activity_updates')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activity_feed',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            fetchActivities();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchActivities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('get_user_activity', {
        p_user_id: user.id,
        p_limit: 15,
      });

      if (error) throw error;

      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string, iconFromData?: string) => {
    if (iconFromData) {
      return <span className="text-xl">{iconFromData}</span>;
    }

    switch (type) {
      case 'xp_gain':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'level_up':
        return <TrendingUp className="w-5 h-5 text-primary" />;
      case 'badge_unlock':
        return <Award className="w-5 h-5 text-purple-500" />;
      case 'streak_milestone':
        return <Flame className="w-5 h-5 text-orange-500" />;
      case 'challenge_complete':
        return <Trophy className="w-5 h-5 text-amber-500" />;
      default:
        return <MessageSquare className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getActivityColor = (type: string, rarity?: string) => {
    if (type === 'badge_unlock') {
      switch (rarity) {
        case 'legendary':
          return 'from-purple-500/20 to-amber-500/20 border-purple-500/30';
        case 'rare':
          return 'from-amber-500/20 to-orange-500/20 border-amber-500/30';
        default:
          return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      }
    }

    switch (type) {
      case 'level_up':
        return 'from-primary/20 to-purple-500/20 border-primary/30';
      case 'xp_gain':
        return 'from-amber-500/20 to-yellow-500/20 border-amber-500/30';
      case 'streak_milestone':
        return 'from-orange-500/20 to-red-500/20 border-orange-500/30';
      case 'challenge_complete':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      default:
        return 'from-muted/20 to-muted/10 border-muted/30';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-display font-bold text-lg">Recent Activity</h3>
      </div>

      <ScrollArea className="h-[400px] pr-4">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No activities yet. Start your wellness journey!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className={cn(
                    'p-4 rounded-xl border transition-all duration-300 hover:shadow-md bg-gradient-to-r',
                    getActivityColor(
                      activity.activity_type,
                      activity.activity_data.rarity
                    )
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center">
                      {getActivityIcon(
                        activity.activity_type,
                        activity.activity_data.icon
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm leading-tight">
                            {activity.activity_data.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {activity.activity_data.description}
                          </p>

                          {/* Extra info for special activities */}
                          {activity.activity_type === 'level_up' &&
                            activity.activity_data.level_title && (
                              <p className="text-xs text-primary font-medium mt-1">
                                {activity.activity_data.level_title}
                              </p>
                            )}
                          {activity.activity_type === 'xp_gain' &&
                            activity.activity_data.amount && (
                              <p className="text-xs text-amber-600 font-medium mt-1">
                                +{activity.activity_data.amount} XP
                              </p>
                            )}
                        </div>

                        {/* Time */}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTimeAgo(activity.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
