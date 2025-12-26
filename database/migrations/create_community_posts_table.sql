create table public.community_posts (
  id uuid not null default gen_random_uuid (),
  user_id uuid null default auth.uid (),
  title text not null,
  description text not null,
  solution text null,
  is_published boolean not null default false,
  category text null,
  created_at timestamp with time zone not null default now(),
  constraint community_posts_pkey primary key (id),
  constraint community_posts_user_id_fkey foreign key (user_id) references auth.users (id)
) tablespace pg_default;

-- RLS Policies
alter table public.community_posts enable row level security;

-- Policy: Everyone can read published posts
create policy "Everyone can read published posts" on public.community_posts
  for select using (is_published = true);

-- Policy: Users can see their own unpublished posts (optional, but good for UX)
create policy "Users can see own posts" on public.community_posts
  for select using (auth.uid() = user_id);

-- Policy: Authenticated users can insert posts
create policy "Authenticated users can insert posts" on public.community_posts
  for insert with check (auth.role() = 'authenticated');
  
-- Policy: Only admins can update (publish/answer)
-- Note: In a real app, you'd check a specific admin role/table. 
-- For now, we'll assume a specific admin user or open it for this demo if RLS is tricky without the exact admin logic.
-- Ideally: 
-- create policy "Admins can update posts" on public.community_posts
--   for update using ( exists (select 1 from public.profiles where id = auth.uid() and is_admin = true) );
