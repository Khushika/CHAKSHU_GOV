-- Complete Chakshu Fraud Reporting Platform Database Schema
-- This migration creates the complete database schema including community forum features
-- Run this in Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- CORE TABLES
-- =============================================

-- 1. USERS TABLE (Enhanced user management)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    user_role TEXT DEFAULT 'citizen' CHECK (user_role IN ('citizen', 'admin', 'moderator')),
    is_verified BOOLEAN DEFAULT false,
    is_banned BOOLEAN DEFAULT false,
    last_active TIMESTAMPTZ DEFAULT now()
);

-- 2. USER_PROFILES TABLE (Extended user information)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    date_of_birth DATE,
    gender TEXT,
    occupation TEXT,
    bio TEXT,
    location JSONB DEFAULT '{}',
    profile_picture_url TEXT,
    cover_image_url TEXT,
    language_preference TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    profile_completed BOOLEAN DEFAULT false,
    reputation_score INTEGER DEFAULT 0,
    total_posts INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    total_likes_received INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- FRAUD REPORTING TABLES
-- =============================================

-- 3. FRAUD_REPORTS TABLE (Core reporting functionality)
CREATE TABLE IF NOT EXISTS public.fraud_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN ('call', 'sms', 'whatsapp', 'email', 'other')),
    fraudulent_number TEXT NOT NULL,
    incident_date DATE NOT NULL,
    incident_time TIME,
    description TEXT NOT NULL,
    fraud_category TEXT NOT NULL CHECK (fraud_category IN ('financial_fraud', 'impersonation', 'lottery_scam', 'investment_fraud', 'job_fraud', 'romance_scam', 'tech_support_scam', 'other')),
    evidence_urls TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'verified', 'rejected', 'resolved')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    amount_involved DECIMAL(15,2),
    location_info JSONB DEFAULT '{}',
    additional_details TEXT,
    is_public BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. REPORT_ACTIONS TABLE (Admin actions and audit trail)
CREATE TABLE IF NOT EXISTS public.report_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.fraud_reports(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.users(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('status_change', 'comment', 'escalation', 'resolution', 'investigation')),
    action_description TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. REPORT_EVIDENCE TABLE (File attachments and evidence)
CREATE TABLE IF NOT EXISTS public.report_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.fraud_reports(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_type TEXT,
    mime_type TEXT,
    uploaded_by UUID REFERENCES public.users(id),
    description TEXT,
    is_verified BOOLEAN DEFAULT false,
    uploaded_at TIMESTAMPTZ DEFAULT now()
);

-- 6. BLOCKED_NUMBERS TABLE (Track blocked/flagged numbers)
CREATE TABLE IF NOT EXISTS public.blocked_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    block_reason TEXT NOT NULL,
    blocked_by UUID REFERENCES public.users(id),
    report_count INTEGER DEFAULT 1,
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    first_reported TIMESTAMPTZ DEFAULT now(),
    last_reported TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- =============================================
-- COMMUNITY FORUM TABLES
-- =============================================

-- 7. COMMUNITY_CATEGORIES TABLE (Forum categories)
CREATE TABLE IF NOT EXISTS public.community_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#3B82F6',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    post_count INTEGER DEFAULT 0,
    latest_post_id UUID,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. COMMUNITY_POSTS TABLE (Forum posts/discussions)
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.community_categories(id) ON DELETE SET NULL,
    report_id UUID REFERENCES public.fraud_reports(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    post_type TEXT DEFAULT 'discussion' CHECK (post_type IN ('discussion', 'question', 'warning', 'tip', 'news')),
    tags TEXT[],
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    bookmark_count INTEGER DEFAULT 0,
    last_activity TIMESTAMPTZ DEFAULT now(),
    last_comment_at TIMESTAMPTZ,
    last_comment_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. COMMUNITY_COMMENTS TABLE (Comments on posts)
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    like_count INTEGER DEFAULT 0,
    is_edited BOOLEAN DEFAULT false,
    edited_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. COMMUNITY_LIKES TABLE (Likes for posts and comments)
CREATE TABLE IF NOT EXISTS public.community_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT like_target_check CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR 
        (post_id IS NULL AND comment_id IS NOT NULL)
    ),
    UNIQUE(user_id, post_id),
    UNIQUE(user_id, comment_id)
);

-- 11. COMMUNITY_BOOKMARKS TABLE (User bookmarks)
CREATE TABLE IF NOT EXISTS public.community_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, post_id)
);

-- 12. COMMUNITY_FOLLOWS TABLE (User follows)
CREATE TABLE IF NOT EXISTS public.community_follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- 13. COMMUNITY_REPORTS TABLE (Report inappropriate content)
CREATE TABLE IF NOT EXISTS public.community_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE,
    reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate_content', 'misinformation', 'other')),
    description TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
    reviewed_by UUID REFERENCES public.users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT report_target_check CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR 
        (post_id IS NULL AND comment_id IS NOT NULL)
    )
);

-- =============================================
-- NOTIFICATION AND MESSAGING TABLES
-- =============================================

-- 14. NOTIFICATIONS TABLE (User notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error', 'comment', 'like', 'follow', 'mention')),
    reference_id UUID,
    reference_type TEXT,
    action_url TEXT,
    is_read BOOLEAN DEFAULT false,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. SYSTEM_LOGS TABLE (Application logging)
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id),
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================
-- ADD FOREIGN KEY FOR LATEST POST
-- =============================================

-- Add foreign key constraint for latest_post_id in categories
ALTER TABLE public.community_categories 
ADD CONSTRAINT fk_latest_post 
FOREIGN KEY (latest_post_id) REFERENCES public.community_posts(id) ON DELETE SET NULL;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(user_role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- Fraud report indexes
CREATE INDEX IF NOT EXISTS idx_fraud_reports_user_id ON public.fraud_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_status ON public.fraud_reports(status);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_fraud_category ON public.fraud_reports(fraud_category);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_created_at ON public.fraud_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_fraudulent_number ON public.fraud_reports(fraudulent_number);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_public ON public.fraud_reports(is_public);

-- Community indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category_id ON public.community_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_last_activity ON public.community_posts(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_community_posts_pinned ON public.community_posts(is_pinned);
CREATE INDEX IF NOT EXISTS idx_community_posts_type ON public.community_posts(post_type);

CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_user_id ON public.community_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent ON public.community_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_created_at ON public.community_comments(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_community_likes_user_id ON public.community_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_post_id ON public.community_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_community_likes_comment_id ON public.community_likes(comment_id);

CREATE INDEX IF NOT EXISTS idx_community_bookmarks_user_id ON public.community_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_community_bookmarks_post_id ON public.community_bookmarks(post_id);

CREATE INDEX IF NOT EXISTS idx_community_follows_follower ON public.community_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_community_follows_following ON public.community_follows(following_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_community_posts_title_search ON public.community_posts USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_community_posts_content_search ON public.community_posts USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_fraud_reports_description_search ON public.fraud_reports USING gin(to_tsvector('english', description));

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND user_role IN ('admin')
        )
    );

-- User profile policies
CREATE POLICY "Users can manage their own profile" ON public.user_profiles
    FOR ALL USING (auth.uid()::text = user_id::text);

CREATE POLICY "Anyone can view public profiles" ON public.user_profiles
    FOR SELECT USING (true);

-- Fraud report policies
CREATE POLICY "Users can view their own reports" ON public.fraud_reports
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Anyone can view public reports" ON public.fraud_reports
    FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create their own reports" ON public.fraud_reports
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own reports" ON public.fraud_reports
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can manage all reports" ON public.fraud_reports
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND user_role IN ('admin', 'moderator')
        )
    );

-- Community category policies
CREATE POLICY "Anyone can view categories" ON public.community_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage categories" ON public.community_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND user_role IN ('admin', 'moderator')
        )
    );

-- Community post policies
CREATE POLICY "Anyone can view posts" ON public.community_posts
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.community_posts
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own posts" ON public.community_posts
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own posts" ON public.community_posts
    FOR DELETE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Moderators can manage all posts" ON public.community_posts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND user_role IN ('admin', 'moderator')
        )
    );

-- Community comment policies
CREATE POLICY "Anyone can view comments" ON public.community_comments
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.community_comments
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own comments" ON public.community_comments
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own comments" ON public.community_comments
    FOR DELETE USING (auth.uid()::text = user_id::text);

-- Community like policies
CREATE POLICY "Anyone can view likes" ON public.community_likes
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage their likes" ON public.community_likes
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Community bookmark policies
CREATE POLICY "Users can manage their own bookmarks" ON public.community_bookmarks
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Community follow policies
CREATE POLICY "Users can manage their own follows" ON public.community_follows
    FOR ALL USING (auth.uid()::text = follower_id::text);

CREATE POLICY "Anyone can view follows" ON public.community_follows
    FOR SELECT USING (true);

-- Notification policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- =============================================
-- DATABASE FUNCTIONS AND TRIGGERS
-- =============================================

-- 1. Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp triggers
CREATE TRIGGER update_users_timestamp 
    BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_timestamp 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fraud_reports_timestamp 
    BEFORE UPDATE ON public.fraud_reports 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_categories_timestamp 
    BEFORE UPDATE ON public.community_categories 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_timestamp 
    BEFORE UPDATE ON public.community_posts 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_comments_timestamp 
    BEFORE UPDATE ON public.community_comments 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Update post counts and stats functions
CREATE OR REPLACE FUNCTION public.update_post_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update category post count
        UPDATE public.community_categories 
        SET post_count = post_count + 1,
            latest_post_id = NEW.id,
            updated_at = NOW()
        WHERE id = NEW.category_id;
        
        -- Update user total posts
        UPDATE public.user_profiles 
        SET total_posts = total_posts + 1,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update category post count
        UPDATE public.community_categories 
        SET post_count = post_count - 1,
            updated_at = NOW()
        WHERE id = OLD.category_id;
        
        -- Update user total posts
        UPDATE public.user_profiles 
        SET total_posts = total_posts - 1,
            updated_at = NOW()
        WHERE user_id = OLD.user_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_post_stats_trigger
    AFTER INSERT OR DELETE ON public.community_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_post_stats();

-- 3. Update comment counts function
CREATE OR REPLACE FUNCTION public.update_comment_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Update post comment count and last activity
        UPDATE public.community_posts 
        SET comment_count = comment_count + 1,
            last_activity = NOW(),
            last_comment_at = NOW(),
            last_comment_by = NEW.user_id
        WHERE id = NEW.post_id;
        
        -- Update user total comments
        UPDATE public.user_profiles 
        SET total_comments = total_comments + 1,
            updated_at = NOW()
        WHERE user_id = NEW.user_id;
        
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        -- Update post comment count
        UPDATE public.community_posts 
        SET comment_count = comment_count - 1
        WHERE id = OLD.post_id;
        
        -- Update user total comments
        UPDATE public.user_profiles 
        SET total_comments = total_comments - 1,
            updated_at = NOW()
        WHERE user_id = OLD.user_id;
        
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_comment_stats_trigger
    AFTER INSERT OR DELETE ON public.community_comments
    FOR EACH ROW EXECUTE FUNCTION public.update_comment_stats();

-- 4. Update like counts function
CREATE OR REPLACE FUNCTION public.update_like_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.post_id IS NOT NULL THEN
            -- Update post like count
            UPDATE public.community_posts 
            SET like_count = like_count + 1
            WHERE id = NEW.post_id;
            
            -- Update post author's likes received
            UPDATE public.user_profiles 
            SET total_likes_received = total_likes_received + 1,
                reputation_score = reputation_score + 1
            WHERE user_id = (SELECT user_id FROM public.community_posts WHERE id = NEW.post_id);
        ELSIF NEW.comment_id IS NOT NULL THEN
            -- Update comment like count
            UPDATE public.community_comments 
            SET like_count = like_count + 1
            WHERE id = NEW.comment_id;
            
            -- Update comment author's likes received
            UPDATE public.user_profiles 
            SET total_likes_received = total_likes_received + 1,
                reputation_score = reputation_score + 1
            WHERE user_id = (SELECT user_id FROM public.community_comments WHERE id = NEW.comment_id);
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.post_id IS NOT NULL THEN
            -- Update post like count
            UPDATE public.community_posts 
            SET like_count = like_count - 1
            WHERE id = OLD.post_id;
            
            -- Update post author's likes received
            UPDATE public.user_profiles 
            SET total_likes_received = total_likes_received - 1,
                reputation_score = reputation_score - 1
            WHERE user_id = (SELECT user_id FROM public.community_posts WHERE id = OLD.post_id);
        ELSIF OLD.comment_id IS NOT NULL THEN
            -- Update comment like count
            UPDATE public.community_comments 
            SET like_count = like_count - 1
            WHERE id = OLD.comment_id;
            
            -- Update comment author's likes received
            UPDATE public.user_profiles 
            SET total_likes_received = total_likes_received - 1,
                reputation_score = reputation_score - 1
            WHERE user_id = (SELECT user_id FROM public.community_comments WHERE id = OLD.comment_id);
        END IF;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_like_stats_trigger
    AFTER INSERT OR DELETE ON public.community_likes
    FOR EACH ROW EXECUTE FUNCTION public.update_like_stats();

-- 5. Update bookmark counts function
CREATE OR REPLACE FUNCTION public.update_bookmark_stats()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.community_posts 
        SET bookmark_count = bookmark_count + 1
        WHERE id = NEW.post_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.community_posts 
        SET bookmark_count = bookmark_count - 1
        WHERE id = OLD.post_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookmark_stats_trigger
    AFTER INSERT OR DELETE ON public.community_bookmarks
    FOR EACH ROW EXECUTE FUNCTION public.update_bookmark_stats();

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert default community categories
INSERT INTO public.community_categories (name, description, icon, color, sort_order) VALUES
('General Discussion', 'General fraud awareness and discussion', 'MessageCircle', '#3B82F6', 1),
('Fraud Alerts', 'Latest fraud alerts and warnings', 'AlertTriangle', '#EF4444', 2),
('Tips & Advice', 'Share tips to prevent fraud', 'Lightbulb', '#10B981', 3),
('Success Stories', 'Share how you avoided or reported fraud', 'Trophy', '#F59E0B', 4),
('Questions & Help', 'Ask questions and get help', 'HelpCircle', '#8B5CF6', 5),
('News & Updates', 'Latest news about fraud prevention', 'Newspaper', '#06B6D4', 6)
ON CONFLICT (name) DO NOTHING;

-- =============================================
-- USEFUL VIEWS
-- =============================================

-- View for post details with user info
CREATE OR REPLACE VIEW public.post_details AS
SELECT 
    p.*,
    u.full_name as author_name,
    up.profile_picture_url as author_avatar,
    up.reputation_score as author_reputation,
    c.name as category_name,
    c.color as category_color
FROM public.community_posts p
LEFT JOIN public.users u ON p.user_id = u.id
LEFT JOIN public.user_profiles up ON u.id = up.user_id
LEFT JOIN public.community_categories c ON p.category_id = c.id;

-- View for comment details with user info
CREATE OR REPLACE VIEW public.comment_details AS
SELECT 
    c.*,
    u.full_name as author_name,
    up.profile_picture_url as author_avatar,
    up.reputation_score as author_reputation
FROM public.community_comments c
LEFT JOIN public.users u ON c.user_id = u.id
LEFT JOIN public.user_profiles up ON u.id = up.user_id;

-- View for user stats
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
    u.id,
    u.full_name,
    u.email,
    up.reputation_score,
    up.total_posts,
    up.total_comments,
    up.total_likes_received,
    (SELECT COUNT(*) FROM public.community_follows WHERE following_id = u.id) as followers_count,
    (SELECT COUNT(*) FROM public.community_follows WHERE follower_id = u.id) as following_count,
    u.created_at
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================

-- Log successful migration
INSERT INTO public.system_logs (action, resource_type, metadata) VALUES 
('database_migration', 'schema', '{"version": "20250613000000", "description": "Complete Chakshu schema with community forum"}');

-- Show completion message
DO $$
BEGIN
    RAISE NOTICE 'Chakshu database schema migration completed successfully!';
    RAISE NOTICE 'Created tables: users, user_profiles, fraud_reports, report_actions, report_evidence, blocked_numbers';
    RAISE NOTICE 'Community tables: categories, posts, comments, likes, bookmarks, follows, reports';
    RAISE NOTICE 'Support tables: notifications, system_logs';
    RAISE NOTICE 'Added indexes, RLS policies, triggers, and initial data';
END $$;
