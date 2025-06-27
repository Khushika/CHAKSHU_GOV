# 🚨 Quick Database Fix for Infinite Recursion Error

If you're seeing the error **"infinite recursion detected in policy for relation 'users'"**, here's how to fix it immediately:

## Steps to Fix:

### 1. Open Supabase Dashboard

Go to [supabase.com/dashboard](https://supabase.com/dashboard) and select your project.

### 2. Open SQL Editor

Navigate to the SQL Editor section in your project.

### 3. Run This SQL Code

Copy and paste the following SQL code and click "Run":

```sql
-- Quick fix for infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)
RETURNS boolean AS $$
SELECT COALESCE((SELECT user_role IN ('admin', 'moderator') FROM public.users WHERE id = user_id), false);
$$ LANGUAGE sql STABLE SECURITY DEFINER;

DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;

CREATE POLICY "Users can view their own profile" ON public.users
FOR SELECT USING (auth.uid()::text = id::text OR public.is_admin_user(auth.uid()));

CREATE POLICY "Admins can manage all users" ON public.users
FOR ALL USING (public.is_admin_user(auth.uid()));

GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;
```

### 4. Test the Fix

- Refresh your application page
- Try submitting a fraud report
- If you still see errors, check the console for more details

## What This Fixes:

- Removes circular references in Row-Level Security policies
- Creates a security definer function to safely check user roles
- Allows normal database operations to proceed

## Need Help?

If this doesn't work or you need assistance:

1. Check the console (F12) for more detailed error messages
2. Contact your database administrator
3. Review the full migration file at `supabase/migrations/20250614000000-fix-rls-infinite-recursion.sql`

---

**Note**: This is a critical database configuration issue that prevents the application from working correctly. The fix is safe and only updates the security policies to prevent infinite recursion.
