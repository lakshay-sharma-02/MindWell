-- Phase 1 Engagement Features Migration
-- Daily Check-ins, Rewards, and AI Companion Memory

-- Daily Check-ins Table
CREATE TABLE IF NOT EXISTS public.daily_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    checkin_type TEXT CHECK (checkin_type IN ('morning', 'evening')) NOT NULL,

    -- Morning fields
    sleep_quality TEXT,
    intention TEXT,
    mood TEXT,

    -- Evening fields
    day_rating INTEGER CHECK (day_rating >= 1 AND day_rating <= 10),
    what_went_well TEXT,
    tomorrow_focus TEXT,

    -- AI insights
    ai_insight TEXT,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Ensure one morning and one evening per day per user
    UNIQUE(user_id, checkin_type, DATE(created_at))
);

-- Daily Rewards Table
CREATE TABLE IF NOT EXISTS public.daily_rewards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    reward_type TEXT NOT NULL, -- affirmation, badge, unlock, hug, quote, premium_tool
    reward_data JSONB, -- stores specific reward details
    rarity TEXT CHECK (rarity IN ('common', 'rare', 'legendary')) NOT NULL,
    claimed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- One reward per day per user
    UNIQUE(user_id, DATE(claimed_at))
);

-- Companion Memory Table (stores key insights about user)
CREATE TABLE IF NOT EXISTS public.companion_memory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    memory_type TEXT NOT NULL, -- pattern, preference, concern, milestone
    memory_key TEXT NOT NULL, -- e.g., 'work_stress', 'sleep_issues'
    memory_value TEXT NOT NULL,
    confidence NUMERIC DEFAULT 0.8, -- AI confidence in this memory
    last_referenced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    UNIQUE(user_id, memory_key)
);

-- Proactive Messages Queue (for AI companion to send)
CREATE TABLE IF NOT EXISTS public.proactive_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT NOT NULL, -- check_in, encouragement, concern, celebration
    priority INTEGER DEFAULT 5, -- 1-10, higher = more urgent
    delivered BOOLEAN DEFAULT false,
    delivered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add companion settings to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS companion_name TEXT DEFAULT 'Luna',
ADD COLUMN IF NOT EXISTS companion_avatar TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS morning_checkin_time TIME DEFAULT '08:00:00',
ADD COLUMN IF NOT EXISTS evening_checkin_time TIME DEFAULT '20:00:00',
ADD COLUMN IF NOT EXISTS checkin_notifications BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Enable RLS
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companion_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proactive_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Daily Check-ins
CREATE POLICY "Users can insert their own check-ins" ON public.daily_checkins
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own check-ins" ON public.daily_checkins
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own check-ins" ON public.daily_checkins
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Daily Rewards
CREATE POLICY "Users can insert their own rewards" ON public.daily_rewards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own rewards" ON public.daily_rewards
    FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for Companion Memory
CREATE POLICY "Users can view their own memories" ON public.companion_memory
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memories" ON public.companion_memory
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memories" ON public.companion_memory
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for Proactive Messages
CREATE POLICY "Users can view their own messages" ON public.proactive_messages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages" ON public.proactive_messages
    FOR UPDATE USING (auth.uid() = user_id);

-- Function to check if user has completed today's check-in
CREATE OR REPLACE FUNCTION public.has_completed_checkin_today(
    p_user_id UUID,
    p_checkin_type TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.daily_checkins
        WHERE user_id = p_user_id
        AND checkin_type = p_checkin_type
        AND DATE(created_at) = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has claimed today's reward
CREATE OR REPLACE FUNCTION public.has_claimed_reward_today(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.daily_rewards
        WHERE user_id = p_user_id
        AND DATE(claimed_at) = CURRENT_DATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update last active timestamp
CREATE OR REPLACE FUNCTION public.update_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET last_active_at = timezone('utc'::text, now())
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers to update last_active_at
CREATE TRIGGER update_last_active_on_checkin
    AFTER INSERT ON public.daily_checkins
    FOR EACH ROW EXECUTE FUNCTION public.update_last_active();

CREATE TRIGGER update_last_active_on_mood
    AFTER INSERT ON public.mood_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_last_active();

-- Function to generate proactive messages based on inactivity
CREATE OR REPLACE FUNCTION public.generate_proactive_messages()
RETURNS void AS $$
DECLARE
    inactive_user RECORD;
BEGIN
    -- Find users inactive for 3+ days
    FOR inactive_user IN
        SELECT id, companion_name, last_active_at
        FROM public.profiles
        WHERE last_active_at < (NOW() - INTERVAL '3 days')
        AND checkin_notifications = true
        AND NOT EXISTS (
            SELECT 1 FROM public.proactive_messages
            WHERE user_id = profiles.id
            AND delivered = false
            AND created_at > (NOW() - INTERVAL '1 day')
        )
    LOOP
        INSERT INTO public.proactive_messages (user_id, message, message_type, priority)
        VALUES (
            inactive_user.id,
            'Hey! I noticed you''ve been quiet for a few days. Everything okay? I''m here if you want to talk. 💙',
            'concern',
            8
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON public.daily_checkins(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_rewards_user_date ON public.daily_rewards(user_id, claimed_at DESC);
CREATE INDEX IF NOT EXISTS idx_companion_memory_user ON public.companion_memory(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_proactive_messages_undelivered ON public.proactive_messages(user_id, delivered, priority DESC) WHERE delivered = false;
CREATE INDEX IF NOT EXISTS idx_profiles_last_active ON public.profiles(last_active_at);
