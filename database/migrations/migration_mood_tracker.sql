-- Migration to add sub_emotion and activities to mood_logs

ALTER TABLE public.mood_logs 
ADD COLUMN IF NOT EXISTS sub_emotion text,
ADD COLUMN IF NOT EXISTS activities text[];

-- Optional: index for faster querying by activities if needed
CREATE INDEX IF NOT EXISTS idx_mood_logs_activities ON public.mood_logs USING GIN (activities);
