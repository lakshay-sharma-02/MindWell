-- FIX: Drop the policy causing 500 Error (Infinite Recursion)
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;

-- 1. Create a secure function to check admin status
-- SECURITY DEFINER allows this function to bypass RLS, breaking the recursion loop
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Basic Policy: Users can see their OWN role (No recursion, direct check)
CREATE POLICY "Users can read own role" ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- 3. Admin Policy: Admins can see ALL roles (Uses the safe function)
CREATE POLICY "Admins can view all roles" ON public.user_roles
    FOR SELECT
    USING (public.is_admin());
