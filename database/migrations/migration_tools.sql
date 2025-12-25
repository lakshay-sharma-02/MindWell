-- Create mood_logs table
create table public.mood_logs (
  id uuid not null default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mood text not null,
  note text null,
  created_at timestamptz default now(),
  constraint mood_logs_pkey primary key (id)
);

-- Enable RLS
alter table public.mood_logs enable row level security;

-- Policies for mood_logs
create policy "Users can view their own mood logs" 
  on public.mood_logs for select 
  using (auth.uid() = user_id);

create policy "Users can insert their own mood logs" 
  on public.mood_logs for insert 
  with check (auth.uid() = user_id);

create policy "Users can delete their own mood logs" 
  on public.mood_logs for delete 
  using (auth.uid() = user_id);
