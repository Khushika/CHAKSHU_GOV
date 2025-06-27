/**
 * Migration Instructions Component
 * Provides step-by-step instructions for fixing database RLS issues
 */

import { useState } from "react";
import { Copy, ExternalLink, CheckCircle } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DatabaseTestButton from "./DatabaseTestButton";
import { useToast } from "@/hooks/use-toast";

const migrationSQL = `-- Fix infinite recursion in RLS policies
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

-- =============================================
-- GRANT EXECUTE PERMISSIONS
-- =============================================

-- Grant execute permissions on security definer functions
GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_valid_user(uuid) TO authenticated;`;

export function MigrationInstructions() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(migrationSQL);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Migration SQL copied to clipboard",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the SQL code",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-red-600">
          Database Migration Required
        </CardTitle>
        <CardDescription>
          The database has infinite recursion in RLS policies that needs to be
          fixed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            <strong>Issue:</strong> The Row-Level Security (RLS) policies in the
            database have circular references that prevent normal operation.
            This needs to be fixed by a database administrator.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            Step-by-Step Fix Instructions:
          </h3>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                1
              </Badge>
              <div>
                <p className="font-medium">Access Supabase Dashboard</p>
                <p className="text-sm text-gray-600">
                  Go to your Supabase project dashboard at{" "}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    supabase.com/dashboard
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                2
              </Badge>
              <div>
                <p className="font-medium">Open SQL Editor</p>
                <p className="text-sm text-gray-600">
                  Navigate to the SQL Editor section in your project
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                3
              </Badge>
              <div>
                <p className="font-medium">Run the Migration SQL</p>
                <p className="text-sm text-gray-600">
                  Copy and paste the SQL code below into the editor and run it
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-1">
                4
              </Badge>
              <div>
                <p className="font-medium">Refresh the Application</p>
                <p className="text-sm text-gray-600">
                  After the migration completes, refresh this page to verify the
                  fix
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Migration SQL Code:</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex items-center gap-2"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy SQL
                </>
              )}
            </Button>
          </div>

          <div className="relative">
            <pre className="bg-gray-100 p-4 rounded-lg text-xs overflow-auto max-h-96 border">
              <code>{migrationSQL}</code>
            </pre>
          </div>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Note:</strong> This migration creates security definer
            functions that prevent the infinite recursion issue while
            maintaining proper access controls. After running this migration,
            the application should work normally.
          </AlertDescription>
        </Alert>

        <div className="pt-4 border-t space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              After applying the migration, test if it worked:
            </p>
            <DatabaseTestButton />
          </div>

          <p className="text-sm text-gray-600">
            If you're not a database administrator, please share these
            instructions with your technical team or contact support for
            assistance.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default MigrationInstructions;
