-- Phase 2: XP & Leveling System
-- Tracks user experience points, levels, and progression

-- 1. User XP Table (Main progression tracker)
CREATE TABLE IF NOT EXISTS public.user_xp (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 50),
    xp_to_next_level INTEGER DEFAULT 100,
    level_title TEXT DEFAULT 'Beginner',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. XP Transactions (Audit trail of all XP gains)
CREATE TABLE IF NOT EXISTS public.xp_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount INTEGER NOT NULL,
    source TEXT NOT NULL, -- 'mood_log', 'journal', 'breathing', 'check_in', 'chat', 'reward_wheel', 'community'
    description TEXT,
    metadata JSONB, -- Additional context (e.g., mood value, journal length)
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_xp_user_id ON public.user_xp(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON public.xp_transactions(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for User XP
CREATE POLICY "Users can view their own XP" ON public.user_xp
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP record" ON public.user_xp
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own XP" ON public.user_xp
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for XP Transactions
CREATE POLICY "Users can view their own transactions" ON public.xp_transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions" ON public.xp_transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function: Get level title based on level number
CREATE OR REPLACE FUNCTION public.get_level_title(level INTEGER)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN level BETWEEN 1 AND 5 THEN 'Beginner'
        WHEN level BETWEEN 6 AND 10 THEN 'Mindful Explorer'
        WHEN level BETWEEN 11 AND 15 THEN 'Wellness Seeker'
        WHEN level BETWEEN 16 AND 20 THEN 'Wellness Warrior'
        WHEN level BETWEEN 21 AND 25 THEN 'Mental Health Champion'
        WHEN level BETWEEN 26 AND 30 THEN 'Zen Master'
        WHEN level BETWEEN 31 AND 35 THEN 'Enlightened Soul'
        WHEN level BETWEEN 36 AND 40 THEN 'Wellness Legend'
        WHEN level BETWEEN 41 AND 45 THEN 'Master of Mindfulness'
        ELSE 'Transcendent Being'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Calculate XP needed for next level (exponential curve)
CREATE OR REPLACE FUNCTION public.calculate_xp_for_level(level INTEGER)
RETURNS INTEGER AS $$
BEGIN
    -- Exponential formula: base * (level^1.5)
    -- Level 1->2: 100 XP
    -- Level 10->11: ~316 XP
    -- Level 25->26: ~1250 XP
    RETURN FLOOR(100 * POWER(level, 1.5))::INTEGER;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Award XP to user and handle level-ups
CREATE OR REPLACE FUNCTION public.award_xp(
    p_user_id UUID,
    p_amount INTEGER,
    p_source TEXT,
    p_description TEXT DEFAULT NULL,
    p_metadata JSONB DEFAULT NULL
)
RETURNS TABLE(
    new_total_xp INTEGER,
    new_level INTEGER,
    leveled_up BOOLEAN,
    old_level INTEGER
) AS $$
DECLARE
    v_current_xp INTEGER;
    v_current_level INTEGER;
    v_xp_to_next INTEGER;
    v_new_xp INTEGER;
    v_new_level INTEGER;
    v_leveled_up BOOLEAN := false;
    v_old_level INTEGER;
BEGIN
    -- Initialize user XP record if it doesn't exist
    INSERT INTO public.user_xp (user_id, total_xp, current_level, xp_to_next_level, level_title)
    VALUES (p_user_id, 0, 1, public.calculate_xp_for_level(1), public.get_level_title(1))
    ON CONFLICT (user_id) DO NOTHING;

    -- Get current XP data
    SELECT total_xp, current_level, xp_to_next_level
    INTO v_current_xp, v_current_level, v_xp_to_next
    FROM public.user_xp
    WHERE user_id = p_user_id;

    v_old_level := v_current_level;
    v_new_xp := v_current_xp + p_amount;
    v_new_level := v_current_level;

    -- Check for level-ups
    WHILE v_new_xp >= v_xp_to_next AND v_new_level < 50 LOOP
        v_new_xp := v_new_xp - v_xp_to_next;
        v_new_level := v_new_level + 1;
        v_xp_to_next := public.calculate_xp_for_level(v_new_level);
        v_leveled_up := true;
    END LOOP;

    -- Update user XP record
    UPDATE public.user_xp
    SET
        total_xp = v_current_xp + p_amount,
        current_level = v_new_level,
        xp_to_next_level = v_xp_to_next,
        level_title = public.get_level_title(v_new_level),
        updated_at = timezone('utc'::text, now())
    WHERE user_id = p_user_id;

    -- Record transaction
    INSERT INTO public.xp_transactions (user_id, amount, source, description, metadata)
    VALUES (p_user_id, p_amount, p_source, p_description, p_metadata);

    -- Return results
    RETURN QUERY SELECT
        (v_current_xp + p_amount)::INTEGER,
        v_new_level::INTEGER,
        v_leveled_up,
        v_old_level::INTEGER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user's current XP data
CREATE OR REPLACE FUNCTION public.get_user_xp(p_user_id UUID)
RETURNS TABLE(
    total_xp INTEGER,
    current_level INTEGER,
    xp_to_next_level INTEGER,
    level_title TEXT,
    current_level_xp INTEGER
) AS $$
DECLARE
    v_total_xp INTEGER;
    v_current_level INTEGER;
    v_xp_to_next INTEGER;
    v_level_title TEXT;
    v_level_start_xp INTEGER := 0;
    v_level_counter INTEGER := 1;
BEGIN
    -- Get user XP data or create default
    SELECT uxp.total_xp, uxp.current_level, uxp.xp_to_next_level, uxp.level_title
    INTO v_total_xp, v_current_level, v_xp_to_next, v_level_title
    FROM public.user_xp uxp
    WHERE uxp.user_id = p_user_id;

    -- If no record exists, return defaults
    IF NOT FOUND THEN
        RETURN QUERY SELECT 0, 1, 100, 'Beginner'::TEXT, 0;
        RETURN;
    END IF;

    -- Calculate XP within current level
    -- Sum XP needed for all previous levels
    WHILE v_level_counter < v_current_level LOOP
        v_level_start_xp := v_level_start_xp + public.calculate_xp_for_level(v_level_counter);
        v_level_counter := v_level_counter + 1;
    END LOOP;

    RETURN QUERY SELECT
        v_total_xp,
        v_current_level,
        v_xp_to_next,
        v_level_title,
        (v_total_xp - v_level_start_xp)::INTEGER; -- XP progress within current level
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_user_xp_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_xp_timestamp
    BEFORE UPDATE ON public.user_xp
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_xp_timestamp();

-- Seed initial XP for existing users (optional - runs once)
INSERT INTO public.user_xp (user_id, total_xp, current_level, xp_to_next_level, level_title)
SELECT
    id,
    0,
    1,
    public.calculate_xp_for_level(1),
    public.get_level_title(1)
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_level_title(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_xp_for_level(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.award_xp(UUID, INTEGER, TEXT, TEXT, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_xp(UUID) TO authenticated;
