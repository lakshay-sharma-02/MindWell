-- Create stories table
create table public.stories (
  id uuid not null default gen_random_uuid(),
  name text null,
  title text not null,
  content text not null,
  is_anonymous boolean default false,
  approved boolean default false,
  created_at timestamptz default now(),
  constraint stories_pkey primary key (id)
);

-- Create comments table
create table public.comments (
  id uuid not null default gen_random_uuid(),
  post_id uuid not null,
  post_type text not null check (post_type in ('blog', 'podcast')),
  author_name text not null,
  content text not null,
  approved boolean default true,
  created_at timestamptz default now(),
  constraint comments_pkey primary key (id)
);

-- Enable RLS
alter table public.stories enable row level security;
alter table public.comments enable row level security;

-- Policies for stories
create policy "Public can view approved stories" 
  on public.stories for select 
  using (approved = true);

create policy "Public can insert stories" 
  on public.stories for insert 
  with check (true);

create policy "Admins can view all stories" 
  on public.stories for select 
  using (auth.uid() in (select user_id from public.user_roles where role = 'admin'));

create policy "Admins can update stories" 
  on public.stories for update 
  using (auth.uid() in (select user_id from public.user_roles where role = 'admin'));

create policy "Admins can delete stories" 
  on public.stories for delete 
  using (auth.uid() in (select user_id from public.user_roles where role = 'admin'));


-- Policies for comments
create policy "Public can view comments" 
  on public.comments for select 
  using (true);

create policy "Public can insert comments" 
  on public.comments for insert 
  with check (true);

create policy "Admins can delete comments" 
  on public.comments for delete 
  using (auth.uid() in (select user_id from public.user_roles where role = 'admin'));
