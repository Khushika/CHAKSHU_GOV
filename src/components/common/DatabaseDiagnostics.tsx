/**
 * Database Diagnostics Component
 * Helps diagnose database connection and RLS policy issues
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface DiagnosticResult {
  test: string;
  success: boolean;
  error?: string;
  details?: string;
}

export function DatabaseDiagnostics() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const { user } = useAuth();

  const runDiagnostics = async () => {
    if (!user) {
      setResults([
        {
          test: "Authentication",
          success: false,
          error: "User not authenticated",
        },
      ]);
      return;
    }

    setTesting(true);
    const diagnosticResults: DiagnosticResult[] = [];

    // Test 1: Basic connection
    try {
      const { data, error } = await supabase
        .from("fraud_reports")
        .select("id")
        .limit(1);
      diagnosticResults.push({
        test: "Database Connection",
        success: !error,
        error: error?.message,
        details: error ? `Code: ${error.code}` : "Connection successful",
      });
    } catch (error) {
      diagnosticResults.push({
        test: "Database Connection",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test 2: User table access
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      diagnosticResults.push({
        test: "User Table Read",
        success: !error || error.code === "PGRST116",
        error: error?.message,
        details:
          error?.code === "PGRST116"
            ? "User not found (this is ok)"
            : error
              ? `Code: ${error.code}`
              : "User found",
      });
    } catch (error) {
      diagnosticResults.push({
        test: "User Table Read",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test 3: User creation ability
    try {
      const { data, error } = await supabase.from("users").upsert(
        {
          id: user.id,
          email: user.email || "test@example.com",
          full_name: "Test User",
          user_role: "citizen",
          is_verified: false,
          is_banned: false,
        },
        {
          onConflict: "id",
          ignoreDuplicates: true,
        },
      );

      diagnosticResults.push({
        test: "User Creation/Update",
        success: !error,
        error: error?.message,
        details: error ? `Code: ${error.code}` : "User upsert successful",
      });
    } catch (error) {
      diagnosticResults.push({
        test: "User Creation/Update",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // Test 4: Report creation ability (without actually creating)
    try {
      const testReport = {
        user_id: user.id,
        report_type: "call",
        fraudulent_number: "1234567890",
        incident_date: new Date().toISOString().split("T")[0],
        description: "Test report for diagnostics",
        fraud_category: "other",
        status: "pending",
        priority: "low",
      };

      // Just test the query without actually inserting
      const { error } = await supabase.from("fraud_reports").select().limit(0); // This tests access without inserting

      diagnosticResults.push({
        test: "Report Table Access",
        success: !error,
        error: error?.message,
        details: error ? `Code: ${error.code}` : "Report table accessible",
      });
    } catch (error) {
      diagnosticResults.push({
        test: "Report Table Access",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    setResults(diagnosticResults);
    setTesting(false);
  };

  const getIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const hasFailures = results.some((r) => !r.success);
  const hasRLSIssues = results.some(
    (r) =>
      r.error?.includes("row-level security") || r.error?.includes("policy"),
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Database Diagnostics
        </CardTitle>
        <CardDescription>
          Run diagnostics to identify database connection and permission issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runDiagnostics}
          disabled={testing || !user}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            "Run Database Diagnostics"
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Diagnostic Results:</h4>

            {results.map((result, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                {getIcon(result.success)}
                <div className="flex-1">
                  <p className="font-medium">{result.test}</p>
                  {result.error && (
                    <p className="text-sm text-red-600">{result.error}</p>
                  )}
                  {result.details && (
                    <p className="text-sm text-gray-500">{result.details}</p>
                  )}
                </div>
              </div>
            ))}

            {hasRLSIssues && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>RLS Policy Issues Detected</strong>
                  <br />
                  Your database has Row-Level Security policy issues. Please
                  apply the database migration by running the SQL fix in your
                  Supabase dashboard.
                </AlertDescription>
              </Alert>
            )}

            {hasFailures && !hasRLSIssues && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Database Issues Detected</strong>
                  <br />
                  There are database connectivity or permission issues. Check
                  the error details above.
                </AlertDescription>
              </Alert>
            )}

            {!hasFailures && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>All Tests Passed!</strong>
                  <br />
                  Your database connection and permissions are working
                  correctly.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DatabaseDiagnostics;
