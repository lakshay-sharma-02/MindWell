-- Fix missing RLS policy for user_roles table
-- Required for the application to check if a user is an admin

-- Allow users to view their own role
CREATE POLICY "Users can read own role" ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Start a transaction to ensure we can create this recursively if valid
-- Allow admins to view all roles (useful for User Management in Admin Panel)
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );
