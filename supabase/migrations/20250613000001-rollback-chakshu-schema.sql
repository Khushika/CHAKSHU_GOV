-- Rollback migration for Chakshu schema
-- Run this if you need to completely reset the database schema

-- Drop views first
DROP VIEW IF EXISTS public.user_stats;
DROP VIEW IF EXISTS public.comment_details;
DROP VIEW IF EXISTS public.post_details;

-- Drop triggers
DROP TRIGGER IF EXISTS update_bookmark_stats_trigger ON public.community_bookmarks;
DROP TRIGGER IF EXISTS update_like_stats_trigger ON public.community_likes;
DROP TRIGGER IF EXISTS update_comment_stats_trigger ON public.community_comments;
DROP TRIGGER IF EXISTS update_post_stats_trigger ON public.community_posts;
DROP TRIGGER IF EXISTS update_community_comments_timestamp ON public.community_comments;
DROP TRIGGER IF EXISTS update_community_posts_timestamp ON public.community_posts;
DROP TRIGGER IF EXISTS update_community_categories_timestamp ON public.community_categories;
DROP TRIGGER IF EXISTS update_fraud_reports_timestamp ON public.fraud_reports;
DROP TRIGGER IF EXISTS update_user_profiles_timestamp ON public.user_profiles;
DROP TRIGGER IF EXISTS update_users_timestamp ON public.users;

-- Drop functions
DROP FUNCTION IF EXISTS public.update_bookmark_stats();
DROP FUNCTION IF EXISTS public.update_like_stats();
DROP FUNCTION IF EXISTS public.update_comment_stats();
DROP FUNCTION IF EXISTS public.update_post_stats();
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Drop tables in correct order (reverse foreign key dependencies)
DROP TABLE IF EXISTS public.system_logs;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.community_reports;
DROP TABLE IF EXISTS public.community_follows;
DROP TABLE IF EXISTS public.community_bookmarks;
DROP TABLE IF EXISTS public.community_likes;
DROP TABLE IF EXISTS public.community_comments;
DROP TABLE IF EXISTS public.community_posts;
DROP TABLE IF EXISTS public.community_categories;
DROP TABLE IF EXISTS public.blocked_numbers;
DROP TABLE IF EXISTS public.report_evidence;
DROP TABLE IF EXISTS public.report_actions;
DROP TABLE IF EXISTS public.fraud_reports;
DROP TABLE IF EXISTS public.user_profiles;
DROP TABLE IF EXISTS public.users;

-- Log rollback
DO $$
BEGIN
    RAISE NOTICE 'Chakshu database schema rollback completed!';
    RAISE NOTICE 'All tables, triggers, functions, and views have been dropped.';
END $$;
