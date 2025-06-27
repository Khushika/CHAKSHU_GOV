-- Comprehensive Database Schema for Chakshu Fraud Reporting Platform
-- This migration creates the complete database schema with tables, relationships, functions, and triggers

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE (Enhanced user management)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone_number TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    user_role TEXT DEFAULT 'citizen' CHECK (user_role IN ('citizen', 'admin', 'moderator')),
    is_verified BOOLEAN DEFAULT false
);

-- 2. FRAUD_REPORTS TABLE (Core reporting functionality)
CREATE TABLE IF NOT EXISTS public.fraud_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    report_type TEXT NOT NULL CHECK (report_type IN ('call', 'sms', 'whatsapp', 'email')),
    fraudulent_number TEXT NOT NULL,
    incident_date DATE NOT NULL,
    incident_time TIME,
    description TEXT NOT NULL,
    fraud_category TEXT NOT NULL CHECK (fraud_category IN ('financial_fraud', 'impersonation', 'lottery_scam', 'investment_fraud', 'job_fraud', 'other')),
    evidence_urls TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'verified', 'rejected', 'resolved')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. REPORT_ACTIONS TABLE (Admin actions and audit trail)
CREATE TABLE IF NOT EXISTS public.report_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.fraud_reports(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES public.users(id),
    action_type TEXT NOT NULL CHECK (action_type IN ('status_change', 'comment', 'escalation', 'resolution')),
    action_description TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. BLOCKED_NUMBERS TABLE (Track blocked/flagged numbers)
CREATE TABLE IF NOT EXISTS public.blocked_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    block_reason TEXT NOT NULL,
    blocked_by UUID REFERENCES public.users(id),
    report_count INTEGER DEFAULT 1,
    first_reported TIMESTAMPTZ DEFAULT now(),
    last_reported TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true
);

-- 5. NOTIFICATIONS TABLE (User notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. USER_PROFILES TABLE (Extended user information)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    date_of_birth DATE,
    gender TEXT,
    occupation TEXT,
    address JSONB DEFAULT '{}',
    profile_picture_url TEXT,
    language_preference TEXT DEFAULT 'en',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    profile_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. REPORT_EVIDENCE TABLE (File attachments and evidence)
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

-- 8. COMMUNITY_INTERACTIONS TABLE (User engagement)
CREATE TABLE IF NOT EXISTS public.community_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.fraud_reports(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'comment', 'share', 'helpful')),
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(report_id, user_id, interaction_type)
);

-- 9. SYSTEM_LOGS TABLE (Application logging)
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fraud_reports_user_id ON public.fraud_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_status ON public.fraud_reports(status);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_fraud_category ON public.fraud_reports(fraud_category);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_created_at ON public.fraud_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fraud_reports_fraudulent_number ON public.fraud_reports(fraudulent_number);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_blocked_numbers_phone_number ON public.blocked_numbers(phone_number);
CREATE INDEX IF NOT EXISTS idx_blocked_numbers_is_active ON public.blocked_numbers(is_active);

CREATE INDEX IF NOT EXISTS idx_report_actions_report_id ON public.report_actions(report_id);
CREATE INDEX IF NOT EXISTS idx_report_actions_admin_id ON public.report_actions(admin_id);

CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON public.system_logs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fraud_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Users policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Fraud reports policies
CREATE POLICY "Users can view their own reports" ON public.fraud_reports
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own reports" ON public.fraud_reports
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own reports" ON public.fraud_reports
    FOR UPDATE USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins can view all reports" ON public.fraud_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id::text = auth.uid()::text 
            AND user_role IN ('admin', 'moderator')
        )
    );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid()::text = user_id::text);

-- User profiles policies
CREATE POLICY "Users can manage their own profile" ON public.user_profiles
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Community interactions policies (public read, authenticated write)
CREATE POLICY "Anyone can view community interactions" ON public.community_interactions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create interactions" ON public.community_interactions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Report evidence policies
CREATE POLICY "Users can view evidence for their reports" ON public.report_evidence
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.fraud_reports 
            WHERE id = report_id 
            AND user_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can upload evidence for their reports" ON public.report_evidence
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.fraud_reports 
            WHERE id = report_id 
            AND user_id::text = auth.uid()::text
        )
    );

-- DATABASE FUNCTIONS AND TRIGGERS

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

CREATE TRIGGER update_fraud_reports_timestamp 
    BEFORE UPDATE ON public.fraud_reports 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_timestamp 
    BEFORE UPDATE ON public.user_profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Increment report count function for blocked numbers
CREATE OR REPLACE FUNCTION public.increment_report_count()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.blocked_numbers (phone_number, block_reason, blocked_by, report_count, first_reported, last_reported)
    VALUES (NEW.fraudulent_number, 'Multiple reports received', NEW.user_id, 1, NOW(), NOW())
    ON CONFLICT (phone_number) 
    DO UPDATE SET 
        report_count = public.blocked_numbers.report_count + 1,
        last_reported = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply report count trigger
CREATE TRIGGER trigger_increment_report_count
    AFTER INSERT ON public.fraud_reports
    FOR EACH ROW EXECUTE FUNCTION public.increment_report_count();

-- 3. Create notification function
CREATE OR REPLACE FUNCTION public.create_notification(
    p_user_id UUID,
    p_title TEXT,
    p_message TEXT,
    p_type TEXT DEFAULT 'info'
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO public.notifications (user_id, title, message, type)
    VALUES (p_user_id, p_title, p_message, p_type)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Status change notification trigger
CREATE OR REPLACE FUNCTION public.notify_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        PERFORM public.create_notification(
            NEW.user_id,
            'Report Status Updated',
            'Your fraud report status has been changed to: ' || NEW.status,
            'info'
        );
        
        -- Log the action
        INSERT INTO public.report_actions (report_id, action_type, action_description, old_status, new_status)
        VALUES (NEW.id, 'status_change', 'Status changed from ' || OLD.status || ' to ' || NEW.status, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply status change trigger
CREATE TRIGGER trigger_notify_status_change
    AFTER UPDATE ON public.fraud_reports
    FOR EACH ROW EXECUTE FUNCTION public.notify_status_change();

-- 5. System logging function
CREATE OR REPLACE FUNCTION public.log_system_action(
    p_user_id UUID,
    p_action TEXT,
    p_resource_type TEXT DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.system_logs (user_id, action, resource_type, resource_id, metadata)
    VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_metadata)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. User registration trigger (create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        updated_at = NOW();
    
    INSERT INTO public.user_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply user registration trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) VALUES 
    ('evidence-files', 'evidence-files', false),
    ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload evidence files" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'evidence-files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can view their evidence files" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'evidence-files' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Users can upload profile pictures" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'profile-pictures'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Anyone can view profile pictures" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-pictures');

-- Sample data inserts (for development/testing)
INSERT INTO public.users (id, email, full_name, user_role) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@chakshu.gov.in', 'System Administrator', 'admin'),
    ('00000000-0000-0000-0000-000000000002', 'moderator@chakshu.gov.in', 'Content Moderator', 'moderator')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for performance optimization
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_fraud_reports_compound 
    ON public.fraud_reports(user_id, status, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_compound 
    ON public.notifications(user_id, is_read, created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blocked_numbers_compound 
    ON public.blocked_numbers(phone_number, is_active, report_count DESC);

-- Enable real-time subscriptions for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.fraud_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.blocked_numbers;
