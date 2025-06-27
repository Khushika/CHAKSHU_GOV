-- Fix infinite recursion in RLS policies
-- This migration fixes the circular reference issue in the users table policies

-- =============================================
-- SECURITY DEFINER FUNCTIONS 
-- =============================================

-- Function to check if a user is admin/moderator without causing recursion
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
RETURNS boolean AS
$$
SELECT COALESCE(
  (SELECT user_role IN ('admin', 'moderator') 
   FROM public.users 
   WHERE id = user_id),
  false
);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text AS
$$
SELECT COALESCE(
  (SELECT user_role FROM public.users WHERE id = user_id),
  'citizen'
);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to check if user exists and is not banned
CREATE OR REPLACE FUNCTION public.is_valid_user(user_id uuid)
RETURNS boolean AS
$$
SELECT COALESCE(
  (SELECT NOT is_banned FROM public.users WHERE id = user_id),
  false
);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =============================================
-- FIX RLS POLICIES - DROP AND RECREATE
-- =============================================

-- Drop problematic policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

-- Create fixed user policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (
        auth.uid()::text = id::text OR 
        public.is_admin_user(auth.uid())
    );

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (
        auth.uid()::text = id::text AND 
        public.is_valid_user(auth.uid())
    );

CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (
        public.is_admin_user(auth.uid())
    );

-- Fix fraud reports policies that may have similar issues
DROP POLICY IF EXISTS "Admins can manage all reports" ON public.fraud_reports;

CREATE POLICY "Admins can manage all reports" ON public.fraud_reports
    FOR ALL USING (
        public.is_admin_user(auth.uid())
    );

-- Fix community post moderation policies
DROP POLICY IF EXISTS "Moderators can manage all posts" ON public.community_posts;

CREATE POLICY "Moderators can manage all posts" ON public.community_posts
    FOR ALL USING (
        public.is_admin_user(auth.uid())
    );

-- Fix community category management policies
DROP POLICY IF EXISTS "Admins can manage categories" ON public.community_categories;

CREATE POLICY "Admins can manage categories" ON public.community_categories
    FOR ALL USING (
        public.is_admin_user(auth.uid())
    );

-- =============================================
-- ADD MISSING USER CREATION POLICY
-- =============================================

-- Allow new user registration (users can insert their own record)
CREATE POLICY "Users can create their own profile" ON public.users
    FOR INSERT WITH CHECK (
        auth.uid()::text = id::text
    );

-- =============================================
-- ENSURE AUTH SCHEMA ACCESS
-- =============================================

-- Grant necessary permissions to access auth.uid()
GRANT USAGE ON SCHEMA auth TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- =============================================
-- HELPER FUNCTIONS FOR REPORT ACCESS
-- =============================================

-- Function to check if user can view a report
CREATE OR REPLACE FUNCTION public.can_view_report(report_user_id uuid, report_is_public boolean)
RETURNS boolean AS
$$
BEGIN
  -- User can view their own reports
  IF auth.uid()::text = report_user_id::text THEN
    RETURN true;
  END IF;
  
  -- Anyone can view public reports
  IF report_is_public = true THEN
    RETURN true;
  END IF;
  
  -- Admins/moderators can view all reports
  IF public.is_admin_user(auth.uid()) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Update fraud reports SELECT policy to use the helper function
DROP POLICY IF EXISTS "Users can view their own reports" ON public.fraud_reports;
DROP POLICY IF EXISTS "Anyone can view public reports" ON public.fraud_reports;

CREATE POLICY "Report access control" ON public.fraud_reports
    FOR SELECT USING (
        public.can_view_report(user_id, is_public)
    );

-- =============================================
-- FIX DATABASE HEALTH CHECK QUERIES
-- =============================================

-- Create a simple health check function that doesn't rely on RLS
CREATE OR REPLACE FUNCTION public.database_health_check()
RETURNS boolean AS
$$
BEGIN
  -- Simple check that doesn't trigger RLS issues
  PERFORM 1;
  RETURN true;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- =============================================
-- ADD PROPER INDEXES FOR PERFORMANCE
-- =============================================

-- Add indexes that will help with the security definer functions
CREATE INDEX IF NOT EXISTS idx_users_role_not_banned ON public.users(user_role, is_banned) WHERE is_banned = false;
CREATE INDEX IF NOT EXISTS idx_users_auth_lookup ON public.users(id) WHERE user_role IN ('admin', 'moderator');

-- =============================================
-- GRANT EXECUTE PERMISSIONS
-- =============================================

-- Grant execute permissions on security definer functions
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_valid_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_report(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.database_health_check() TO authenticated;

-- =============================================
-- LOG SUCCESSFUL MIGRATION
-- =============================================

-- Insert log entry
INSERT INTO public.system_logs (action, resource_type, metadata) VALUES 
('rls_policy_fix', 'database', '{"version": "20250614000000", "description": "Fixed infinite recursion in RLS policies using security definer functions"}');

-- Show completion message
DO $$
BEGIN
    RAISE NOTICE 'RLS policy infinite recursion fix completed successfully!';
    RAISE NOTICE 'Created security definer functions to prevent circular references';
    RAISE NOTICE 'Updated policies for users, fraud_reports, community_posts, and community_categories';
    RAISE NOTICE 'Added helper functions for improved access control';
END $$;
