# Chakshu Portal - Database Setup Guide

This guide will help you set up the complete database infrastructure for the Chakshu Portal with full Supabase integration.

## Prerequisites

1. **Supabase Account**: Create a free account at [supabase.com](https://supabase.com)
2. **Node.js**: Version 18 or higher
3. **Git**: For version control

## Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `chakshu-portal`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be created (2-3 minutes)

## Step 2: Get Project Configuration

1. Go to Project Settings → API
2. Copy the following values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon/Public Key**: `eyJhbGc...` (long string)

## Step 3: Configure Environment Variables

1. Create a `.env` file in your project root:

```bash
cp .env.example .env
```

2. Update `.env` with your Supabase credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Development Settings
VITE_APP_ENV=development
VITE_APP_NAME=Chakshu Portal
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_COMMUNITY=true

# API Configuration
VITE_API_TIMEOUT=10000
VITE_MAX_FILE_SIZE=10485760

# Demo Mode (set to false for production)
VITE_DEMO_MODE=false
```

## Step 4: Run Database Migrations

### Option A: Using Supabase CLI (Recommended)

1. Install Supabase CLI:

```bash
npm install -g supabase
```

2. Login to Supabase:

```bash
supabase login
```

3. Link your project:

```bash
supabase link --project-ref your-project-ref
```

4. Run migrations:

```bash
supabase db push
```

### Option B: Manual SQL Execution

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase/migrations/20241220000000_comprehensive_fresh_schema.sql`
4. Paste into the SQL Editor
5. Click "Run" to execute the migration

## Step 5: Configure Storage

1. Go to Storage in your Supabase Dashboard
2. Verify these buckets exist (created by migration):
   - `evidence-files` (Private)
   - `profile-pictures` (Public)
   - `article-images` (Public)
   - `system-files` (Private)

3. If buckets don't exist, create them manually with the specified privacy settings.

## Step 6: Set up Authentication

1. Go to Authentication → Settings in Supabase Dashboard
2. Configure Site URL:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add your domain for production

3. Enable Email Authentication:
   - Go to Authentication → Providers
   - Ensure "Email" is enabled
   - Configure email templates if needed

## Step 7: Test the Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open the CRUD Tester:
   - Navigate to `/admin/crud-tester` in your browser
   - Run health checks to verify all systems are working

## Step 8: Create First User (Optional)

You can create a test user through the application's signup form or via SQL:

```sql
-- Insert into auth.users (this creates the authentication record)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@chakshu.gov.in',
  crypt('your-password', gen_salt('bf')),
  now(),
  now(),
  now()
);

-- The user profile will be created automatically via triggers
```

## Database Schema Overview

The database includes these main tables:

### Core Tables

- **`user_profiles`**: User information and preferences
- **`reports`**: Fraud reports submitted by users
- **`report_evidence`**: Files and evidence attached to reports
- **`report_status_history`**: Status change tracking
- **`notifications`**: User notifications system

### Community Features

- **`community_interactions`**: Comments, likes, and community engagement
- **`education_articles`**: Educational content about fraud prevention
- **`faqs`**: Frequently asked questions

### Support & Alerts

- **`support_tickets`**: User support requests
- **`fraud_alerts`**: System-wide fraud alerts
- **`user_achievements`**: Gamification and user achievements

### System Tables

- **`system_config`**: Application configuration
- **`analytics_data`**: Usage analytics and metrics

## Key Features Implemented

### CRUD Operations

- ✅ **Reports**: Create, read, update, delete fraud reports
- ✅ **User Profiles**: Complete profile management
- ✅ **Notifications**: Real-time notification system
- ✅ **Community**: Comments and interactions
- ✅ **Evidence**: File upload and management
- ✅ **Support**: Ticket system

### Security Features

- ✅ **Row Level Security (RLS)**: All tables protected
- ✅ **User Authentication**: Supabase Auth integration
- ✅ **File Security**: Secure file upload/access
- ✅ **Data Validation**: Input validation and sanitization

### Real-time Features

- ✅ **Live Updates**: Real-time report status updates
- ✅ **Notifications**: Instant notification delivery
- ✅ **Community**: Live comments and interactions

## Troubleshooting

### Connection Issues

1. Verify your `.env` file has correct Supabase URL and key
2. Check if your Supabase project is active
3. Ensure your IP is not blocked (check Supabase logs)

### Migration Issues

1. Check SQL Editor for syntax errors
2. Verify you have sufficient permissions
3. Check Supabase logs for detailed error messages

### Authentication Issues

1. Verify Site URL in Supabase Authentication settings
2. Check email confirmation requirements
3. Ensure email templates are configured

### Performance Issues

1. Monitor database performance in Supabase Dashboard
2. Check index usage and query performance
3. Consider upgrading your Supabase plan if needed

## Production Deployment

For production deployment:

1. **Update Environment Variables**:

   ```env
   VITE_APP_ENV=production
   VITE_DEMO_MODE=false
   ```

2. **Configure Custom Domain**: Set up custom domain in Supabase
3. **Enable Email Service**: Configure SMTP or email service
4. **Set up Monitoring**: Monitor logs and performance
5. **Backup Strategy**: Set up automated backups
6. **Security Review**: Review RLS policies and access controls

## Support

If you encounter any issues:

1. Check the CRUD Tester component for system health
2. Review Supabase logs in the Dashboard
3. Verify all environment variables are correct
4. Ensure database migrations completed successfully

For additional help, refer to the [Supabase Documentation](https://supabase.com/docs) or create an issue in the project repository.
