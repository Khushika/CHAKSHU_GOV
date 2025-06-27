/**
 * User Service
 * Handles user account creation and verification for database operations
 */

import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

interface UserCreationResult {
  success: boolean;
  error?: string;
  created?: boolean;
}

/**
 * Ensures a user exists in the database, creating them if necessary
 */
export async function ensureUserExists(
  authUser: User,
): Promise<UserCreationResult> {
  try {
    console.log("Ensuring user exists for:", authUser.id);

    // Use upsert to either create or update the user - this handles RLS better
    const { data, error: upsertError } = await supabase
      .from("users")
      .upsert(
        {
          id: authUser.id,
          email: authUser.email || "",
          full_name:
            authUser.user_metadata?.full_name ||
            authUser.user_metadata?.name ||
            authUser.email?.split("@")[0] ||
            "User",
          phone_number: authUser.user_metadata?.phone_number || null,
          user_role: "citizen",
          is_verified: !!authUser.email_confirmed_at,
          is_banned: false,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
          ignoreDuplicates: false,
        },
      )
      .select()
      .single();

    if (upsertError) {
      console.error("Failed to upsert user - Full error details:", {
        message: upsertError.message,
        details: upsertError.details,
        hint: upsertError.hint,
        code: upsertError.code,
        error: upsertError,
      });

      // If upsert fails due to RLS, try a different approach
      if (
        upsertError.message?.includes("row-level security") ||
        upsertError.message?.includes("policy") ||
        upsertError.message?.includes("permission denied")
      ) {
        console.log(
          "RLS policy preventing user creation, trying workaround...",
        );

        // Try to just verify the user exists in auth.users
        const { data: authUserData } = await supabase.auth.getUser();

        if (!authUserData.user || authUserData.user.id !== authUser.id) {
          return {
            success: false,
            error:
              "Authentication session invalid. Please log out and log back in.",
          };
        }

        // If we can't create the user due to RLS, we'll proceed anyway
        // The auth user exists, which is what matters for authentication
        console.log(
          "Proceeding without database user record due to RLS restrictions",
        );
        return {
          success: true,
          created: false,
          error: "User creation skipped due to database restrictions",
        };
      }

      return {
        success: false,
        error: `Failed to create/update user account: ${upsertError.message}`,
      };
    }

    console.log("User record upserted successfully");
    return { success: true, created: !data };
  } catch (error) {
    console.error("Unexpected error in ensureUserExists:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Updates user information if needed
 */
export async function updateUserInfo(
  authUser: User,
): Promise<UserCreationResult> {
  try {
    const { error } = await supabase
      .from("users")
      .update({
        email: authUser.email || "",
        full_name:
          authUser.user_metadata?.full_name ||
          authUser.user_metadata?.name ||
          authUser.email?.split("@")[0] ||
          "User",
        phone_number: authUser.user_metadata?.phone_number || null,
        is_verified: !!authUser.email_confirmed_at,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authUser.id);

    if (error) {
      console.error("Failed to update user:", error);
      return {
        success: false,
        error: `Failed to update user: ${error.message}`,
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

/**
 * Checks if user has necessary permissions for a given action
 */
export async function checkUserPermissions(
  userId: string,
  action: string,
): Promise<boolean> {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("user_role, is_banned, is_verified")
      .eq("id", userId)
      .single();

    if (error || !user) {
      console.error("Failed to check user permissions:", error);
      return false;
    }

    // User is banned
    if (user.is_banned) {
      return false;
    }

    // For basic actions like creating reports, just need to not be banned
    if (action === "create_report") {
      return true;
    }

    // For admin actions
    if (action === "admin" && user.user_role !== "admin") {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking permissions:", error);
    return false;
  }
}
