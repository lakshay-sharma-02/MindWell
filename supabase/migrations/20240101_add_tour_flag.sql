-- Add has_seen_tour column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS has_seen_tour BOOLEAN DEFAULT false;

-- Update existing profiles to have it false (though default handles new ones)
UPDATE profiles SET has_seen_tour = false WHERE has_seen_tour IS NULL;
