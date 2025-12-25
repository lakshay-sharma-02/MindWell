-- Function to get admin dashboard stats safely
create or replace function public.get_admin_stats()
returns json
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  total_users integer;
  total_blogs integer;
  total_resources integer;
  pending_stories integer;
begin
  -- Check permission
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  ) and not exists (
    select 1 from auth.users u
    where u.id = auth.uid() and lower(u.email) = 'sharmalakshay0208@gmail.com'
  ) then
    raise exception 'Access denied';
  end if;
  
  select count(*) into total_users from auth.users;
  select count(*) into total_blogs from public.blogs;
  select count(*) into total_resources from public.resources;
  select count(*) into pending_stories from public.stories where approved = false;
  
  return json_build_object(
    'total_users', total_users,
    'total_blogs', total_blogs,
    'total_resources', total_resources,
    'pending_stories', pending_stories
  );
end;
$$;

-- Drop existing function to allow return type change
drop function if exists public.get_admin_users_list();

-- RPC to fetch users list with emails and ban status (restricted to admins)
create or replace function public.get_admin_users_list()
returns table (
  id uuid,
  email varchar(255),
  full_name text,
  created_at timestamptz,
  banned_until timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Check permission
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  ) and not exists (
    select 1 from auth.users u
    where u.id = auth.uid() and lower(u.email) = 'sharmalakshay0208@gmail.com'
  ) then
    raise exception 'Access denied';
  end if;

  return query
  select 
    au.id,
    cast(au.email as varchar(255)),
    coalesce(p.full_name, 'No Profile'),
    au.created_at,
    au.banned_until
  from auth.users au
  left join public.profiles p on p.id = au.id
  order by au.created_at desc;
end;
$$;

-- RPC to DELETE a user (Permanent)
create or replace function public.admin_delete_user(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  -- Check permission
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  ) and not exists (
    select 1 from auth.users u
    where u.id = auth.uid() and lower(u.email) = 'sharmalakshay0208@gmail.com'
  ) then
    raise exception 'Access denied';
  end if;

  -- Prevent self-deletion
  if target_user_id = auth.uid() then
    raise exception 'Cannot delete yourself';
  end if;

  delete from auth.users where id = target_user_id;
end;
$$;

-- RPC to BAN/UNBAN a user
create or replace function public.admin_toggle_ban_user(target_user_id uuid)
returns boolean -- returns true if banned, false if unbanned
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  is_banned boolean;
  target_email text;
begin
  -- Check permission
  if not exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'admin'
  ) and not exists (
    select 1 from auth.users u
    where u.id = auth.uid() and lower(u.email) = 'sharmalakshay0208@gmail.com'
  ) then
    raise exception 'Access denied';
  end if;

   -- Prevent self-ban
  if target_user_id = auth.uid() then
    raise exception 'Cannot ban yourself';
  end if;

  select banned_until, email into is_banned, target_email 
  from auth.users where id = target_user_id;
  
  -- If currently banned (future date), unban (set null). Else ban (set year 3000).
  if is_banned is not null and is_banned > now() then
     update auth.users set banned_until = null where id = target_user_id;
     return false;
  else
     update auth.users set banned_until = '3000-01-01 00:00:00+00' where id = target_user_id;
     return true;
  end if;
end;
$$;

-- Ensure grants
grant execute on function public.get_admin_users_list to authenticated;
grant execute on function public.get_admin_stats to authenticated;
grant execute on function public.admin_delete_user to authenticated;
grant execute on function public.admin_toggle_ban_user to authenticated;
