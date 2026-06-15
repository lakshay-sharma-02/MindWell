-- Phase 2: Badge & Achievement System - FIXED VERSION
-- Comprehensive badge system with 20 essential achievements

-- 1. Badges Table (Master list of all achievements)
CREATE TABLE IF NOT EXISTS public.badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    badge_key TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('streak', 'mood', 'journal', 'community', 'ai', 'tools', 'milestone')),
    rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'legendary')) DEFAULT 'common',
    requirement_type TEXT NOT NULL CHECK (requirement_type IN ('count', 'streak', 'milestone', 'special')),
    requirement_value INTEGER,
    xp_reward INTEGER DEFAULT 50,
    sort_order INTEGER DEFAULT 0,
    is_secret BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. User Badges (Unlocked achievements)
CREATE TABLE IF NOT EXISTS public.user_badges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, badge_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_badges_category ON public.badges(category);
CREATE INDEX IF NOT EXISTS idx_badges_rarity ON public.badges(rarity);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_unlocked_at ON public.user_badges(unlocked_at DESC);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Badges (everyone can read)
CREATE POLICY "Anyone can view badges" ON public.badges
    FOR SELECT USING (true);

-- RLS Policies for User Badges
CREATE POLICY "Users can view their own badges" ON public.user_badges
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges" ON public.user_badges
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function: Unlock badge for user
CREATE OR REPLACE FUNCTION public.unlock_badge(
    p_user_id UUID,
    p_badge_key TEXT
)
RETURNS TABLE(
    unlocked BOOLEAN,
    badge_name TEXT,
    badge_rarity TEXT,
    xp_awarded INTEGER
) AS $$
DECLARE
    v_badge_id UUID;
    v_badge_name TEXT;
    v_badge_rarity TEXT;
    v_xp_reward INTEGER;
    v_already_unlocked BOOLEAN;
BEGIN
    SELECT id, name, rarity, xp_reward
    INTO v_badge_id, v_badge_name, v_badge_rarity, v_xp_reward
    FROM public.badges
    WHERE badge_key = p_badge_key;

    IF v_badge_id IS NULL THEN
        RETURN QUERY SELECT false, ''::TEXT, ''::TEXT, 0;
        RETURN;
    END IF;

    SELECT EXISTS(
        SELECT 1 FROM public.user_badges
        WHERE user_id = p_user_id AND badge_id = v_badge_id
    ) INTO v_already_unlocked;

    IF v_already_unlocked THEN
        RETURN QUERY SELECT false, v_badge_name, v_badge_rarity, 0;
        RETURN;
    END IF;

    INSERT INTO public.user_badges (user_id, badge_id)
    VALUES (p_user_id, v_badge_id);

    PERFORM public.award_xp(
        p_user_id,
        v_xp_reward,
        'badge_unlock',
        'Unlocked badge: ' || v_badge_name
    );

    RETURN QUERY SELECT true, v_badge_name, v_badge_rarity, v_xp_reward;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check and unlock badges based on user activity
CREATE OR REPLACE FUNCTION public.check_badge_eligibility(p_user_id UUID)
RETURNS TABLE(
    badge_key TEXT,
    badge_name TEXT,
    newly_unlocked BOOLEAN
) AS $$
DECLARE
    v_mood_count INTEGER;
    v_journal_count INTEGER;
    v_streak_days INTEGER;
    v_breathing_count INTEGER;
    v_checkin_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_mood_count FROM public.mood_logs WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO v_journal_count FROM public.gratitude_entries WHERE user_id = p_user_id;
    SELECT COALESCE(MAX(streak_days), 0) INTO v_streak_days FROM public.user_xp WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO v_breathing_count FROM public.mood_logs WHERE user_id = p_user_id;
    SELECT COUNT(*) INTO v_checkin_count FROM public.daily_checkins WHERE user_id = p_user_id;

    IF v_streak_days >= 7 THEN
        RETURN QUERY SELECT * FROM public.unlock_badge(p_user_id, 'fire_starter_7');
    END IF;
    IF v_streak_days >= 30 THEN
        RETURN QUERY SELECT * FROM public.unlock_badge(p_user_id, 'flame_keeper_30');
    END IF;

    IF v_mood_count >= 10 THEN
        RETURN QUERY SELECT * FROM public.unlock_badge(p_user_id, 'mood_explorer_10');
    END IF;
    IF v_mood_count >= 50 THEN
        RETURN QUERY SELECT * FROM public.unlock_badge(p_user_id, 'emotional_detective_50');
    END IF;

    IF v_journal_count >= 10 THEN
        RETURN QUERY SELECT * FROM public.unlock_badge(p_user_id, 'gratitude_beginner_10');
    END IF;
    IF v_journal_count >= 30 THEN
        RETURN QUERY SELECT * FROM public.unlock_badge(p_user_id, 'journal_devotee_30');
    END IF;

    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user badge collection
CREATE OR REPLACE FUNCTION public.get_user_badge_collection(p_user_id UUID)
RETURNS TABLE(
    badge_id UUID,
    badge_key TEXT,
    name TEXT,
    description TEXT,
    icon TEXT,
    category TEXT,
    rarity TEXT,
    is_unlocked BOOLEAN,
    unlocked_at TIMESTAMPTZ,
    is_secret BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.badge_key,
        b.name,
        b.description,
        b.icon,
        b.category,
        b.rarity,
        (ub.user_id IS NOT NULL) AS is_unlocked,
        ub.unlocked_at,
        b.is_secret
    FROM public.badges b
    LEFT JOIN public.user_badges ub ON b.id = ub.badge_id AND ub.user_id = p_user_id
    WHERE b.is_secret = false OR ub.user_id IS NOT NULL
    ORDER BY b.sort_order, b.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed 20 Essential Badges (FIXED - No problematic quotes)
INSERT INTO public.badges (badge_key, name, description, icon, category, rarity, requirement_type, requirement_value, xp_reward, sort_order) VALUES

-- STREAK BADGES (4)
('fire_starter_7', 'Fire Starter 🔥', 'Maintain a 7-day streak', '🔥', 'streak', 'common', 'streak', 7, 50, 1),
('flame_keeper_30', 'Flame Keeper 🔥', 'Keep the fire burning for 30 days', '🔥', 'streak', 'rare', 'streak', 30, 200, 2),
('inferno_100', 'Inferno 🔥', 'Unstoppable 100-day streak', '🔥', 'streak', 'legendary', 'streak', 100, 1000, 3),
('eternal_flame_365', 'Eternal Flame 🔥', 'One full year of dedication', '🔥', 'streak', 'legendary', 'streak', 365, 5000, 4),

-- MOOD BADGES (4)
('mood_explorer_10', 'Emotional Explorer 😊', 'Log 10 moods and begin understanding yourself', '😊', 'mood', 'common', 'count', 10, 30, 5),
('emotional_detective_50', 'Pattern Detective 🎯', 'Track 50 moods and identify patterns', '🎯', 'mood', 'rare', 'count', 50, 150, 6),
('mood_master_100', 'Mood Master 📊', 'Complete 100 mood logs', '📊', 'mood', 'rare', 'count', 100, 300, 7),
('self_aware_500', 'Self-Awareness Champion 🌟', 'Log 500 moods - deep self-knowledge', '🌟', 'mood', 'legendary', 'count', 500, 2500, 8),

-- JOURNAL BADGES (3)
('gratitude_beginner_10', 'Gratitude Beginner 💚', 'Write 10 gratitude entries', '💚', 'journal', 'common', 'count', 10, 30, 9),
('journal_devotee_30', 'Journal Devotee 📝', 'Document 30 moments of gratitude', '📝', 'journal', 'rare', 'count', 30, 150, 10),
('gratitude_guru_100', 'Gratitude Guru 🙏', 'Master gratitude with 100 entries', '🙏', 'journal', 'legendary', 'count', 100, 500, 11),

-- COMMUNITY BADGES (3)
('helper_10', 'Helping Hand 💬', 'Answer 10 community questions', '💬', 'community', 'common', 'count', 10, 50, 12),
('storyteller', 'Storyteller 📖', 'Share your story to inspire others', '📖', 'community', 'rare', 'milestone', 1, 200, 13),
('support_star_50', 'Support Star 🤝', 'Help 50 community members', '🤝', 'community', 'legendary', 'count', 50, 1000, 14),

-- AI BADGES (3) - FIXED: Removed apostrophe
('luna_friend_100', 'Lunas Friend 🤖', 'Chat with AI companion 100 times', '🤖', 'ai', 'common', 'count', 100, 50, 15),
('crisis_survivor', 'Crisis Survivor 🚨', 'Used crisis predictor proactively', '🚨', 'ai', 'rare', 'milestone', 1, 300, 16),
('goal_crusher_10', 'Goal Crusher 🎯', 'Complete 10 AI-suggested goals', '🎯', 'ai', 'rare', 'count', 10, 200, 17),

-- TOOLS BADGES (3)
('breath_master_50', 'Breath Master 🌬️', 'Complete 50 breathing exercises', '🌬️', 'tools', 'rare', 'count', 50, 150, 18),
('first_steps', 'First Steps 👣', 'Complete your first daily check-in', '👣', 'tools', 'common', 'milestone', 1, 20, 19),
('wellness_explorer', 'Wellness Explorer 🧭', 'Try all mental wellness tools', '🧭', 'tools', 'rare', 'milestone', 1, 100, 20)

ON CONFLICT (badge_key) DO NOTHING;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.unlock_badge(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_badge_eligibility(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_badge_collection(UUID) TO authenticated;
