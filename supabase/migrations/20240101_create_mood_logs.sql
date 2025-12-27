
-- Create mood_logs table
CREATE TABLE IF NOT EXISTS public.mood_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    mood TEXT NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- Create Policy: Users can insert their own mood logs
CREATE POLICY "Users can insert their own mood logs"
    ON public.mood_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create Policy: Users can view their own mood logs
CREATE POLICY "Users can view their own mood logs"
    ON public.mood_logs
    FOR SELECT
    USING (auth.uid() = user_id);
