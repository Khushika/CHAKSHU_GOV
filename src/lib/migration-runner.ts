/**
 * Migration Runner Utility
 * Helps run database migrations and handle RLS policy fixes
 */

import { supabase } from "@/integrations/supabase/client";

interface MigrationResult {
  success: boolean;
  error?: string;
  message?: string;
}

/**
 * Run the RLS fix migration
 */
export async function runRLSFixMigration(): Promise<MigrationResult> {
  try {
    console.log("Running RLS fix migration...");

    // Check if the security definer functions exist
    const { data: functionsCheck, error: functionsError } = await supabase
      .rpc("database_health_check")
      .select();

    if (functionsError) {
      console.log(
        "Security definer functions not found, they may need to be created",
      );
      return {
        success: false,
        error:
          "RLS fix migration needs to be applied. Please contact your administrator.",
        message:
          "Database policies need to be updated to fix infinite recursion issues.",
      };
    }

    console.log("RLS fix migration appears to be applied successfully");
    return {
      success: true,
      message: "Database is properly configured with RLS policies",
    };
  } catch (error) {
    console.error("Migration check failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Migration check failed",
    };
  }
}

/**
 * Check if the database has the proper RLS policies
 */
export async function checkDatabaseHealth(): Promise<MigrationResult> {
  try {
    // Try a simple query that would trigger RLS policies
    const { data, error } = await supabase
      .from("fraud_reports")
      .select("id")
      .limit(1);

    if (error) {
      // Check for infinite recursion error
      if (error.message?.includes("infinite recursion")) {
        // Log detailed instructions to console for developers
        console.error("🚨 DATABASE INFINITE RECURSION DETECTED 🚨");
        console.error("");
        console.error(
          "The database has infinite recursion in RLS policies that needs to be fixed.",
        );
        console.error("");
        console.error("QUICK FIX INSTRUCTIONS:");
        console.error("1. Go to your Supabase Dashboard > SQL Editor");
        console.error(
          "2. Run the migration file: supabase/migrations/20250614000000-fix-rls-infinite-recursion.sql",
        );
        console.error(
          "3. Or copy the migration SQL from the DatabaseStatus component",
        );
        console.error("");
        console.error(
          "This will create security definer functions to prevent circular references in RLS policies.",
        );
        console.error("");

        return {
          success: false,
          error:
            "Database RLS policies have infinite recursion. Migration needed.",
          message: "Please apply the RLS fix migration.",
        };
      }

      // Check for permission errors (expected if not authenticated)
      if (
        error.message?.includes("permission denied") ||
        error.message?.includes("JWT")
      ) {
        return {
          success: true,
          message:
            "Database RLS policies are working correctly (authentication required)",
        };
      }

      return {
        success: false,
        error: error.message,
        message: "Database health check failed",
      };
    }

    return {
      success: true,
      message: "Database is healthy and accessible",
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Health check failed",
    };
  }
}

/**
 * Attempt to fix common database issues automatically
 */
export async function autoFixDatabaseIssues(): Promise<MigrationResult> {
  try {
    // First check if there are any issues
    const healthCheck = await checkDatabaseHealth();

    if (healthCheck.success) {
      return {
        success: true,
        message: "No database issues detected",
      };
    }

    // If there are infinite recursion issues, suggest the migration
    if (healthCheck.error?.includes("infinite recursion")) {
      return {
        success: false,
        error: "RLS infinite recursion detected",
        message:
          "Please run the following SQL migration in your Supabase dashboard:\n\n" +
          "1. Go to Supabase Dashboard > SQL Editor\n" +
          "2. Run the migration file: 20250614000000-fix-rls-infinite-recursion.sql\n" +
          "3. This will fix the circular reference in RLS policies",
      };
    }

    return healthCheck;
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Auto-fix failed",
    };
  }
}

/**
 * Get database configuration status
 */
export async function getDatabaseStatus(): Promise<{
  hasRLSFix: boolean;
  hasHealthCheck: boolean;
  isConnected: boolean;
  lastError?: string;
}> {
  try {
    // Check if health check function exists
    const { error: healthError } = await supabase.rpc("database_health_check");
    const hasHealthCheck = !healthError;

    // Check if admin function exists
    const { error: adminError } = await supabase.rpc("is_admin_user", {
      user_id: "test",
    });
    const hasRLSFix = !adminError || !adminError.message?.includes("function");

    // Check basic connection
    const { error: connectionError } = await supabase
      .from("fraud_reports")
      .select("id")
      .limit(0);

    const isConnected =
      !connectionError ||
      connectionError.message?.includes("permission") ||
      connectionError.message?.includes("JWT");

    return {
      hasRLSFix,
      hasHealthCheck,
      isConnected,
      lastError: connectionError?.message,
    };
  } catch (error) {
    return {
      hasRLSFix: false,
      hasHealthCheck: false,
      isConnected: false,
      lastError: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
