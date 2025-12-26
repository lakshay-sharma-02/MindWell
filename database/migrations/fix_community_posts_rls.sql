-- Allow Admins to UPDATE (Publish/Answer) posts
create policy "Admins can update posts" on public.community_posts
  for update using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );

-- Allow Admins to DELETE posts
create policy "Admins can delete posts" on public.community_posts
  for delete using (
    exists (
      select 1 from public.user_roles
      where user_id = auth.uid()
      and role = 'admin'
    )
  );
