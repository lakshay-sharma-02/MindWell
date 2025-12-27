
-- Create gratitude_logs table
CREATE TABLE IF NOT EXISTS public.gratitude_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.gratitude_logs ENABLE ROW LEVEL SECURITY;

-- Create Policy: Users can insert their own gratitude logs
CREATE POLICY "Users can insert their own gratitude logs"
    ON public.gratitude_logs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create Policy: Users can view their own gratitude logs
CREATE POLICY "Users can view their own gratitude logs"
    ON public.gratitude_logs
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create Policy: Users can delete their own gratitude logs
CREATE POLICY "Users can delete their own gratitude logs"
    ON public.gratitude_logs
    FOR DELETE
    USING (auth.uid() = user_id);
