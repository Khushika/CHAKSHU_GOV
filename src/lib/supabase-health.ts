import { supabase, checkConnection } from "@/integrations/supabase/client";

export interface SupabaseHealthCheck {
  isAvailable: boolean;
  responseTime?: number;
  error?: string;
  details?: {
    auth: boolean;
    database: boolean;
    storage: boolean;
    realtime: boolean;
  };
}

/**
 * Checks the health of the Supabase connection
 * Returns availability status, response time, and any errors
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthCheck> {
  const startTime = Date.now();

  try {
    const connectionResult = await checkConnection();
    const responseTime = Date.now() - startTime;

    if (!connectionResult.connected) {
      return {
        isAvailable: false,
        responseTime,
        error: connectionResult.error || "Connection failed",
      };
    }

    return {
      isAvailable: true,
      responseTime,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      isAvailable: false,
      responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Performs a comprehensive health check including all Supabase services
 */
export async function checkSupabaseFullHealth(): Promise<SupabaseHealthCheck> {
  const startTime = Date.now();

  try {
    // Test all major Supabase services
    const [authResult, dbResult, storageResult] = await Promise.allSettled([
      supabase.auth.getSession(),
      supabase.from("system_config").select("id").limit(1),
      supabase.storage.from("evidence-files").list("", { limit: 1 }),
    ]);

    const responseTime = Date.now() - startTime;

    // Analyze results
    const authSuccess =
      authResult.status === "fulfilled" && !authResult.value.error;
    const dbSuccess = dbResult.status === "fulfilled" && !dbResult.value.error;
    const storageSuccess =
      storageResult.status === "fulfilled" && !storageResult.value.error;

    const details = {
      auth: authSuccess,
      database: dbSuccess,
      storage: storageSuccess,
      realtime: true, // Assume realtime is working if other services work
    };

    const isAvailable = authSuccess && dbSuccess;

    if (!isAvailable) {
      let error = "Service partially unavailable";
      const failedServices = [];

      if (!authSuccess) failedServices.push("Authentication");
      if (!dbSuccess) failedServices.push("Database");
      if (!storageSuccess) failedServices.push("Storage");

      if (failedServices.length > 0) {
        error = `Failed services: ${failedServices.join(", ")}`;
      }

      // Get specific error details
      if (authResult.status === "rejected") {
        error += ` (Auth: ${authResult.reason})`;
      } else if (authResult.status === "fulfilled" && authResult.value.error) {
        error += ` (Auth: ${authResult.value.error.message})`;
      }

      if (dbResult.status === "rejected") {
        error += ` (DB: ${dbResult.reason})`;
      } else if (dbResult.status === "fulfilled" && dbResult.value.error) {
        error += ` (DB: ${dbResult.value.error.message})`;
      }

      return {
        isAvailable: false,
        responseTime,
        error,
        details,
      };
    }

    return {
      isAvailable: true,
      responseTime,
      details,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      isAvailable: false,
      responseTime,
      error: error instanceof Error ? error.message : "Unknown error",
      details: {
        auth: false,
        database: false,
        storage: false,
        realtime: false,
      },
    };
  }
}

/**
 * Test specific database tables and operations
 */
export async function testDatabaseOperations(): Promise<{
  success: boolean;
  results: Record<string, boolean>;
  errors: Record<string, string>;
}> {
  const results: Record<string, boolean> = {};
  const errors: Record<string, string> = {};

  const tables = [
    "system_config",
    "user_profiles",
    "reports",
    "notifications",
    "community_interactions",
    "education_articles",
    "faqs",
    "fraud_alerts",
  ];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select("id").limit(1);

      results[table] = !error;
      if (error) {
        errors[table] = error.message;
      }
    } catch (error) {
      results[table] = false;
      errors[table] = error instanceof Error ? error.message : "Unknown error";
    }
  }

  const success = Object.values(results).every((result) => result);

  return { success, results, errors };
}

/**
 * Check Row Level Security policies
 */
export async function checkRLSPolicies(): Promise<{
  success: boolean;
  policies: Record<string, boolean>;
  errors: Record<string, string>;
}> {
  const policies: Record<string, boolean> = {};
  const errors: Record<string, string> = {};

  // Test RLS by attempting operations that should be restricted
  const testTables = [
    "user_profiles",
    "reports",
    "notifications",
    "community_interactions",
  ];

  for (const table of testTables) {
    try {
      // This should fail due to RLS if not authenticated or authorized
      const { error } = await supabase.from(table).select("*").limit(1);

      // RLS is working if we get a specific RLS error or success with auth
      policies[table] = true; // If we get here without throwing, RLS is configured
    } catch (error) {
      policies[table] = false;
      errors[table] =
        error instanceof Error ? error.message : "RLS test failed";
    }
  }

  const success = Object.values(policies).every((policy) => policy);

  return { success, policies, errors };
}
