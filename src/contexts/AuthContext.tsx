import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as SupabaseUser,
  Session,
  AuthError,
} from "@supabase/supabase-js";
import { supabase, isDemoMode } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type {
  AuthContextType,
  User,
  SignUpData,
  SignInData,
  AuthResponse,
  UpdatePasswordData,
} from "@/types/auth";

interface AuthProviderProps {
  children: React.ReactNode;
}

// Default context value to prevent undefined errors
const defaultAuthContext: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
  updatePassword: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
  deleteAccount: async () => ({ error: null }),
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => {
  const context = useContext(AuthContext);

  // Since we now have a default context, check if we're still in the default state
  if (context === defaultAuthContext) {
    console.warn(
      "useAuth: Using default context. Make sure component is wrapped with AuthProvider.",
    );
  }

  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert Supabase user to our User type
  const convertUser = (supabaseUser: SupabaseUser | null): User | null => {
    if (!supabaseUser) return null;

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      full_name: supabaseUser.user_metadata?.full_name || "",
      phone_number: supabaseUser.user_metadata?.phone_number || "",
      user_role: supabaseUser.user_metadata?.user_role || "citizen",
      is_verified: supabaseUser.email_confirmed_at !== null,
      created_at: supabaseUser.created_at,
      updated_at: supabaseUser.updated_at || supabaseUser.created_at,
    };
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(convertUser(session?.user ?? null));
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(convertUser(session?.user ?? null));
      setLoading(false);

      if (event === "SIGNED_IN") {
        toast({
          title: "Welcome!",
          description: "You have been successfully logged in.",
        });
      } else if (event === "SIGNED_OUT") {
        toast({
          title: "Goodbye!",
          description: "You have been successfully logged out.",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
  ): Promise<AuthResponse> => {
    try {
      setLoading(true);

      // Handle demo mode
      if (isDemoMode) {
        toast({
          title: "Demo Mode Active",
          description:
            "Authentication service is not configured. Registration simulated successfully.",
          variant: "default",
        });

        // Simulate successful registration in demo mode
        setTimeout(() => {
          setUser({
            id: "demo-user-" + Date.now(),
            email: email,
            full_name: fullName,
            phone_number: "",
            user_role: "citizen",
            is_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }, 1000);

        return { error: null };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            user_role: "citizen",
          },
        },
      });

      if (error) {
        toast({
          title: "Registration Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      if (data.user && !data.session) {
        toast({
          title: "Registration Successful!",
          description: "Please check your email to verify your account.",
        });
      }

      return { error: null, data };
    } catch (error) {
      const authError = error as AuthError;
      console.error("Registration error:", authError);

      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });

      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    try {
      setLoading(true);

      // Handle demo mode
      if (isDemoMode) {
        toast({
          title: "Demo Mode Active",
          description:
            "Authentication service is not configured. Login simulated successfully.",
          variant: "default",
        });

        // Simulate successful login in demo mode
        setTimeout(() => {
          setUser({
            id: "demo-user-" + Date.now(),
            email: email,
            full_name: "Demo User",
            phone_number: "",
            user_role: "citizen",
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }, 1000);

        return { error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return { error: null, data };
    } catch (error) {
      const authError = error as AuthError;
      console.error("Login error:", authError);

      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });

      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Logout Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      // Handle demo mode
      if (isDemoMode) {
        toast({
          title: "Demo Mode Active",
          description: "Password reset simulated successfully in demo mode.",
          variant: "default",
        });
        return { error: null };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({
          title: "Password Reset Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Password Reset Link Sent",
        description: "Please check your email for the password reset link.",
      });

      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      console.error("Password reset error:", authError);

      toast({
        title: "Password Reset Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });

      return { error: authError };
    }
  };

  const updatePassword = async (
    data: UpdatePasswordData,
  ): Promise<AuthResponse> => {
    try {
      setLoading(true);

      if (isDemoMode) {
        toast({
          title: "Demo Mode Active",
          description: "Password update simulated successfully.",
          variant: "default",
        });
        return { error: null };
      }

      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) {
        toast({
          title: "Password Update Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });

      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      console.error("Password update error:", authError);

      toast({
        title: "Password Update Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });

      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<User>): Promise<AuthResponse> => {
    try {
      setLoading(true);

      if (isDemoMode) {
        toast({
          title: "Demo Mode Active",
          description: "Profile update simulated successfully.",
          variant: "default",
        });
        return { error: null };
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: data.full_name,
          phone_number: data.phone_number,
        },
      });

      if (error) {
        toast({
          title: "Profile Update Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      console.error("Profile update error:", authError);

      toast({
        title: "Profile Update Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });

      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = async (): Promise<AuthResponse> => {
    try {
      setLoading(true);

      if (isDemoMode) {
        toast({
          title: "Demo Mode Active",
          description: "Account deletion simulated successfully.",
          variant: "default",
        });
        return { error: null };
      }

      // Note: Supabase doesn't have a direct delete user method for client-side
      // This would typically be handled by a server-side function
      toast({
        title: "Account Deletion",
        description: "Please contact support to delete your account.",
        variant: "default",
      });

      return { error: null };
    } catch (error) {
      const authError = error as AuthError;
      console.error("Account deletion error:", authError);

      toast({
        title: "Account Deletion Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });

      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
