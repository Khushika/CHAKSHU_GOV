-- Quick fix to add missing INSERT policy for users table
-- Run this in Supabase SQL Editor if user creation is failing

-- Add INSERT policy for users to create their own records
CREATE POLICY "Users can create their own profile" ON public.users
    FOR INSERT WITH CHECK (
        auth.uid()::text = id::text
    );

-- Alternative: If the above doesn't work, you can temporarily disable RLS for user creation
-- (Not recommended for production, but useful for testing)
-- ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
-- Remember to re-enable it later:
-- ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
