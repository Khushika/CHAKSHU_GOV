-- Comprehensive Database Schema for Chakshu Portal
-- Fresh start migration - creates all tables with proper relationships

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop existing tables if they exist (fresh start)
DROP TABLE IF EXISTS public.user_activity_log CASCADE;
DROP TABLE IF EXISTS public.user_achievements CASCADE;
DROP TABLE IF EXISTS public.search_history CASCADE;
DROP TABLE IF EXISTS public.support_ticket_messages CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;
DROP TABLE IF EXISTS public.faqs CASCADE;
DROP TABLE IF EXISTS public.user_article_interactions CASCADE;
DROP TABLE IF EXISTS public.education_articles CASCADE;
DROP TABLE IF EXISTS public.user_analytics_preferences CASCADE;
DROP TABLE IF EXISTS public.follow_up_reminders CASCADE;
DROP TABLE IF EXISTS public.report_status_history CASCADE;
DROP TABLE IF EXISTS public.report_evidence CASCADE;
DROP TABLE IF EXISTS public.community_interactions CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.fraud_alerts CASCADE;
DROP TABLE IF EXISTS public.government_advisories CASCADE;
DROP TABLE IF EXISTS public.app_reviews CASCADE;
DROP TABLE IF EXISTS public.analytics_data CASCADE;
DROP TABLE IF EXISTS public.system_config CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.chat_sessions CASCADE;

-- Drop existing ENUM types if they exist
DROP TYPE IF EXISTS public.fraud_type CASCADE;
DROP TYPE IF EXISTS public.report_status CASCADE;
DROP TYPE IF EXISTS public.authority_action CASCADE;
DROP TYPE IF EXISTS public.notification_type CASCADE;
DROP TYPE IF EXISTS public.interaction_type CASCADE;
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.priority_level CASCADE;
DROP TYPE IF EXISTS public.ticket_status CASCADE;

-- Create ENUM types
CREATE TYPE fraud_type AS ENUM (
    'phishing', 'sms_fraud', 'call_fraud', 'email_spam', 
    'investment_scam', 'lottery_scam', 'tech_support_scam', 
    'romance_scam', 'online_shopping_fraud', 'banking_fraud',
    'identity_theft', 'cryptocurrency_scam', 'job_scam', 
    'social_media_fraud', 'fake_website', 'other'
);

CREATE TYPE report_status AS ENUM (
    'pending', 'under_review', 'investigating', 'resolved', 
    'rejected', 'withdrawn', 'escalated'
);

CREATE TYPE authority_action AS ENUM (
    'investigation_started', 'evidence_collected', 'case_forwarded',
    'suspect_identified', 'legal_action_taken', 'case_closed', 
    'no_action_required', 'additional_info_needed'
);

CREATE TYPE notification_type AS ENUM (
    'case_update', 'fraud_warning', 'community_alert', 'system_announcement',
    'security_alert', 'milestone', 'education_reminder', 'report_reminder'
);

CREATE TYPE interaction_type AS ENUM (
    'similar_experience', 'helpful', 'comment', 'follow', 'share', 'support'
);

CREATE TYPE user_role AS ENUM (
    'citizen', 'admin', 'authority', 'moderator', 'investigator'
);

CREATE TYPE priority_level AS ENUM (
    'low', 'medium', 'high', 'critical', 'urgent'
);

CREATE TYPE ticket_status AS ENUM (
    'open', 'in_progress', 'waiting_response', 'resolved', 'closed'
);

-- 1. USER PROFILES TABLE
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT,
    phone_number TEXT,
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    occupation TEXT,
    organization TEXT,
    address JSONB DEFAULT '{}',
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    postal_code TEXT,
    profile_picture_url TEXT,
    bio TEXT,
    language_preference TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    profile_completed BOOLEAN DEFAULT false,
    two_factor_enabled BOOLEAN DEFAULT false,
    notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}',
    privacy_settings JSONB DEFAULT '{"profile_public": false, "show_stats": true}',
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. REPORTS TABLE (Core feature)
CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    report_number TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    fraud_type fraud_type NOT NULL,
    status report_status DEFAULT 'pending',
    priority priority_level DEFAULT 'medium',
    
    -- Incident details
    incident_date TIMESTAMP WITH TIME ZONE,
    amount_involved DECIMAL(15, 2),
    currency TEXT DEFAULT 'INR',
    estimated_loss DECIMAL(15, 2),
    recovery_amount DECIMAL(15, 2),
    
    -- Contact information
    fraudster_contact JSONB DEFAULT '{}', -- phone, email, social media handles
    victim_contact JSONB DEFAULT '{}',    -- if reporting for someone else
    
    -- Location information
    incident_location JSONB DEFAULT '{}',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    
    -- Authority handling
    authority_action authority_action,
    authority_comments TEXT,
    assigned_officer TEXT,
    case_reference_number TEXT,
    
    -- Metadata
    is_anonymous BOOLEAN DEFAULT false,
    is_sensitive BOOLEAN DEFAULT false,
    source TEXT DEFAULT 'web', -- web, mobile, api
    submission_ip INET,
    
    -- Status tracking
    withdrawal_reason TEXT,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. REPORT EVIDENCE TABLE
CREATE TABLE public.report_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT,
    file_size BIGINT,
    file_type TEXT,
    mime_type TEXT,
    description TEXT,
    evidence_type TEXT CHECK (evidence_type IN ('screenshot', 'document', 'audio', 'video', 'image', 'other')),
    
    -- Security and verification
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES auth.users(id),
    verification_notes TEXT,
    hash_signature TEXT,
    
    -- Metadata
    uploaded_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 4. REPORT STATUS HISTORY
CREATE TABLE public.report_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
    previous_status report_status,
    new_status report_status NOT NULL,
    authority_action authority_action,
    comments TEXT,
    changed_by UUID REFERENCES auth.users(id),
    changed_by_role user_role,
    automated_change BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    
    -- Status and priority
    read BOOLEAN DEFAULT false,
    priority priority_level DEFAULT 'medium',
    
    -- Links and actions
    action_url TEXT,
    action_text TEXT,
    image_url TEXT,
    category TEXT,
    
    -- Timing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- 6. COMMUNITY INTERACTIONS TABLE
CREATE TABLE public.community_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    interaction_type interaction_type NOT NULL,
    content TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Privacy and moderation
    is_anonymous BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    is_flagged BOOLEAN DEFAULT false,
    moderation_status TEXT CHECK (moderation_status IN ('pending', 'approved', 'rejected', 'hidden')),
    
    -- Engagement
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    reply_to_id UUID REFERENCES public.community_interactions(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(report_id, user_id, interaction_type)
);

-- 7. USER ANALYTICS PREFERENCES
CREATE TABLE public.user_analytics_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    dashboard_filters JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    privacy_settings JSONB DEFAULT '{}',
    display_preferences JSONB DEFAULT '{}',
    accessibility_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. EDUCATION ARTICLES TABLE
CREATE TABLE public.education_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author_id UUID REFERENCES auth.users(id),
    category TEXT NOT NULL,
    subcategory TEXT,
    tags TEXT[] DEFAULT '{}',
    
    -- Content metadata
    difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    estimated_read_time INTEGER, -- in minutes
    language TEXT DEFAULT 'en',
    
    -- Publishing
    is_published BOOLEAN DEFAULT false,
    is_featured BOOLEAN DEFAULT false,
    featured_order INTEGER,
    
    -- Engagement metrics
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- Media
    cover_image_url TEXT,
    thumbnail_url TEXT,
    
    -- SEO
    meta_title TEXT,
    meta_description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    published_at TIMESTAMP WITH TIME ZONE
);

-- 9. USER ARTICLE INTERACTIONS
CREATE TABLE public.user_article_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    article_id UUID REFERENCES public.education_articles(id) ON DELETE CASCADE NOT NULL,
    interaction_type TEXT CHECK (interaction_type IN ('view', 'like', 'bookmark', 'share', 'complete', 'comment')),
    interaction_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, article_id, interaction_type)
);

-- 10. FAQS TABLE
CREATE TABLE public.faqs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    tags TEXT[] DEFAULT '{}',
    language TEXT DEFAULT 'en',
    
    -- Organization
    priority INTEGER DEFAULT 0,
    display_order INTEGER,
    is_featured BOOLEAN DEFAULT false,
    
    -- Engagement
    view_count INTEGER DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    not_helpful_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    last_updated_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. SUPPORT TICKETS TABLE
CREATE TABLE public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    
    -- Classification
    priority priority_level DEFAULT 'medium',
    status ticket_status DEFAULT 'open',
    category TEXT,
    subcategory TEXT,
    
    -- Assignment
    assigned_to UUID REFERENCES auth.users(id),
    assigned_team TEXT,
    
    -- Resolution
    resolution TEXT,
    resolution_time_minutes INTEGER,
    first_response_time_minutes INTEGER,
    
    -- Satisfaction
    satisfaction_rating INTEGER CHECK (satisfaction_rating >= 1 AND satisfaction_rating <= 5),
    satisfaction_feedback TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    first_response_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- 12. SUPPORT TICKET MESSAGES
CREATE TABLE public.support_ticket_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    message_type TEXT CHECK (message_type IN ('message', 'note', 'system', 'file')) DEFAULT 'message',
    
    -- Visibility
    is_internal BOOLEAN DEFAULT false,
    is_system_message BOOLEAN DEFAULT false,
    
    -- Attachments
    attachments JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 13. USER ACHIEVEMENTS TABLE
CREATE TABLE public.user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_type TEXT NOT NULL,
    achievement_name TEXT NOT NULL,
    achievement_slug TEXT NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 0,
    badge_image_url TEXT,
    requirements_met JSONB DEFAULT '{}',
    progress_data JSONB DEFAULT '{}',
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, achievement_slug)
);

-- 14. FRAUD ALERTS TABLE
CREATE TABLE public.fraud_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    alert_type TEXT CHECK (alert_type IN ('warning', 'critical', 'info', 'advisory')) DEFAULT 'warning',
    
    -- Targeting
    affected_regions TEXT[] DEFAULT '{}',
    fraud_types fraud_type[] DEFAULT '{}',
    target_demographics JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    severity_level INTEGER CHECK (severity_level >= 1 AND severity_level <= 5) DEFAULT 3,
    
    -- Source and references
    source TEXT,
    source_url TEXT,
    external_reference TEXT,
    authority_reference TEXT,
    
    -- Metadata
    created_by UUID REFERENCES auth.users(id),
    view_count INTEGER DEFAULT 0,
    share_count INTEGER DEFAULT 0,
    
    -- Timing
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 15. ANALYTICS DATA TABLE
CREATE TABLE public.analytics_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metric_name TEXT NOT NULL,
    metric_value DECIMAL(15, 2) NOT NULL,
    metric_type TEXT CHECK (metric_type IN ('count', 'percentage', 'amount', 'duration', 'rate')),
    dimensions JSONB DEFAULT '{}',
    filters JSONB DEFAULT '{}',
    date_recorded DATE DEFAULT CURRENT_DATE,
    hour_recorded INTEGER CHECK (hour_recorded >= 0 AND hour_recorded <= 23),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(metric_name, dimensions, date_recorded, hour_recorded)
);

-- 16. SYSTEM CONFIGURATION TABLE
CREATE TABLE public.system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_key TEXT NOT NULL UNIQUE,
    config_value JSONB NOT NULL,
    description TEXT,
    category TEXT,
    is_public BOOLEAN DEFAULT false,
    is_encrypted BOOLEAN DEFAULT false,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for performance optimization
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_fraud_type ON public.reports(fraud_type);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_reports_report_number ON public.reports(report_number);
CREATE INDEX idx_reports_location ON public.reports(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX idx_reports_city_state ON public.reports(city, state);
CREATE INDEX idx_reports_amount ON public.reports(amount_involved) WHERE amount_involved IS NOT NULL;

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_expires_at ON public.notifications(expires_at) WHERE expires_at IS NOT NULL;

CREATE INDEX idx_community_interactions_report_id ON public.community_interactions(report_id);
CREATE INDEX idx_community_interactions_user_id ON public.community_interactions(user_id);
CREATE INDEX idx_community_interactions_type ON public.community_interactions(interaction_type);

CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email) WHERE email IS NOT NULL;
CREATE INDEX idx_user_profiles_location ON public.user_profiles(city, state);

CREATE INDEX idx_report_evidence_report_id ON public.report_evidence(report_id);
CREATE INDEX idx_report_evidence_uploaded_at ON public.report_evidence(uploaded_at DESC);

CREATE INDEX idx_report_status_history_report_id ON public.report_status_history(report_id);
CREATE INDEX idx_report_status_history_created_at ON public.report_status_history(created_at DESC);

CREATE INDEX idx_education_articles_category ON public.education_articles(category);
CREATE INDEX idx_education_articles_published ON public.education_articles(is_published, published_at DESC);
CREATE INDEX idx_education_articles_featured ON public.education_articles(is_featured, featured_order);
CREATE INDEX idx_education_articles_slug ON public.education_articles(slug);

CREATE INDEX idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX idx_support_tickets_ticket_number ON public.support_tickets(ticket_number);

CREATE INDEX idx_fraud_alerts_active ON public.fraud_alerts(is_active, created_at DESC);
CREATE INDEX idx_fraud_alerts_severity ON public.fraud_alerts(severity_level DESC);

CREATE INDEX idx_analytics_data_metric_date ON public.analytics_data(metric_name, date_recorded DESC);

-- Enable Row Level Security on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_article_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Create Row Level Security policies

-- User profiles policies
CREATE POLICY "Users can view and manage their own profile" 
    ON public.user_profiles FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Reports policies
CREATE POLICY "Users can view their own reports" 
    ON public.reports FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "Users can create their own reports" 
    ON public.reports FOR INSERT 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending reports" 
    ON public.reports FOR UPDATE 
    USING (user_id = auth.uid() AND status IN ('pending', 'under_review'));

-- Report evidence policies
CREATE POLICY "Users can view evidence for their reports" 
    ON public.report_evidence FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.reports 
            WHERE reports.id = report_evidence.report_id 
            AND reports.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload evidence for their reports" 
    ON public.report_evidence FOR INSERT 
    WITH CHECK (
        uploaded_by = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.reports 
            WHERE reports.id = report_evidence.report_id 
            AND reports.user_id = auth.uid()
        )
    );

-- Report status history policies
CREATE POLICY "Users can view status history for their reports" 
    ON public.report_status_history FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.reports 
            WHERE reports.id = report_status_history.report_id 
            AND reports.user_id = auth.uid()
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" 
    ON public.notifications FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" 
    ON public.notifications FOR UPDATE 
    USING (user_id = auth.uid());

-- Community interactions policies
CREATE POLICY "Users can view community interactions" 
    ON public.community_interactions FOR SELECT 
    USING (true);

CREATE POLICY "Users can create their own interactions" 
    ON public.community_interactions FOR INSERT 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own interactions" 
    ON public.community_interactions FOR UPDATE 
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own interactions" 
    ON public.community_interactions FOR DELETE 
    USING (user_id = auth.uid());

-- User analytics preferences policies
CREATE POLICY "Users can manage their own preferences" 
    ON public.user_analytics_preferences FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Education articles policies (public read)
CREATE POLICY "Anyone can view published articles" 
    ON public.education_articles FOR SELECT 
    USING (is_published = true);

-- User article interactions policies
CREATE POLICY "Users can manage their own article interactions" 
    ON public.user_article_interactions FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- FAQ policies (public read)
CREATE POLICY "Anyone can view FAQs" 
    ON public.faqs FOR SELECT 
    USING (true);

-- Support tickets policies
CREATE POLICY "Users can manage their own tickets" 
    ON public.support_tickets FOR ALL 
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Support ticket messages policies
CREATE POLICY "Users can view messages for their tickets" 
    ON public.support_ticket_messages FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.support_tickets 
            WHERE support_tickets.id = support_ticket_messages.ticket_id 
            AND support_tickets.user_id = auth.uid()
        ) OR sender_id = auth.uid()
    );

CREATE POLICY "Users can create messages for their tickets" 
    ON public.support_ticket_messages FOR INSERT 
    WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.support_tickets 
            WHERE support_tickets.id = support_ticket_messages.ticket_id 
            AND support_tickets.user_id = auth.uid()
        )
    );

-- User achievements policies
CREATE POLICY "Users can view their own achievements" 
    ON public.user_achievements FOR SELECT 
    USING (user_id = auth.uid());

-- Fraud alerts policies (public read)
CREATE POLICY "Anyone can view active fraud alerts" 
    ON public.fraud_alerts FOR SELECT 
    USING (is_active = true);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('evidence-files', 'evidence-files', false),
    ('profile-pictures', 'profile-pictures', true),
    ('article-images', 'article-images', true),
    ('system-files', 'system-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Users can upload evidence files"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'evidence-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their evidence files"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'evidence-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view public files"
    ON storage.objects FOR SELECT
    USING (bucket_id IN ('profile-pictures', 'article-images'));

-- Create trigger functions
CREATE OR REPLACE FUNCTION public.update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_report_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.report_number IS NULL THEN
        NEW.report_number := 'RPT-' || DATE_PART('year', NOW()) || '-' || LPAD(nextval('report_number_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.ticket_number IS NULL THEN
        NEW.ticket_number := 'TKT-' || DATE_PART('year', NOW()) || '-' || LPAD(nextval('ticket_number_seq')::text, 6, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.create_status_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO public.notifications (user_id, type, title, message, data, priority)
        VALUES (
            NEW.user_id,
            'case_update',
            'Report Status Updated',
            'Your report "' || NEW.title || '" status has been updated to ' || NEW.status,
            jsonb_build_object(
                'report_id', NEW.id, 
                'report_number', NEW.report_number,
                'old_status', OLD.status, 
                'new_status', NEW.status
            ),
            CASE 
                WHEN NEW.status = 'resolved' THEN 'high'
                WHEN NEW.status = 'rejected' THEN 'high'
                ELSE 'medium'
            END::priority_level
        );
        
        -- Log status change
        INSERT INTO public.report_status_history (report_id, previous_status, new_status, automated_change)
        VALUES (NEW.id, OLD.status, NEW.status, true);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_profile_login()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.user_profiles 
    SET 
        last_login = now(),
        login_count = COALESCE(login_count, 0) + 1,
        updated_at = now()
    WHERE user_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create sequences
CREATE SEQUENCE IF NOT EXISTS report_number_seq START WITH 1;
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START WITH 1;

-- Create triggers
CREATE TRIGGER update_reports_timestamp 
    BEFORE UPDATE ON public.reports 
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_user_profiles_timestamp 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_community_interactions_timestamp 
    BEFORE UPDATE ON public.community_interactions 
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_user_analytics_preferences_timestamp 
    BEFORE UPDATE ON public.user_analytics_preferences 
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_education_articles_timestamp 
    BEFORE UPDATE ON public.education_articles 
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_support_tickets_timestamp 
    BEFORE UPDATE ON public.support_tickets 
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_fraud_alerts_timestamp 
    BEFORE UPDATE ON public.fraud_alerts 
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_system_config_timestamp 
    BEFORE UPDATE ON public.system_config 
    FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER generate_report_number_trigger
    BEFORE INSERT ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.generate_report_number();

CREATE TRIGGER generate_ticket_number_trigger
    BEFORE INSERT ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION public.generate_ticket_number();

CREATE TRIGGER trigger_status_notification
    AFTER UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.create_status_notification();

-- Insert default system configuration
INSERT INTO public.system_config (config_key, config_value, description, category, is_public) VALUES
('app_settings', 
 '{"maintenance_mode": false, "allow_registrations": true, "max_file_size": 10485760, "session_timeout": 3600}', 
 'Application settings', 'general', false),
 
('fraud_categories', 
 '["phishing", "sms_fraud", "call_fraud", "email_spam", "investment_scam", "lottery_scam", "tech_support_scam", "romance_scam", "online_shopping_fraud", "banking_fraud", "identity_theft", "cryptocurrency_scam", "job_scam", "social_media_fraud", "fake_website", "other"]', 
 'Available fraud categories', 'reports', true),
 
('notification_settings', 
 '{"email_enabled": true, "sms_enabled": false, "push_enabled": true, "batch_size": 100}', 
 'Global notification settings', 'notifications', false),
 
('privacy_settings',
 '{"data_retention_days": 2555, "anonymize_after_days": 1095, "public_stats": true}',
 'Privacy and data retention settings', 'privacy', false),
 
('feature_flags',
 '{"community_enabled": true, "real_time_alerts": true, "advanced_analytics": true, "mobile_app": true}',
 'Feature availability flags', 'features', false)
ON CONFLICT (config_key) DO NOTHING;

-- Insert sample educational content
INSERT INTO public.education_articles (title, slug, content, excerpt, category, difficulty_level, is_published, is_featured) VALUES
('How to Identify Phishing Emails', 'identify-phishing-emails', 
 'Phishing emails are fraudulent messages designed to steal your personal information...', 
 'Learn the key signs of phishing emails and how to protect yourself.',
 'Email Security', 'beginner', true, true),
 
('Protecting Your Financial Information Online', 'protect-financial-info',
 'Your financial information is valuable to cybercriminals...', 
 'Essential tips for keeping your banking and financial data secure.',
 'Financial Security', 'intermediate', true, true),
 
('Social Media Fraud Prevention', 'social-media-fraud-prevention',
 'Social media platforms are increasingly targeted by fraudsters...', 
 'Stay safe on social media with these fraud prevention tips.',
 'Social Media', 'beginner', true, false)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample FAQs
INSERT INTO public.faqs (question, answer, category, is_featured) VALUES
('How do I report a fraud incident?', 
 'You can report fraud through our online portal by clicking "Report Fraud" and filling out the detailed form.',
 'Reporting', true),
 
('What information do I need to provide?', 
 'Please provide as much detail as possible including date, time, amount involved, and any evidence like screenshots.',
 'Reporting', true),
 
('How long does it take to process a report?', 
 'Initial review typically takes 2-3 business days. Complex cases may take longer depending on investigation requirements.',
 'Processing', true),
 
('Can I track the status of my report?', 
 'Yes, you can track your report status through your dashboard or by using your report number.',
 'Tracking', true)
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create a view for report statistics (performance optimization)
CREATE OR REPLACE VIEW public.report_stats AS
SELECT 
    COUNT(*) as total_reports,
    COUNT(*) FILTER (WHERE status = 'pending') as pending_reports,
    COUNT(*) FILTER (WHERE status = 'under_review') as under_review_reports,
    COUNT(*) FILTER (WHERE status = 'resolved') as resolved_reports,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_reports,
    SUM(amount_involved) as total_amount_involved,
    AVG(amount_involved) as avg_amount_involved,
    COUNT(DISTINCT user_id) as unique_reporters,
    DATE_TRUNC('month', created_at) as month
FROM public.reports
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;

-- Create a view for user activity summary
CREATE OR REPLACE VIEW public.user_activity_summary AS
SELECT 
    up.user_id,
    up.full_name,
    up.email,
    COUNT(r.id) as total_reports,
    COUNT(ci.id) as total_interactions,
    COUNT(n.id) FILTER (WHERE n.read = false) as unread_notifications,
    up.created_at as registration_date,
    up.last_login
FROM public.user_profiles up
LEFT JOIN public.reports r ON up.user_id = r.user_id
LEFT JOIN public.community_interactions ci ON up.user_id = ci.user_id
LEFT JOIN public.notifications n ON up.user_id = n.user_id
GROUP BY up.user_id, up.full_name, up.email, up.created_at, up.last_login;

COMMENT ON TABLE public.reports IS 'Core fraud reports submitted by users';
COMMENT ON TABLE public.user_profiles IS 'User profile information and preferences';
COMMENT ON TABLE public.notifications IS 'System notifications for users';
COMMENT ON TABLE public.community_interactions IS 'Community engagement on reports';
COMMENT ON TABLE public.education_articles IS 'Educational content for fraud prevention';
COMMENT ON TABLE public.support_tickets IS 'User support and help requests';
