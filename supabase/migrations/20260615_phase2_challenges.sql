-- Phase 2: Weekly Challenges System
-- Themed weekly challenges with progress tracking

-- 1. Weekly Challenges Table
CREATE TABLE IF NOT EXISTS public.weekly_challenges (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    challenge_type TEXT NOT NULL CHECK (challenge_type IN ('gratitude', 'mindfulness', 'consistency', 'social', 'breathing', 'mood_tracking')),
    goal_count INTEGER NOT NULL CHECK (goal_count > 0),
    goal_description TEXT NOT NULL, -- e.g., "Log 7 gratitude entries", "Complete 5 breathing sessions"
    icon TEXT DEFAULT '🎯',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reward_xp INTEGER DEFAULT 100,
    reward_badge_key TEXT, -- Optional badge unlock on completion
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    CHECK (end_date > start_date)
);

-- 2. Challenge Progress Table
CREATE TABLE IF NOT EXISTS public.challenge_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    challenge_id UUID REFERENCES public.weekly_challenges(id) ON DELETE CASCADE NOT NULL,
    current_count INTEGER DEFAULT 0 CHECK (current_count >= 0),
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, challenge_id)
);

-- 3. Leaderboard Entries (Opt-in, anonymous)
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    challenge_id UUID REFERENCES public.weekly_challenges(id) ON DELETE CASCADE NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0),
    display_name TEXT NOT NULL, -- Anonymous username like "MindfulUser123"
    is_visible BOOLEAN DEFAULT true, -- User can hide their entry
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, challenge_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_weekly_challenges_active ON public.weekly_challenges(is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_id ON public.challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge_id ON public.challenge_progress(challenge_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_challenge_score ON public.leaderboard_entries(challenge_id, score DESC);

-- Enable RLS
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Weekly Challenges (everyone can read active challenges)
CREATE POLICY "Anyone can view active challenges" ON public.weekly_challenges
    FOR SELECT USING (is_active = true);

-- RLS Policies for Challenge Progress
CREATE POLICY "Users can view their own progress" ON public.challenge_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.challenge_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.challenge_progress
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Leaderboard (visible entries only)
CREATE POLICY "Anyone can view visible leaderboard entries" ON public.leaderboard_entries
    FOR SELECT USING (is_visible = true);

CREATE POLICY "Users can insert their own leaderboard entry" ON public.leaderboard_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leaderboard entry" ON public.leaderboard_entries
    FOR UPDATE USING (auth.uid() = user_id);

-- Function: Get active challenges
CREATE OR REPLACE FUNCTION public.get_active_challenges()
RETURNS TABLE(
    id UUID,
    title TEXT,
    description TEXT,
    challenge_type TEXT,
    goal_count INTEGER,
    goal_description TEXT,
    icon TEXT,
    start_date DATE,
    end_date DATE,
    reward_xp INTEGER,
    days_remaining INTEGER,
    total_participants BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        wc.id,
        wc.title,
        wc.description,
        wc.challenge_type,
        wc.goal_count,
        wc.goal_description,
        wc.icon,
        wc.start_date,
        wc.end_date,
        wc.reward_xp,
        (wc.end_date - CURRENT_DATE)::INTEGER AS days_remaining,
        COUNT(DISTINCT cp.user_id) AS total_participants
    FROM public.weekly_challenges wc
    LEFT JOIN public.challenge_progress cp ON wc.id = cp.challenge_id
    WHERE wc.is_active = true
        AND wc.start_date <= CURRENT_DATE
        AND wc.end_date >= CURRENT_DATE
    GROUP BY wc.id
    ORDER BY wc.start_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Increment challenge progress
CREATE OR REPLACE FUNCTION public.increment_challenge_progress(
    p_user_id UUID,
    p_challenge_type TEXT
)
RETURNS TABLE(
    challenge_completed BOOLEAN,
    challenge_title TEXT,
    xp_awarded INTEGER
) AS $$
DECLARE
    v_challenge_id UUID;
    v_challenge_title TEXT;
    v_goal_count INTEGER;
    v_reward_xp INTEGER;
    v_reward_badge TEXT;
    v_current_count INTEGER;
    v_new_count INTEGER;
    v_completed BOOLEAN := false;
BEGIN
    -- Find active challenge of this type
    SELECT id, title, goal_count, reward_xp, reward_badge_key
    INTO v_challenge_id, v_challenge_title, v_goal_count, v_reward_xp, v_reward_badge
    FROM public.weekly_challenges
    WHERE challenge_type = p_challenge_type
        AND is_active = true
        AND start_date <= CURRENT_DATE
        AND end_date >= CURRENT_DATE
    LIMIT 1;

    -- If no active challenge, return
    IF v_challenge_id IS NULL THEN
        RETURN QUERY SELECT false, ''::TEXT, 0;
        RETURN;
    END IF;

    -- Initialize or get progress
    INSERT INTO public.challenge_progress (user_id, challenge_id, current_count)
    VALUES (p_user_id, v_challenge_id, 0)
    ON CONFLICT (user_id, challenge_id) DO NOTHING;

    -- Get current progress
    SELECT current_count INTO v_current_count
    FROM public.challenge_progress
    WHERE user_id = p_user_id AND challenge_id = v_challenge_id;

    v_new_count := v_current_count + 1;

    -- Update progress
    UPDATE public.challenge_progress
    SET
        current_count = v_new_count,
        last_activity_at = timezone('utc'::text, now()),
        completed = (v_new_count >= v_goal_count),
        completed_at = CASE WHEN v_new_count >= v_goal_count THEN timezone('utc'::text, now()) ELSE completed_at END
    WHERE user_id = p_user_id AND challenge_id = v_challenge_id;

    -- Check if just completed
    IF v_new_count >= v_goal_count AND v_current_count < v_goal_count THEN
        v_completed := true;

        -- Award XP
        PERFORM public.award_xp(
            p_user_id,
            v_reward_xp,
            'challenge_complete',
            'Completed challenge: ' || v_challenge_title
        );

        -- Unlock badge if specified
        IF v_reward_badge IS NOT NULL THEN
            PERFORM public.unlock_badge(p_user_id, v_reward_badge);
        END IF;
    END IF;

    RETURN QUERY SELECT v_completed, v_challenge_title, CASE WHEN v_completed THEN v_reward_xp ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get user's challenge progress
CREATE OR REPLACE FUNCTION public.get_user_challenge_progress(p_user_id UUID)
RETURNS TABLE(
    challenge_id UUID,
    challenge_title TEXT,
    challenge_description TEXT,
    challenge_type TEXT,
    goal_count INTEGER,
    goal_description TEXT,
    icon TEXT,
    current_count INTEGER,
    progress_percentage INTEGER,
    completed BOOLEAN,
    days_remaining INTEGER,
    reward_xp INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        wc.id,
        wc.title,
        wc.description,
        wc.challenge_type,
        wc.goal_count,
        wc.goal_description,
        wc.icon,
        COALESCE(cp.current_count, 0)::INTEGER,
        LEAST(100, (COALESCE(cp.current_count, 0)::FLOAT / wc.goal_count * 100)::INTEGER),
        COALESCE(cp.completed, false),
        (wc.end_date - CURRENT_DATE)::INTEGER,
        wc.reward_xp
    FROM public.weekly_challenges wc
    LEFT JOIN public.challenge_progress cp ON wc.id = cp.challenge_id AND cp.user_id = p_user_id
    WHERE wc.is_active = true
        AND wc.start_date <= CURRENT_DATE
        AND wc.end_date >= CURRENT_DATE
    ORDER BY wc.start_date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Get leaderboard for a challenge
CREATE OR REPLACE FUNCTION public.get_challenge_leaderboard(
    p_challenge_id UUID,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
    rank BIGINT,
    display_name TEXT,
    score INTEGER,
    is_current_user BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        ROW_NUMBER() OVER (ORDER BY le.score DESC) AS rank,
        le.display_name,
        le.score,
        (le.user_id = auth.uid()) AS is_current_user
    FROM public.leaderboard_entries le
    WHERE le.challenge_id = p_challenge_id
        AND le.is_visible = true
    ORDER BY le.score DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Seed first weekly challenge (Gratitude Week)
INSERT INTO public.weekly_challenges (
    title,
    description,
    challenge_type,
    goal_count,
    goal_description,
    icon,
    start_date,
    end_date,
    reward_xp,
    is_active
) VALUES (
    'Gratitude Week Challenge',
    'Practice gratitude every day this week and cultivate a positive mindset. Write 7 gratitude entries to complete this challenge.',
    'gratitude',
    7,
    'Log 7 gratitude entries',
    '💚',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days',
    200,
    true
) ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_active_challenges() TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_challenge_progress(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_challenge_progress(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_challenge_leaderboard(UUID, INTEGER) TO authenticated;
