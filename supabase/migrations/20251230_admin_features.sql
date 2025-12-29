-- Create site_settings table
create table if not exists public.site_settings (
  key text primary key,
  value jsonb not null,
  description text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for site_settings
alter table public.site_settings enable row level security;

-- Admin can manage site settings
-- Using user_roles table instead of profiles column
create policy "Admins can manage site settings"
  on public.site_settings
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

-- Everyone can read site settings (for public config like site title)
create policy "Public can read site settings"
  on public.site_settings
  for select
  using (true);

-- Create announcements table
create table if not exists public.announcements (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for announcements
alter table public.announcements enable row level security;

-- Admin can manage announcements
create policy "Admins can manage announcements"
  on public.announcements
  for all
  using (
    exists (
      select 1 from public.user_roles
      where user_roles.user_id = auth.uid()
      and user_roles.role = 'admin'
    )
  );

-- Everyone can read active announcements
create policy "Everyone can read active announcements"
  on public.announcements
  for select
  using (is_active = true);

-- Add initial settings
insert into public.site_settings (key, value, description)
values 
  ('global_info', '{"title": "MindWell", "description": "Mental Health & Wellness Platform", "contact_email": "hello@mindwell.com"}'::jsonb, 'Global site information'),
  ('features', '{"registration_enabled": true, "maintenance_mode": false, "blog_comments": true}'::jsonb, 'Feature toggles'),
  ('social_links', '{"twitter": "https://twitter.com/mindwell", "instagram": "https://instagram.com/mindwell", "linkedin": "https://linkedin.com/company/mindwell"}'::jsonb, 'Social media links')
on conflict (key) do nothing;
