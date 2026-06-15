-- Phase 2: Activity Feed & Unlockables System
-- Unified activity tracking and theme/feature unlocks

-- 1. Activity Feed Table (Unified activity log)
CREATE TABLE IF NOT EXISTS public.activity_feed (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'xp_gain', 'level_up', 'badge_unlock', 'streak_milestone',
        'challenge_complete', 'theme_unlock', 'tool_unlock'
    )),
    activity_data JSONB NOT NULL, -- Flexible storage: {title, description, icon, amount, etc.}
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Unlockables Table (Themes, tools, features)
CREATE TABLE IF NOT EXISTS public.unlockables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    unlock_key TEXT UNIQUE NOT NULL, -- 'theme_ocean', 'breathing_advanced'
    unlock_type TEXT NOT NULL CHECK (unlock_type IN ('theme', 'tool', 'feature')),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    preview_image TEXT, -- URL to preview image
    required_level INTEGER CHECK (required_level >= 1 AND required_level <= 50),
    required_badge_key TEXT, -- Optional badge requirement
    price_xp INTEGER DEFAULT 0 CHECK (price_xp >= 0), -- Optional XP cost
    sort_order INTEGER DEFAULT 0,
    is_premium BOOLEAN DEFAULT false, -- Future: paid unlocks
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. User Unlocks Table
CREATE TABLE IF NOT EXISTS public.user_unlocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    unlockable_id UUID REFERENCES public.unlockables(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, unlockable_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_created ON public.activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON public.activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_unlockables_type ON public.unlockables(unlock_type);
CREATE INDEX IF NOT EXISTS idx_user_unlocks_user_id ON public.user_unlocks(user_id);

-- Enable RLS
ALTER TABLE public.activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unlockables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Activity Feed
CREATE POLICY "Users can view their own activity" ON public.activity_feed
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity" ON public.activity_feed
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own activity" ON public.activity_feed
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Unlockables (everyone can see what's available)
CREATE POLICY "Anyone can view unlockables" ON public.unlockables
    FOR SELECT USING (true);

-- RLS Policies for User Unlocks
CREATE POLICY "Users can view their own unlocks" ON public.user_unlocks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own unlocks" ON public.user_unlocks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function: Add activity to feed
CREATE OR REPLACE FUNCTION public.add_activity(
    p_user_id UUID,
    p_activity_type TEXT,
    p_activity_data JSONB
)
RETURNS UUID AS $$
DECLARE
    v_activity_id UUID;
BEGIN
    INSERT INTO public.activity_feed (user_id, activity_type, activity_data)
    VALUES (p_user_id, p_activity_type, p_activity_data)
    RETURNING id INTO v_activity_id;

    RETURN v_activity_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user's recent activity
CREATE OR REPLACE FUNCTION public.get_user_activity(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 20
)
RETURNS TABLE(
    id UUID,
    activity_type TEXT,
    activity_data JSONB,
    is_read BOOLEAN,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        af.id,
        af.activity_type,
        af.activity_data,
        af.is_read,
        af.created_at
    FROM public.activity_feed af
    WHERE af.user_id = p_user_id
    ORDER BY af.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user's unlockables (available + owned)
CREATE OR REPLACE FUNCTION public.get_user_unlockables(p_user_id UUID)
RETURNS TABLE(
    unlockable_id UUID,
    unlock_key TEXT,
    unlock_type TEXT,
    name TEXT,
    description TEXT,
    icon TEXT,
    preview_image TEXT,
    required_level INTEGER,
    required_badge_key TEXT,
    price_xp INTEGER,
    is_unlocked BOOLEAN,
    is_available BOOLEAN,
    unlocked_at TIMESTAMPTZ
) AS $$
DECLARE
    v_user_level INTEGER;
BEGIN
    -- Get user's current level
    SELECT current_level INTO v_user_level
    FROM public.user_xp
    WHERE user_id = p_user_id;

    IF v_user_level IS NULL THEN
        v_user_level := 1;
    END IF;

    RETURN QUERY
    SELECT
        u.id,
        u.unlock_key,
        u.unlock_type,
        u.name,
        u.description,
        u.icon,
        u.preview_image,
        u.required_level,
        u.required_badge_key,
        u.price_xp,
        (uu.user_id IS NOT NULL) AS is_unlocked,
        (u.required_level IS NULL OR v_user_level >= u.required_level) AS is_available,
        uu.unlocked_at
    FROM public.unlockables u
    LEFT JOIN public.user_unlocks uu ON u.id = uu.unlockable_id AND uu.user_id = p_user_id
    ORDER BY u.unlock_type, u.sort_order, u.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Unlock content for user
CREATE OR REPLACE FUNCTION public.unlock_content(
    p_user_id UUID,
    p_unlock_key TEXT
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    unlockable_name TEXT
) AS $$
DECLARE
    v_unlockable_id UUID;
    v_unlockable_name TEXT;
    v_required_level INTEGER;
    v_price_xp INTEGER;
    v_user_level INTEGER;
    v_user_xp INTEGER;
    v_already_unlocked BOOLEAN;
BEGIN
    -- Get unlockable details
    SELECT id, name, required_level, price_xp
    INTO v_unlockable_id, v_unlockable_name, v_required_level, v_price_xp
    FROM public.unlockables
    WHERE unlock_key = p_unlock_key;

    -- Check if unlockable exists
    IF v_unlockable_id IS NULL THEN
        RETURN QUERY SELECT false, 'Unlockable not found'::TEXT, ''::TEXT;
        RETURN;
    END IF;

    -- Check if already unlocked
    SELECT EXISTS(
        SELECT 1 FROM public.user_unlocks
        WHERE user_id = p_user_id AND unlockable_id = v_unlockable_id
    ) INTO v_already_unlocked;

    IF v_already_unlocked THEN
        RETURN QUERY SELECT false, 'Already unlocked'::TEXT, v_unlockable_name;
        RETURN;
    END IF;

    -- Get user stats
    SELECT current_level, total_xp INTO v_user_level, v_user_xp
    FROM public.user_xp
    WHERE user_id = p_user_id;

    IF v_user_level IS NULL THEN
        v_user_level := 1;
        v_user_xp := 0;
    END IF;

    -- Check level requirement
    IF v_required_level IS NOT NULL AND v_user_level < v_required_level THEN
        RETURN QUERY SELECT false, ('Requires level ' || v_required_level)::TEXT, v_unlockable_name;
        RETURN;
    END IF;

    -- Check XP cost (future feature)
    IF v_price_xp > 0 AND v_user_xp < v_price_xp THEN
        RETURN QUERY SELECT false, ('Requires ' || v_price_xp || ' XP')::TEXT, v_unlockable_name;
        RETURN;
    END IF;

    -- Unlock it!
    INSERT INTO public.user_unlocks (user_id, unlockable_id)
    VALUES (p_user_id, v_unlockable_id);

    -- Add to activity feed
    PERFORM public.add_activity(
        p_user_id,
        'theme_unlock',
        jsonb_build_object(
            'title', 'New Theme Unlocked!',
            'description', v_unlockable_name,
            'icon', '🎨'
        )
    );

    RETURN QUERY SELECT true, 'Unlocked successfully!'::TEXT, v_unlockable_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create activity on level up
CREATE OR REPLACE FUNCTION public.auto_activity_on_level_up()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_level > OLD.current_level THEN
        PERFORM public.add_activity(
            NEW.user_id,
            'level_up',
            jsonb_build_object(
                'title', 'Level Up!',
                'description', 'You reached level ' || NEW.current_level || ' - ' || NEW.level_title,
                'icon', '🎉',
                'new_level', NEW.current_level,
                'level_title', NEW.level_title
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_activity_level_up
    AFTER UPDATE ON public.user_xp
    FOR EACH ROW
    WHEN (NEW.current_level > OLD.current_level)
    EXECUTE FUNCTION public.auto_activity_on_level_up();

-- Trigger: Auto-create activity on badge unlock
CREATE OR REPLACE FUNCTION public.auto_activity_on_badge_unlock()
RETURNS TRIGGER AS $$
DECLARE
    v_badge_name TEXT;
    v_badge_icon TEXT;
    v_badge_rarity TEXT;
BEGIN
    -- Get badge details
    SELECT name, icon, rarity INTO v_badge_name, v_badge_icon, v_badge_rarity
    FROM public.badges
    WHERE id = NEW.badge_id;

    PERFORM public.add_activity(
        NEW.user_id,
        'badge_unlock',
        jsonb_build_object(
            'title', 'Badge Unlocked!',
            'description', v_badge_name,
            'icon', v_badge_icon,
            'rarity', v_badge_rarity
        )
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_activity_badge_unlock
    AFTER INSERT ON public.user_badges
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_activity_on_badge_unlock();

-- Seed 3 unlockable themes
INSERT INTO public.unlockables (unlock_key, unlock_type, name, description, icon, required_level, sort_order) VALUES
('theme_ocean', 'theme', 'Ocean Breeze', 'Calming blues and teals inspired by the sea', '🌊', 5, 1),
('theme_forest', 'theme', 'Forest Calm', 'Grounding greens and earthy browns', '🌲', 10, 2),
('theme_sunset', 'theme', 'Sunset Glow', 'Warm oranges and purples of twilight', '🌅', 15, 3)
ON CONFLICT (unlock_key) DO NOTHING;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.add_activity(UUID, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_activity(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_unlockables(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_content(UUID, TEXT) TO authenticated;
