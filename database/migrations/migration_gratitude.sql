-- Migration to add image_url and prompt_used to gratitude_logs

ALTER TABLE public.gratitude_logs 
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS prompt_used text;
