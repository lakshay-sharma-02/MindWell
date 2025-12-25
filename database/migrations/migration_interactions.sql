-- Create table for storing liked resources
create table public.resource_likes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  resource_id uuid not null references public.resources(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, resource_id)
);

-- Enable RLS
alter table public.resource_likes enable row level security;

-- Policies for resource_likes
create policy "Users can view their own resource likes."
  on public.resource_likes for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own resource likes."
  on public.resource_likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own resource likes."
  on public.resource_likes for delete
  using ( auth.uid() = user_id );
