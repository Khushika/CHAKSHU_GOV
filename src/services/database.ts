/**
 * Comprehensive Database Service
 * Centralized service layer for all Supabase database operations
 */

import { supabase, isDemoMode } from "@/integrations/supabase/client";
import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";
import { toast } from "@/hooks/use-toast";
import { cacheService } from "./cache-service";

// Type aliases for convenience - using fraud_reports table
type FraudReport = {
  id: string;
  user_id: string;
  report_type: string;
  fraudulent_number: string;
  incident_date: string;
  incident_time?: string;
  description: string;
  fraud_category: string;
  evidence_urls?: string[];
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  // Additional fields that might be available
  amount_involved?: number;
  contact_info?: any;
  location_info?: any;
  authority_action?: string;
  authority_comments?: string;
};

type FraudReportInsert = {
  user_id: string;
  report_type: string;
  fraudulent_number: string;
  incident_date: string;
  incident_time?: string;
  description: string;
  fraud_category: string;
  evidence_urls?: string[];
  status?: string;
  priority?: string;
  amount_involved?: number;
  contact_info?: any;
  location_info?: any;
};

type FraudReportUpdate = Partial<FraudReportInsert>;

// Keep legacy names for compatibility
type Report = FraudReport;
type ReportInsert = FraudReportInsert;
type ReportUpdate = FraudReportUpdate;

type Notification = Tables<"notifications">;
type NotificationInsert = TablesInsert<"notifications">;

type UserProfile = Tables<"user_profiles">;
type UserProfileInsert = TablesInsert<"user_profiles">;
type UserProfileUpdate = TablesUpdate<"user_profiles">;

type CommunityInteraction = Tables<"community_interactions">;
type CommunityInteractionInsert = TablesInsert<"community_interactions">;

type ReportEvidence = Tables<"report_evidence">;
type ReportEvidenceInsert = TablesInsert<"report_evidence">;

type SupportTicket = Tables<"support_tickets">;
type SupportTicketInsert = TablesInsert<"support_tickets">;

type EducationArticle = Tables<"education_articles">;
type FAQ = Tables<"faqs">;

// Generic response type
interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
  message?: string;
}

/**
 * Base Database Service Class
 */
class DatabaseService {
  /**
   * Generic query executor with error handling
   */
  protected async executeQuery<T>(
    queryFn: () => Promise<any>,
    operation: string,
  ): Promise<ServiceResponse<T>> {
    try {
      if (isDemoMode) {
        console.log(`Demo mode: ${operation} operation simulated`);
        return {
          data: null,
          error: "Demo mode - database operations are simulated",
          success: false,
          message: "Database operations are disabled in demo mode",
        };
      }

      const response = await queryFn();

      if (response.error) {
        // Enhanced error logging with proper serialization
        console.error(`Database ${operation} error:`, {
          message: response.error.message,
          details: response.error.details,
          hint: response.error.hint,
          code: response.error.code,
          full_error: JSON.stringify(response.error, null, 2),
          operation: operation,
        });

        // Provide user-friendly error messages for common issues
        let userFriendlyMessage =
          response.error.message || `Failed to ${operation}`;

        if (response.error.message?.includes("infinite recursion")) {
          // Log detailed instructions for developers
          console.error(
            "🚨 INFINITE RECURSION IN DATABASE POLICIES DETECTED 🚨",
          );
          console.error("");
          console.error("IMMEDIATE ACTION REQUIRED:");
          console.error("1. Go to Supabase Dashboard → SQL Editor");
          console.error("2. Run this quick fix SQL:");
          console.error("");
          console.error(
            "CREATE OR REPLACE FUNCTION public.is_admin_user(user_id uuid)",
          );
          console.error("RETURNS boolean AS $$");
          console.error(
            "SELECT COALESCE((SELECT user_role IN ('admin', 'moderator') FROM public.users WHERE id = user_id), false);",
          );
          console.error("$$ LANGUAGE sql STABLE SECURITY DEFINER;");
          console.error("");
          console.error(
            'DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;',
          );
          console.error(
            'DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;',
          );
          console.error("");
          console.error(
            'CREATE POLICY "Users can view their own profile" ON public.users',
          );
          console.error(
            "FOR SELECT USING (auth.uid()::text = id::text OR public.is_admin_user(auth.uid()));",
          );
          console.error("");
          console.error(
            'CREATE POLICY "Admins can manage all users" ON public.users',
          );
          console.error("FOR ALL USING (public.is_admin_user(auth.uid()));");
          console.error("");
          console.error(
            "GRANT EXECUTE ON FUNCTION public.is_admin_user(uuid) TO authenticated;",
          );
          console.error("");
          console.error("3. Refresh the page and try again");
          console.error("");

          userFriendlyMessage =
            "Database configuration issue detected. Please contact support.";
        } else if (
          response.error.message?.includes("JWT") ||
          response.error.message?.includes("auth")
        ) {
          userFriendlyMessage = "Authentication required. Please log in again.";
        } else if (
          response.error.message?.includes("permission denied") ||
          response.error.message?.includes("policy")
        ) {
          userFriendlyMessage =
            "Access denied. You don't have permission to perform this action.";
        } else if (response.error.message?.includes("connection")) {
          userFriendlyMessage = "Database connection error. Please try again.";
        }

        return {
          data: null,
          error: userFriendlyMessage,
          success: false,
        };
      }

      return {
        data: response.data,
        error: null,
        success: true,
        message: `${operation} completed successfully`,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Unknown error during ${operation}`;

      console.error(`Database ${operation} exception:`, {
        message,
        operation,
        stack: error instanceof Error ? error.stack : undefined,
        full_error:
          error instanceof Error
            ? JSON.stringify(
                {
                  name: error.name,
                  message: error.message,
                  stack: error.stack,
                },
                null,
                2,
              )
            : String(error),
        error_type: typeof error,
        error_constructor: error?.constructor?.name,
      });

      return {
        data: null,
        error: message,
        success: false,
      };
    }
  }

  /**
   * Check database connection health
   */
  async healthCheck(): Promise<ServiceResponse<boolean>> {
    return this.executeQuery(async () => {
      // First try the health check function that doesn't trigger RLS
      try {
        const result = await supabase.rpc("database_health_check");
        return { data: result.data || true, error: null };
      } catch (error) {
        // Fallback to simple query if function doesn't exist
        console.warn("Health check function not available, using fallback");
        return await supabase.from("fraud_reports").select("id").limit(1);
      }
    }, "health check");
  }
}

/**
 * Reports Service
 */
class ReportsService extends DatabaseService {
  /**
   * Get all reports with optional filtering
   */
  async getAll(
    filters: {
      status?: string;
      fraud_category?: string;
      user_id?: string;
      date_from?: string;
      date_to?: string;
    } = {},
    page: number = 1,
    limit: number = 10,
  ): Promise<ServiceResponse<{ reports: Report[]; total: number }>> {
    const offset = (page - 1) * limit;

    return this.executeQuery(async () => {
      let query = supabase
        .from("fraud_reports")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.fraud_category) {
        query = query.eq("fraud_category", filters.fraud_category);
      }
      if (filters.user_id) {
        query = query.eq("user_id", filters.user_id);
      }
      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte("created_at", filters.date_to);
      }

      const result = await query;

      return {
        data: {
          reports: result.data || [],
          total: result.count || 0,
        },
        error: result.error,
      };
    }, "fetch reports");
  }

  /**
   * Get report by ID
   */
  async getById(id: string): Promise<ServiceResponse<Report>> {
    return this.executeQuery(
      () => supabase.from("fraud_reports").select("*").eq("id", id).single(),
      "fetch report",
    );
  }

  /**
   * Create new report
   */
  async create(report: ReportInsert): Promise<ServiceResponse<Report>> {
    return this.executeQuery(async () => {
      // First try to create the report normally
      let result = await supabase
        .from("fraud_reports")
        .insert(report)
        .select()
        .single();

      // If it fails due to foreign key constraint (user doesn't exist)
      if (result.error && result.error.message?.includes("user_id_fkey")) {
        console.log(
          "Foreign key constraint failed, trying to create user first...",
        );
        console.log("Original error details:", {
          message: result.error.message,
          details: result.error.details,
          hint: result.error.hint,
          code: result.error.code,
        });

        // Try to create a minimal user record with better error handling
        try {
          const userInsertResult = await supabase.from("users").upsert(
            {
              id: report.user_id,
              email: "user@example.com", // Placeholder
              full_name: "User",
              user_role: "citizen",
              is_verified: false,
              is_banned: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            {
              onConflict: "id",
              ignoreDuplicates: true,
            },
          );

          if (userInsertResult.error) {
            console.warn("Could not create user record - Full error:", {
              message: userInsertResult.error.message,
              details: userInsertResult.error.details,
              hint: userInsertResult.error.hint,
              code: userInsertResult.error.code,
              error: userInsertResult.error,
            });

            // If user creation fails, try creating the report without foreign key dependency
            console.log(
              "Attempting to create report with relaxed constraints...",
            );

            // Try using a stored procedure or RPC if available
            const fallbackResult = await supabase.rpc(
              "create_report_without_user_constraint",
              {
                p_user_id: report.user_id,
                p_report_type: report.report_type,
                p_fraudulent_number: report.fraudulent_number,
                p_incident_date: report.incident_date,
                p_incident_time: report.incident_time,
                p_description: report.description,
                p_fraud_category: report.fraud_category,
                p_evidence_urls: report.evidence_urls || [],
                p_status: report.status || "pending",
                p_priority: report.priority || "medium",
              },
            );

            if (fallbackResult.error) {
              console.warn("Fallback RPC also failed:", fallbackResult.error);
              // Return the configuration error message
              return {
                data: null,
                error: {
                  ...result.error,
                  message: `Database configuration issue: Please apply the simple database fix. The foreign key constraint prevents report creation. Original error: ${result.error.message}`,
                },
              };
            } else {
              console.log("Fallback report creation succeeded!");
              return {
                data: fallbackResult.data,
                error: null,
              };
            }
          } else {
            console.log(
              "Created minimal user record, retrying report creation...",
            );
            // Retry the report creation
            result = await supabase
              .from("fraud_reports")
              .insert(report)
              .select()
              .single();

            if (result.error) {
              console.error(
                "Report creation still failed after user creation:",
                {
                  message: result.error.message,
                  details: result.error.details,
                  hint: result.error.hint,
                  code: result.error.code,
                },
              );
            }
          }
        } catch (userCreationError) {
          console.error("Exception during user creation:", userCreationError);
          return {
            data: null,
            error: {
              ...result.error,
              message: `Failed to create user account. Please ensure database migration is applied. Error: ${result.error.message}`,
            },
          };
        }
      }

      return result;
    }, "create report");
  }

  /**
   * Update report
   */
  async update(
    id: string,
    updates: ReportUpdate,
  ): Promise<ServiceResponse<Report>> {
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return this.executeQuery(
      () =>
        supabase
          .from("fraud_reports")
          .update(updateData)
          .eq("id", id)
          .select()
          .single(),
      "update report",
    );
  }

  /**
   * Delete report
   */
  async delete(id: string): Promise<ServiceResponse<boolean>> {
    return this.executeQuery(
      () => supabase.from("fraud_reports").delete().eq("id", id),
      "delete report",
    );
  }

  /**
   * Get user's reports
   */
  async getUserReports(userId: string): Promise<ServiceResponse<Report[]>> {
    if (!userId) {
      return {
        data: [],
        error: "User ID is required",
        success: false,
        message: "No user ID provided",
      };
    }

    const cacheKey = `user_reports_${userId}`;

    return this.executeQuery(async () => {
      // Retry mechanism for network failures
      const maxRetries = 3;
      let lastError: any = null;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          console.log(
            `Attempting to fetch user reports (attempt ${attempt}/${maxRetries})`,
          );

          // Try to get reports with RLS policies
          const result = await supabase
            .from("fraud_reports")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

          // If successful, cache and return
          if (!result.error) {
            console.log(
              `✅ Successfully fetched ${result.data?.length || 0} reports`,
            );
            // Cache the successful result
            cacheService.set(cacheKey, result.data, 2 * 60 * 1000); // Cache for 2 minutes
            return result;
          }

          lastError = result.error;

          // If it's a network error, retry
          if (
            result.error.message?.includes("Failed to fetch") ||
            result.error.message?.includes("NetworkError") ||
            result.error.message?.includes("fetch")
          ) {
            if (attempt < maxRetries) {
              console.warn(
                `Network error on attempt ${attempt}, retrying in ${attempt * 1000}ms...`,
              );
              await new Promise((resolve) =>
                setTimeout(resolve, attempt * 1000),
              );
              continue;
            }
          }

          // If it's not a network error, don't retry
          break;
        } catch (error) {
          lastError = error;
          console.error(`Exception on attempt ${attempt}:`, error);

          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
            continue;
          }
        }
      }

      // All retries failed, process the error
      const result = { error: lastError, data: null };

      // If there's a policy error, provide helpful feedback
      if (result.error) {
        // Enhanced error logging with proper serialization
        const errorDetails = {
          message: result.error?.message || "Unknown error",
          details: result.error?.details || null,
          hint: result.error?.hint || null,
          code: result.error?.code || null,
          status: result.error?.status || null,
          statusText: result.error?.statusText || null,
        };

        console.error("Database fetch user reports error:", errorDetails);
        console.error("Full error object:", result.error);

        // Check for network/connection errors
        if (
          result.error.message?.includes("Failed to fetch") ||
          result.error.message?.includes("NetworkError") ||
          result.error.message?.includes("fetch")
        ) {
          throw new Error(
            "Network connection failed. Please check your internet connection and try again.",
          );
        }

        // Check for specific RLS policy errors
        if (
          result.error.message?.includes("infinite recursion") ||
          result.error.message?.includes("policy")
        ) {
          throw new Error(
            "Database configuration error. Please contact support.",
          );
        }

        // Check for authentication errors
        if (
          result.error.message?.includes("JWT") ||
          result.error.message?.includes("auth")
        ) {
          throw new Error("Authentication required. Please log in again.");
        }

        // Check for CORS or network issues
        if (
          result.error.message?.includes("CORS") ||
          result.error.message?.includes("Access-Control")
        ) {
          throw new Error(
            "Network configuration error. Please try again or contact support.",
          );
        }

        // Try to return cached data as fallback
        const cachedData = cacheService.get<Report[]>(cacheKey);
        if (cachedData) {
          console.warn(
            "Database failed, returning cached data:",
            cachedData.length,
            "reports",
          );
          return {
            data: cachedData,
            error: null,
          };
        }

        throw new Error(result.error.message || "Failed to fetch reports");
      }

      return result;
    }, "fetch user reports");
  }

  /**
   * Get report statistics
   */
  async getStats(): Promise<
    ServiceResponse<{
      total: number;
      pending: number;
      resolved: number;
      rejected: number;
      byFraudCategory: Record<string, number>;
    }>
  > {
    return this.executeQuery(async () => {
      const result = await supabase
        .from("fraud_reports")
        .select("status, fraud_category");

      if (result.error) return result;

      const reports = result.data || [];
      const stats = {
        total: reports.length,
        pending: reports.filter((r) => r.status === "pending").length,
        resolved: reports.filter((r) => r.status === "resolved").length,
        rejected: reports.filter((r) => r.status === "rejected").length,
        byFraudCategory: {} as Record<string, number>,
      };

      // Calculate fraud category distribution
      reports.forEach((report) => {
        stats.byFraudCategory[report.fraud_category] =
          (stats.byFraudCategory[report.fraud_category] || 0) + 1;
      });

      return { data: stats, error: null };
    }, "fetch report statistics");
  }
}

/**
 * User Profiles Service
 */
class UserProfilesService extends DatabaseService {
  /**
   * Get user profile
   */
  async getProfile(userId: string): Promise<ServiceResponse<UserProfile>> {
    return this.executeQuery(
      () =>
        supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", userId)
          .single(),
      "fetch user profile",
    );
  }

  /**
   * Create or update user profile
   */
  async upsertProfile(
    profile: UserProfileInsert | UserProfileUpdate,
  ): Promise<ServiceResponse<UserProfile>> {
    return this.executeQuery(
      () => supabase.from("user_profiles").upsert(profile).select().single(),
      "upsert user profile",
    );
  }

  /**
   * Update profile picture
   */
  async updateProfilePicture(
    userId: string,
    pictureUrl: string,
  ): Promise<ServiceResponse<UserProfile>> {
    return this.executeQuery(
      () =>
        supabase
          .from("user_profiles")
          .update({
            profile_picture_url: pictureUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single(),
      "update profile picture",
    );
  }
}

/**
 * Notifications Service
 */
class NotificationsService extends DatabaseService {
  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    limit: number = 50,
  ): Promise<ServiceResponse<Notification[]>> {
    return this.executeQuery(
      () =>
        supabase
          .from("notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(limit),
      "fetch notifications",
    );
  }

  /**
   * Create notification
   */
  async create(
    notification: NotificationInsert,
  ): Promise<ServiceResponse<Notification>> {
    return this.executeQuery(
      () =>
        supabase.from("notifications").insert(notification).select().single(),
      "create notification",
    );
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<ServiceResponse<Notification>> {
    return this.executeQuery(
      () =>
        supabase
          .from("notifications")
          .update({ read: true })
          .eq("id", id)
          .select()
          .single(),
      "mark notification as read",
    );
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<ServiceResponse<boolean>> {
    return this.executeQuery(
      () =>
        supabase
          .from("notifications")
          .update({ read: true })
          .eq("user_id", userId),
      "mark all notifications as read",
    );
  }

  /**
   * Delete notification
   */
  async delete(id: string): Promise<ServiceResponse<boolean>> {
    return this.executeQuery(
      () => supabase.from("notifications").delete().eq("id", id),
      "delete notification",
    );
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string): Promise<ServiceResponse<number>> {
    return this.executeQuery(async () => {
      const result = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false);

      return { data: result.count || 0, error: result.error };
    }, "fetch unread count");
  }
}

/**
 * Community Interactions Service
 */
class CommunityInteractionsService extends DatabaseService {
  /**
   * Get interactions for a report
   */
  async getReportInteractions(
    reportId: string,
  ): Promise<ServiceResponse<CommunityInteraction[]>> {
    return this.executeQuery(
      () =>
        supabase
          .from("community_interactions")
          .select("*")
          .eq("report_id", reportId)
          .order("created_at", { ascending: false }),
      "fetch report interactions",
    );
  }

  /**
   * Create interaction
   */
  async create(
    interaction: CommunityInteractionInsert,
  ): Promise<ServiceResponse<CommunityInteraction>> {
    return this.executeQuery(
      () =>
        supabase
          .from("community_interactions")
          .insert(interaction)
          .select()
          .single(),
      "create interaction",
    );
  }

  /**
   * Update interaction
   */
  async update(
    id: string,
    content: string,
  ): Promise<ServiceResponse<CommunityInteraction>> {
    return this.executeQuery(
      () =>
        supabase
          .from("community_interactions")
          .update({
            content,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single(),
      "update interaction",
    );
  }

  /**
   * Delete interaction
   */
  async delete(id: string): Promise<ServiceResponse<boolean>> {
    return this.executeQuery(
      () => supabase.from("community_interactions").delete().eq("id", id),
      "delete interaction",
    );
  }

  /**
   * Get user's interactions
   */
  async getUserInteractions(
    userId: string,
  ): Promise<ServiceResponse<CommunityInteraction[]>> {
    return this.executeQuery(
      () =>
        supabase
          .from("community_interactions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      "fetch user interactions",
    );
  }
}

/**
 * Evidence Service
 */
class EvidenceService extends DatabaseService {
  /**
   * Get report evidence
   */
  async getReportEvidence(
    reportId: string,
  ): Promise<ServiceResponse<ReportEvidence[]>> {
    return this.executeQuery(
      () =>
        supabase
          .from("report_evidence")
          .select("*")
          .eq("report_id", reportId)
          .order("uploaded_at", { ascending: false }),
      "fetch report evidence",
    );
  }

  /**
   * Upload evidence file
   */
  async uploadFile(
    file: File,
    reportId: string,
    userId: string,
  ): Promise<ServiceResponse<{ fileUrl: string; evidence: ReportEvidence }>> {
    try {
      if (isDemoMode) {
        return {
          data: null,
          error: "File upload not available in demo mode",
          success: false,
        };
      }

      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${reportId}/${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("evidence-files")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("evidence-files").getPublicUrl(fileName);

      // Save evidence record
      const evidenceData: ReportEvidenceInsert = {
        report_id: reportId,
        file_name: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        file_type: fileExt || null,
        mime_type: file.type || null,
        uploaded_by: userId,
      };

      const { data: evidence, error: evidenceError } = await supabase
        .from("report_evidence")
        .insert(evidenceData)
        .select()
        .single();

      if (evidenceError) throw evidenceError;

      return {
        data: {
          fileUrl: publicUrl,
          evidence: evidence,
        },
        error: null,
        success: true,
        message: "File uploaded successfully",
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "File upload failed";
      return {
        data: null,
        error: message,
        success: false,
      };
    }
  }

  /**
   * Delete evidence
   */
  async delete(id: string): Promise<ServiceResponse<boolean>> {
    return this.executeQuery(async () => {
      // Get evidence record first
      const { data: evidence, error: fetchError } = await supabase
        .from("report_evidence")
        .select("file_path")
        .eq("id", id)
        .single();

      if (fetchError) return { error: fetchError };

      // Delete file from storage
      if (evidence) {
        await supabase.storage
          .from("evidence-files")
          .remove([evidence.file_path]);
      }

      // Delete evidence record
      return await supabase.from("report_evidence").delete().eq("id", id);
    }, "delete evidence");
  }
}

/**
 * Support Tickets Service
 */
class SupportTicketsService extends DatabaseService {
  /**
   * Get user's support tickets
   */
  async getUserTickets(
    userId: string,
  ): Promise<ServiceResponse<SupportTicket[]>> {
    return this.executeQuery(
      () =>
        supabase
          .from("support_tickets")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      "fetch user tickets",
    );
  }

  /**
   * Create support ticket
   */
  async create(
    ticket: SupportTicketInsert,
  ): Promise<ServiceResponse<SupportTicket>> {
    return this.executeQuery(
      () => supabase.from("support_tickets").insert(ticket).select().single(),
      "create support ticket",
    );
  }

  /**
   * Update ticket status
   */
  async updateStatus(
    id: string,
    status: string,
  ): Promise<ServiceResponse<SupportTicket>> {
    return this.executeQuery(
      () =>
        supabase
          .from("support_tickets")
          .update({
            status,
            updated_at: new Date().toISOString(),
            resolved_at:
              status === "resolved" ? new Date().toISOString() : null,
          })
          .eq("id", id)
          .select()
          .single(),
      "update ticket status",
    );
  }
}

/**
 * Education Service
 */
class EducationService extends DatabaseService {
  /**
   * Get published articles
   */
  async getPublishedArticles(
    category?: string,
    limit: number = 20,
  ): Promise<ServiceResponse<EducationArticle[]>> {
    return this.executeQuery(() => {
      let query = supabase
        .from("education_articles")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(limit);

      if (category) {
        query = query.eq("category", category);
      }

      return query;
    }, "fetch education articles");
  }

  /**
   * Get featured articles
   */
  async getFeaturedArticles(): Promise<ServiceResponse<EducationArticle[]>> {
    return this.executeQuery(
      () =>
        supabase
          .from("education_articles")
          .select("*")
          .eq("is_published", true)
          .eq("featured", true)
          .order("published_at", { ascending: false })
          .limit(5),
      "fetch featured articles",
    );
  }

  /**
   * Get article by ID
   */
  async getArticleById(id: string): Promise<ServiceResponse<EducationArticle>> {
    return this.executeQuery(
      () =>
        supabase.from("education_articles").select("*").eq("id", id).single(),
      "fetch article",
    );
  }

  /**
   * Increment article view count
   */
  async incrementViewCount(id: string): Promise<ServiceResponse<boolean>> {
    return this.executeQuery(
      () => supabase.rpc("increment_article_views", { article_id: id }),
      "increment article views",
    );
  }
}

/**
 * FAQ Service
 */
class FAQService extends DatabaseService {
  /**
   * Get all FAQs
   */
  async getAll(category?: string): Promise<ServiceResponse<FAQ[]>> {
    return this.executeQuery(() => {
      let query = supabase
        .from("faqs")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });

      if (category) {
        query = query.eq("category", category);
      }

      return query;
    }, "fetch FAQs");
  }

  /**
   * Get featured FAQs
   */
  async getFeatured(): Promise<ServiceResponse<FAQ[]>> {
    return this.executeQuery(
      () =>
        supabase
          .from("faqs")
          .select("*")
          .eq("is_featured", true)
          .order("priority", { ascending: false })
          .limit(10),
      "fetch featured FAQs",
    );
  }

  /**
   * Search FAQs
   */
  async search(query: string): Promise<ServiceResponse<FAQ[]>> {
    return this.executeQuery(
      () =>
        supabase
          .from("faqs")
          .select("*")
          .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
          .order("priority", { ascending: false }),
      "search FAQs",
    );
  }
}

/**
 * Real-time Subscriptions Service
 */
class RealtimeService {
  private subscriptions: Map<string, any> = new Map();

  /**
   * Subscribe to report updates
   */
  subscribeToReports(callback: (payload: any) => void, userId?: string) {
    if (isDemoMode) {
      console.log("Real-time subscriptions not available in demo mode");
      return () => {};
    }

    let channel = supabase
      .channel("fraud-reports-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fraud_reports",
          filter: userId ? `user_id=eq.${userId}` : undefined,
        },
        callback,
      )
      .subscribe();

    this.subscriptions.set("fraud_reports", channel);

    return () => {
      channel.unsubscribe();
      this.subscriptions.delete("fraud_reports");
    };
  }

  /**
   * Subscribe to notification updates
   */
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    if (isDemoMode) {
      console.log("Real-time subscriptions not available in demo mode");
      return () => {};
    }

    let channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        callback,
      )
      .subscribe();

    this.subscriptions.set("notifications", channel);

    return () => {
      channel.unsubscribe();
      this.subscriptions.delete("notifications");
    };
  }

  /**
   * Subscribe to community interactions
   */
  subscribeToCommunityInteractions(
    reportId: string,
    callback: (payload: any) => void,
  ) {
    if (isDemoMode) {
      console.log("Real-time subscriptions not available in demo mode");
      return () => {};
    }

    let channel = supabase
      .channel("community-interactions-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "community_interactions",
          filter: `report_id=eq.${reportId}`,
        },
        callback,
      )
      .subscribe();

    this.subscriptions.set(`community-${reportId}`, channel);

    return () => {
      channel.unsubscribe();
      this.subscriptions.delete(`community-${reportId}`);
    };
  }

  /**
   * Unsubscribe from all channels
   */
  unsubscribeAll() {
    this.subscriptions.forEach((channel) => {
      channel.unsubscribe();
    });
    this.subscriptions.clear();
  }
}

// Export service instances
export const reportsService = new ReportsService();
export const userProfilesService = new UserProfilesService();
export const notificationsService = new NotificationsService();
export const communityService = new CommunityInteractionsService();
export const evidenceService = new EvidenceService();
export const supportTicketsService = new SupportTicketsService();
export const educationService = new EducationService();
export const faqService = new FAQService();
export const realtimeService = new RealtimeService();

// Export database service for health checks
export const databaseService = new DatabaseService();

// Export types for use in components
export type {
  Report,
  ReportInsert,
  ReportUpdate,
  UserProfile,
  UserProfileInsert,
  UserProfileUpdate,
  Notification,
  NotificationInsert,
  CommunityInteraction,
  CommunityInteractionInsert,
  ReportEvidence,
  ReportEvidenceInsert,
  SupportTicket,
  SupportTicketInsert,
  EducationArticle,
  FAQ,
  ServiceResponse,
};
