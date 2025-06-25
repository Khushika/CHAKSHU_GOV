import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase, isDemoMode } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: AuthError | null }>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
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
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuth = () => {
  const context = useContext(AuthContext);

  // Since we now have a default context, check if we're still in the default state
  // This could indicate the hook is being used outside the provider
  if (context === defaultAuthContext) {
    console.warn(
      "useAuth: Using default context. Make sure component is wrapped with AuthProvider.",
    );
  }

  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (event === "SIGNED_IN") {
        toast({
          title: "Welcome!",
          description: "You have been successfully logged in.",
        });
      } else if (event === "SIGNED_OUT") {
        toast({
          title: "Thank you!",
          description: "You have been successfully logged out.",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);

      // Handle demo mode
      if (isDemoMode) {
        // Simulate successful registration in demo mode
        setTimeout(() => {
          setUser({
            id: "demo-user-" + Date.now(),
            email: email,
            user_metadata: { full_name: fullName },
            app_metadata: {},
            aud: "authenticated",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as User);
        }, 1000);

        return { error: null };
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      // Check if it's a mock error (demo mode fallback)
      if (error && error.message === "Demo mode active") {
        toast({
          title: "Demo Mode Active",
          description:
            "Authentication service is unavailable. Registration simulated successfully.",
          variant: "default",
        });

        // Simulate successful registration in demo mode
        setTimeout(() => {
          setUser({
            id: "demo-user-" + Date.now(),
            email: email,
            user_metadata: { full_name: fullName },
            app_metadata: {},
            aud: "authenticated",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as User);
        }, 1000);

        return { error: null };
      }

      if (error) {
        toast({
          title: "Registration Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      toast({
        title: "Registration Successful!",
        description: "Please check your email to verify your account.",
      });

      return { error: null };
    } catch (error) {
      const authError = error as AuthError;

      // Handle network/fetch errors specifically
      if (error instanceof TypeError && error.message.includes("fetch")) {
        // Fallback to demo mode for network errors
        toast({
          title: "Demo Mode Active",
          description:
            "Network connection failed. Using demo mode - registration simulated successfully.",
          variant: "default",
        });

        // Simulate successful registration in demo mode
        setTimeout(() => {
          setUser({
            id: "demo-user-" + Date.now(),
            email: email,
            user_metadata: { full_name: fullName },
            app_metadata: {},
            aud: "authenticated",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as User);
        }, 1000);

        return { error: null };
      }

      return { error: authError };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
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
            user_metadata: { full_name: "Demo User" },
            app_metadata: {},
            aud: "authenticated",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as User);
        }, 1000);

        return { error: null };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Check if it's a mock error (demo mode fallback)
      if (error && error.message === "Demo mode active") {
        toast({
          title: "Demo Mode Active",
          description:
            "Authentication service is unavailable. Login simulated successfully.",
          variant: "default",
        });

        // Simulate successful login in demo mode
        setTimeout(() => {
          setUser({
            id: "demo-user-" + Date.now(),
            email: email,
            user_metadata: { full_name: "Demo User" },
            app_metadata: {},
            aud: "authenticated",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as User);
        }, 1000);

        return { error: null };
      }

      if (error) {
        toast({
          title: "Login Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      return { error: null };
    } catch (error) {
      const authError = error as AuthError;

      // Handle network/fetch errors specifically
      if (error instanceof TypeError && error.message.includes("fetch")) {
        // Fallback to demo mode for network errors
        toast({
          title: "Demo Mode Active",
          description:
            "Network connection failed. Using demo mode - login simulated successfully.",
          variant: "default",
        });

        // Simulate successful login in demo mode
        setTimeout(() => {
          setUser({
            id: "demo-user-" + Date.now(),
            email: email,
            user_metadata: { full_name: "Demo User" },
            app_metadata: {},
            aud: "authenticated",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as User);
        }, 1000);

        return { error: null };
      }

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

  const resetPassword = async (email: string) => {
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

      // Check if it's a mock error (demo mode fallback)
      if (error && error.message === "Demo mode active") {
        toast({
          title: "Demo Mode Active",
          description: "Password reset simulated successfully.",
          variant: "default",
        });

        return { error: null };
      }

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

      // Handle network/fetch errors specifically
      if (error instanceof TypeError && error.message.includes("fetch")) {
        // Fallback to demo mode for network errors
        toast({
          title: "Demo Mode Active",
          description:
            "Network connection failed. Password reset simulated successfully.",
          variant: "default",
        });

        return { error: null };
      }

      return { error: authError };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
