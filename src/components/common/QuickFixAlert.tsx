/**
 * Quick Fix Alert Component
 * Shows a prominent alert with the specific SQL needed to fix the infinite recursion
 */

import { useState } from "react";
import { AlertTriangle, Copy, CheckCircle, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const QUICK_FIX_SQL = `-- SIMPLE FIX: Remove dependency on users table for fraud reports
-- This allows reports to be created using auth.uid() directly

-- Remove the problematic foreign key constraint
ALTER TABLE public.fraud_reports
DROP CONSTRAINT IF EXISTS fraud_reports_user_id_fkey;

-- Create simple RLS policies for fraud_reports
DROP POLICY IF EXISTS "Users can create their own reports" ON public.fraud_reports;
DROP POLICY IF EXISTS "Users can view their own reports" ON public.fraud_reports;
DROP POLICY IF EXISTS "Anyone can view public reports" ON public.fraud_reports;

-- Allow authenticated users to create reports
CREATE POLICY "Authenticated users can create reports" ON public.fraud_reports
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Allow users to view their own reports
CREATE POLICY "Users can view their own reports" ON public.fraud_reports
    FOR SELECT USING (auth.uid()::text = user_id::text);

-- Allow viewing of public reports
CREATE POLICY "Anyone can view public reports" ON public.fraud_reports
    FOR SELECT USING (is_public = true);

-- Reference auth.users instead of custom users table
ALTER TABLE public.fraud_reports
ADD CONSTRAINT fraud_reports_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;`;

export function QuickFixAlert() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copySQL = async () => {
    try {
      await navigator.clipboard.writeText(QUICK_FIX_SQL);
      setCopied(true);
      toast({
        title: "SQL Copied!",
        description: "Quick fix SQL has been copied to your clipboard",
      });
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please manually copy the SQL code below",
        variant: "destructive",
      });
    }
  };

  return (
    <Alert variant="destructive" className="border-red-500 bg-red-50">
      <AlertTriangle className="h-5 w-5 text-red-600" />
      <AlertDescription>
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold text-red-800 text-base mb-2">
              🚨 Database Foreign Key Error - Simple Fix Required
            </h4>
            <p className="text-red-700">
              Your database has a foreign key constraint issue that prevents
              creating fraud reports. This simple fix removes the dependency on
              a custom users table.
            </p>
          </div>

          <div className="space-y-3">
            <div className="bg-white p-3 rounded border">
              <p className="font-medium text-gray-900 mb-2">
                To fix this immediately:
              </p>
              <ol className="text-sm text-gray-700 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    1
                  </span>
                  Go to{" "}
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    Supabase Dashboard
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    2
                  </span>
                  Open SQL Editor in your project
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    3
                  </span>
                  Copy and run the SQL code below
                </li>
                <li className="flex items-center gap-2">
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    4
                  </span>
                  Refresh this page and try submitting again
                </li>
              </ol>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">Quick Fix SQL:</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copySQL}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy SQL
                    </>
                  )}
                </Button>
              </div>

              <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-auto max-h-48 border">
                <code>{QUICK_FIX_SQL}</code>
              </pre>
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}

export default QuickFixAlert;
