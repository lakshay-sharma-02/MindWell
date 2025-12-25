-- Create table for storing liked blogs
create table public.blog_likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  blog_id uuid not null references public.blogs(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, blog_id)
);

-- Create table for storing purchased resources
create table public.purchased_resources (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  transaction_id text,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.blog_likes enable row level security;
alter table public.purchased_resources enable row level security;

-- Policies for blog_likes
create policy "Users can view their own likes."
  on public.blog_likes for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own likes."
  on public.blog_likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own likes."
  on public.blog_likes for delete
  using ( auth.uid() = user_id );

-- Policies for purchased_resources
create policy "Users can view their own purchased resources."
  on public.purchased_resources for select
  using ( auth.uid() = user_id );

-- Purchases should ideally be inserted by server/admin, but for now allow user insert (e.g. after payment confirmation flow)
create policy "Users can insert their own purchases."
  on public.purchased_resources for insert
  with check ( auth.uid() = user_id );
