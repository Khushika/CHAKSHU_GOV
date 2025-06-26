import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

// Get environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are configured
const hasSupabaseConfig = !!(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);

// Create mock client for when environment variables are missing
const createMockClient = () => {
  const mockError = {
    message:
      "Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.",
    status: 400,
    statusCode: 400,
  };

  const mockAuth = {
    getSession: () =>
      Promise.resolve({ data: { session: null }, error: mockError }),
    getUser: () => Promise.resolve({ data: { user: null }, error: mockError }),
    signUp: () => Promise.resolve({ data: null, error: mockError }),
    signInWithPassword: () => Promise.resolve({ data: null, error: mockError }),
    signOut: () => Promise.resolve({ error: mockError }),
    resetPasswordForEmail: () =>
      Promise.resolve({ data: null, error: mockError }),
    updateUser: () => Promise.resolve({ data: null, error: mockError }),
    onAuthStateChange: () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }),
  };

  const mockFrom = () => ({
    select: () => Promise.resolve({ data: null, error: mockError }),
    insert: () => Promise.resolve({ data: null, error: mockError }),
    update: () => Promise.resolve({ data: null, error: mockError }),
    delete: () => Promise.resolve({ data: null, error: mockError }),
    upsert: () => Promise.resolve({ data: null, error: mockError }),
    eq: function () {
      return this;
    },
    single: function () {
      return this;
    },
    limit: function () {
      return this;
    },
    order: function () {
      return this;
    },
    range: function () {
      return this;
    },
    contains: function () {
      return this;
    },
    gte: function () {
      return this;
    },
    lte: function () {
      return this;
    },
  });

  const mockStorage = {
    from: () => ({
      upload: () => Promise.resolve({ data: null, error: mockError }),
      remove: () => Promise.resolve({ data: null, error: mockError }),
      list: () => Promise.resolve({ data: null, error: mockError }),
      getPublicUrl: () => ({ data: { publicUrl: "" } }),
    }),
  };

  const mockChannel = {
    on: function () {
      return this;
    },
    subscribe: () => Promise.resolve("ok"),
    unsubscribe: () => Promise.resolve("ok"),
  };

  return {
    auth: mockAuth,
    from: mockFrom,
    storage: mockStorage,
    channel: () => mockChannel,
  };
};

// Create Supabase client or mock client based on configuration
export const supabase = hasSupabaseConfig
  ? createClient<Database>(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
      },
      db: {
        schema: "public",
      },
      global: {
        headers: {
          "X-Client-Info": "chakshu-portal@1.0.0",
        },
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : (createMockClient() as any);

// Export configuration status
export const isDemoMode = !hasSupabaseConfig;

// Enhanced error handling for API calls
export const handleSupabaseError = (error: any) => {
  if (!hasSupabaseConfig) {
    return "Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.";
  }
  if (error?.code === "PGRST116") {
    return "No data found";
  }
  if (error?.code === "PGRST301") {
    return "Invalid input data";
  }
  if (error?.code === "23505") {
    return "This record already exists";
  }
  if (error?.code === "23503") {
    return "Referenced record not found";
  }
  return error?.message || "An unexpected error occurred";
};

// Connection health check
export const checkConnection = async (): Promise<{
  connected: boolean;
  error?: string;
}> => {
  if (!hasSupabaseConfig) {
    return {
      connected: false,
      error:
        "Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.",
    };
  }

  try {
    const { error } = await supabase
      .from("system_config")
      .select("id")
      .limit(1);

    if (error) {
      return { connected: false, error: handleSupabaseError(error) };
    }

    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Connection failed",
    };
  }
};

// Auth helpers
export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

// Type-safe query helpers
export const safeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
): Promise<{ data: T | null; error: string | null; success: boolean }> => {
  try {
    const result = await queryFn();

    if (result.error) {
      return {
        data: null,
        error: handleSupabaseError(result.error),
        success: false,
      };
    }

    return {
      data: result.data,
      error: null,
      success: true,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown error",
      success: false,
    };
  }
};

// Real-time subscription helper
export const createSubscription = (
  table: string,
  callback: (payload: any) => void,
  filter?: string,
) => {
  const channel = supabase
    .channel(`${table}-changes`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table,
        filter,
      },
      callback,
    )
    .subscribe();

  return () => channel.unsubscribe();
};

export default supabase;
