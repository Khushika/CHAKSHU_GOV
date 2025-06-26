/**
 * Authentication Service
 * Handles user authentication and profile management
 */

import { supabase, handleSupabaseError } from "@/integrations/supabase/client";
import { userProfilesService } from "./database";
import type { User } from "@supabase/supabase-js";
import type { UserProfile, UserProfileInsert } from "./database";

export interface AuthUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  created_at: string;
  profile?: UserProfile;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName?: string;
  phone?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  error: string | null;
  success: boolean;
}

class AuthService {
  /**
   * Sign up a new user with profile creation
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (authError) {
        return {
          user: null,
          error: handleSupabaseError(authError),
          success: false,
        };
      }

      if (!authData.user) {
        return {
          user: null,
          error: "User creation failed",
          success: false,
        };
      }

      // Create user profile
      const profileData: UserProfileInsert = {
        user_id: authData.user.id,
        email: data.email,
        full_name: data.fullName || null,
        phone_number: data.phone || null,
        email_verified: false,
        profile_completed: false,
      };

      const profileResult =
        await userProfilesService.upsertProfile(profileData);

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          email_confirmed_at: authData.user.email_confirmed_at,
          created_at: authData.user.created_at,
          profile: profileResult.data || undefined,
        },
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : "Sign up failed",
        success: false,
      };
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });

      if (authError) {
        return {
          user: null,
          error: handleSupabaseError(authError),
          success: false,
        };
      }

      if (!authData.user) {
        return {
          user: null,
          error: "Sign in failed",
          success: false,
        };
      }

      // Get user profile
      const profileResult = await userProfilesService.getProfile(
        authData.user.id,
      );

      return {
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          email_confirmed_at: authData.user.email_confirmed_at,
          created_at: authData.user.created_at,
          profile: profileResult.data || undefined,
        },
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        user: null,
        error: error instanceof Error ? error.message : "Sign in failed",
        success: false,
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: string | null; success: boolean }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          error: handleSupabaseError(error),
          success: false,
        };
      }

      return {
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Sign out failed",
        success: false,
      };
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        return {
          user: null,
          error: handleSupabaseError(error),
          success: false,
        };
      }

      if (!user) {
        return {
          user: null,
          error: "No authenticated user",
          success: false,
        };
      }

      // Get user profile
      const profileResult = await userProfilesService.getProfile(user.id);

      return {
        user: {
          id: user.id,
          email: user.email!,
          email_confirmed_at: user.email_confirmed_at,
          created_at: user.created_at,
          profile: profileResult.data || undefined,
        },
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        user: null,
        error:
          error instanceof Error ? error.message : "Failed to get current user",
        success: false,
      };
    }
  }

  /**
   * Reset password
   */
  async resetPassword(
    email: string,
  ): Promise<{ error: string | null; success: boolean }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return {
          error: handleSupabaseError(error),
          success: false,
        };
      }

      return {
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Password reset failed",
        success: false,
      };
    }
  }

  /**
   * Update password
   */
  async updatePassword(
    newPassword: string,
  ): Promise<{ error: string | null; success: boolean }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return {
          error: handleSupabaseError(error),
          success: false,
        };
      }

      return {
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        error:
          error instanceof Error ? error.message : "Password update failed",
        success: false,
      };
    }
  }

  /**
   * Update email
   */
  async updateEmail(
    newEmail: string,
  ): Promise<{ error: string | null; success: boolean }> {
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) {
        return {
          error: handleSupabaseError(error),
          success: false,
        };
      }

      return {
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Email update failed",
        success: false,
      };
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profileResult = await userProfilesService.getProfile(
          session.user.id,
        );

        callback({
          id: session.user.id,
          email: session.user.email!,
          email_confirmed_at: session.user.email_confirmed_at,
          created_at: session.user.created_at,
          profile: profileResult.data || undefined,
        });
      } else {
        callback(null);
      }
    });
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return !!user;
    } catch {
      return false;
    }
  }

  /**
   * Get session information
   */
  async getSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        return { session: null, error: handleSupabaseError(error) };
      }

      return { session, error: null };
    } catch (error) {
      return {
        session: null,
        error: error instanceof Error ? error.message : "Failed to get session",
      };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export types
export type { AuthUser, SignUpData, SignInData, AuthResponse };
