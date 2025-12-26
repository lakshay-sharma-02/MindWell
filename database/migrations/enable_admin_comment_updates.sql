-- Enable Admins to update comments
create policy "Admins can update comments" 
  on public.comments for update 
  using (auth.uid() in (select user_id from public.user_roles where role = 'admin'));
