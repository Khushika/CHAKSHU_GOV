/**
 * Comprehensive Database Service
 * Centralized service layer for all Supabase database operations
 * Updated for fresh schema with full Supabase integration
 */

import {
  supabase,
  handleSupabaseError,
  safeQuery,
  isDemoMode,
} from "@/integrations/supabase/client";
import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "@/integrations/supabase/types";

// Type aliases for convenience
type Report = Tables<"reports">;
type ReportInsert = TablesInsert<"reports">;
type ReportUpdate = TablesUpdate<"reports">;

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
type FraudAlert = Tables<"fraud_alerts">;

// Enhanced response type
interface ServiceResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
  message?: string;
  count?: number;
}

/**
 * Base Database Service Class
 */
class DatabaseService {
  /**
   * Generic query executor with error handling - now uses safeQuery helper
   */
  protected async executeQuery<T>(
    queryFn: () => Promise<any>,
    operation: string,
  ): Promise<ServiceResponse<T>> {
    if (isDemoMode) {
      console.log(
        `Demo mode: ${operation} operation simulated (Supabase not configured)`,
      );
      return {
        data: null,
        error:
          "Supabase not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.",
        success: false,
        message: "Database operations require Supabase configuration",
      };
    }

    try {
      const result = await safeQuery(queryFn);

      return {
        data: result.data,
        error: result.error,
        success: result.success,
        message: result.success
          ? `${operation} completed successfully`
          : undefined,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Unknown error during ${operation}`;
      console.error(`Database ${operation} exception:`, error);

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
    return this.executeQuery(
      () => supabase.from("system_config").select("id").limit(1),
      "health check",
    );
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error: error ? handleSupabaseError(error) : null };
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
      fraud_type?: string;
      user_id?: string;
      city?: string;
      state?: string;
      date_from?: string;
      date_to?: string;
    } = {},
    page: number = 1,
    limit: number = 10,
  ): Promise<ServiceResponse<{ reports: Report[]; total: number }>> {
    const offset = (page - 1) * limit;

    return this.executeQuery(async () => {
      let query = supabase
        .from("reports")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.fraud_type) {
        query = query.eq("fraud_type", filters.fraud_type);
      }
      if (filters.user_id) {
        query = query.eq("user_id", filters.user_id);
      }
      if (filters.city) {
        query = query.eq("city", filters.city);
      }
      if (filters.state) {
        query = query.eq("state", filters.state);
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
      () => supabase.from("reports").select("*").eq("id", id).single(),
      "fetch report",
    );
  }

  /**
   * Create new report
   */
  async create(report: ReportInsert): Promise<ServiceResponse<Report>> {
    return this.executeQuery(
      () => supabase.from("reports").insert(report).select().single(),
      "create report",
    );
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
          .from("reports")
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
      () => supabase.from("reports").delete().eq("id", id),
      "delete report",
    );
  }

  /**
   * Get user's reports
   */
  async getUserReports(userId: string): Promise<ServiceResponse<Report[]>> {
    return this.executeQuery(
      () =>
        supabase
          .from("reports")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false }),
      "fetch user reports",
    );
  }

  /**
   * Get comprehensive report statistics
   */
  async getStats(): Promise<
    ServiceResponse<{
      total: number;
      pending: number;
      under_review: number;
      investigating: number;
      resolved: number;
      rejected: number;
      withdrawn: number;
      escalated: number;
      totalAmount: number;
      totalRecovered: number;
      avgAmount: number;
      byFraudType: Record<string, number>;
      byLocation: Record<string, number>;
      byPriority: Record<string, number>;
      recentTrends: any[];
    }>
  > {
    return this.executeQuery(async () => {
      const result = await supabase
        .from("reports")
        .select(
          "status, amount_involved, recovery_amount, fraud_type, city, state, priority, created_at",
        );

      if (result.error) return result;

      const reports = result.data || [];
      const stats = {
        total: reports.length,
        pending: reports.filter((r) => r.status === "pending").length,
        under_review: reports.filter((r) => r.status === "under_review").length,
        investigating: reports.filter((r) => r.status === "investigating")
          .length,
        resolved: reports.filter((r) => r.status === "resolved").length,
        rejected: reports.filter((r) => r.status === "rejected").length,
        withdrawn: reports.filter((r) => r.status === "withdrawn").length,
        escalated: reports.filter((r) => r.status === "escalated").length,
        totalAmount: reports.reduce(
          (sum, r) => sum + (r.amount_involved || 0),
          0,
        ),
        totalRecovered: reports.reduce(
          (sum, r) => sum + (r.recovery_amount || 0),
          0,
        ),
        avgAmount:
          reports.length > 0
            ? reports.reduce((sum, r) => sum + (r.amount_involved || 0), 0) /
              reports.length
            : 0,
        byFraudType: {} as Record<string, number>,
        byLocation: {} as Record<string, number>,
        byPriority: {} as Record<string, number>,
        recentTrends: [],
      };

      // Calculate distributions
      reports.forEach((report) => {
        stats.byFraudType[report.fraud_type] =
          (stats.byFraudType[report.fraud_type] || 0) + 1;

        if (report.state) {
          stats.byLocation[report.state] =
            (stats.byLocation[report.state] || 0) + 1;
        }

        if (report.priority) {
          stats.byPriority[report.priority] =
            (stats.byPriority[report.priority] || 0) + 1;
        }
      });

      return { data: stats, error: null };
    }, "fetch report statistics");
  }

  /**
   * Get report with evidence and status history
   */
  async getReportWithDetails(id: string): Promise<
    ServiceResponse<
      Report & {
        evidence: ReportEvidence[];
        status_history: any[];
        interactions_count: number;
      }
    >
  > {
    return this.executeQuery(async () => {
      const [reportResult, evidenceResult, historyResult, interactionsResult] =
        await Promise.all([
          supabase.from("reports").select("*").eq("id", id).single(),
          supabase.from("report_evidence").select("*").eq("report_id", id),
          supabase
            .from("report_status_history")
            .select("*")
            .eq("report_id", id)
            .order("created_at", { ascending: false }),
          supabase
            .from("community_interactions")
            .select("id")
            .eq("report_id", id),
        ]);

      if (reportResult.error) return reportResult;

      return {
        data: {
          ...reportResult.data,
          evidence: evidenceResult.data || [],
          status_history: historyResult.data || [],
          interactions_count: interactionsResult.data?.length || 0,
        },
        error: null,
      };
    }, "fetch detailed report");
  }
}

/**
 * User Profiles Service
 */
class UserProfilesService extends DatabaseService {
  /**
   * Get user profile with extended information
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

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(userId: string): Promise<
    ServiceResponse<{
      total_reports: number;
      total_interactions: number;
      unread_notifications: number;
      achievements_count: number;
      last_login: string | null;
    }>
  > {
    return this.executeQuery(async () => {
      const result = await supabase
        .from("user_activity_summary")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (result.error) return result;

      // Get achievements count separately
      const achievementsResult = await supabase
        .from("user_achievements")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId);

      return {
        data: {
          ...result.data,
          achievements_count: achievementsResult.count || 0,
        },
        error: null,
      };
    }, "fetch user activity summary");
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    userId: string,
    preferences: Record<string, any>,
  ): Promise<ServiceResponse<UserProfile>> {
    return this.executeQuery(
      () =>
        supabase
          .from("user_profiles")
          .update({
            notification_preferences: preferences,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single(),
      "update notification preferences",
    );
  }

  /**
   * Update privacy settings
   */
  async updatePrivacySettings(
    userId: string,
    settings: Record<string, any>,
  ): Promise<ServiceResponse<UserProfile>> {
    return this.executeQuery(
      () =>
        supabase
          .from("user_profiles")
          .update({
            privacy_settings: settings,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId)
          .select()
          .single(),
      "update privacy settings",
    );
  }

  /**
   * Check profile completion percentage
   */
  calculateProfileCompletion(profile: UserProfile): number {
    const fields = [
      "full_name",
      "email",
      "phone_number",
      "date_of_birth",
      "gender",
      "occupation",
      "city",
      "state",
    ];

    const completedFields = fields.filter(
      (field) => profile[field as keyof UserProfile],
    );
    return Math.round((completedFields.length / fields.length) * 100);
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
    description?: string,
  ): Promise<ServiceResponse<{ fileUrl: string; evidence: ReportEvidence }>> {
    try {
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return {
          data: null,
          error: "File size exceeds 10MB limit",
          success: false,
        };
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "audio/mpeg",
        "audio/wav",
        "video/mp4",
        "video/quicktime",
      ];

      if (!allowedTypes.includes(file.type)) {
        return {
          data: null,
          error: "File type not supported",
          success: false,
        };
      }

      // Generate secure filename
      const fileExt = file.name.split(".").pop()?.toLowerCase();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `${reportId}/${timestamp}-${randomId}.${fileExt}`;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("evidence-files")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get file URL (signed URL for security)
      const {
        data: { publicUrl },
      } = supabase.storage.from("evidence-files").getPublicUrl(fileName);

      // Determine evidence type
      let evidenceType = "other";
      if (file.type.startsWith("image/")) evidenceType = "image";
      else if (file.type.startsWith("video/")) evidenceType = "video";
      else if (file.type.startsWith("audio/")) evidenceType = "audio";
      else if (file.type === "application/pdf") evidenceType = "document";

      // Save evidence record
      const evidenceData: ReportEvidenceInsert = {
        report_id: reportId,
        file_name: file.name,
        file_path: uploadData.path,
        file_url: publicUrl,
        file_size: file.size,
        file_type: fileExt || null,
        mime_type: file.type || null,
        evidence_type: evidenceType,
        description: description || null,
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
        error: handleSupabaseError(error),
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
 * Fraud Alerts Service
 */
class FraudAlertsService extends DatabaseService {
  /**
   * Get active fraud alerts
   */
  async getActiveAlerts(
    limit: number = 10,
  ): Promise<ServiceResponse<FraudAlert[]>> {
    return this.executeQuery(
      () =>
        supabase
          .from("fraud_alerts")
          .select("*")
          .eq("is_active", true)
          .order("severity_level", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(limit),
      "fetch active fraud alerts",
    );
  }

  /**
   * Get alerts by region
   */
  async getAlertsByRegion(
    region: string,
  ): Promise<ServiceResponse<FraudAlert[]>> {
    return this.executeQuery(
      () =>
        supabase
          .from("fraud_alerts")
          .select("*")
          .eq("is_active", true)
          .contains("affected_regions", [region])
          .order("severity_level", { ascending: false }),
      "fetch regional fraud alerts",
    );
  }

  /**
   * Get alerts by fraud type
   */
  async getAlertsByFraudType(
    fraudType: string,
  ): Promise<ServiceResponse<FraudAlert[]>> {
    return this.executeQuery(
      () =>
        supabase
          .from("fraud_alerts")
          .select("*")
          .eq("is_active", true)
          .contains("fraud_types", [fraudType])
          .order("severity_level", { ascending: false }),
      "fetch fraud type alerts",
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
    const channel = supabase
      .channel("reports-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "reports",
          filter: userId ? `user_id=eq.${userId}` : undefined,
        },
        callback,
      )
      .subscribe();

    this.subscriptions.set("reports", channel);

    return () => {
      channel.unsubscribe();
      this.subscriptions.delete("reports");
    };
  }

  /**
   * Subscribe to notification updates
   */
  subscribeToNotifications(userId: string, callback: (payload: any) => void) {
    const channel = supabase
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
    const channel = supabase
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
   * Subscribe to fraud alerts
   */
  subscribeToFraudAlerts(callback: (payload: any) => void) {
    const channel = supabase
      .channel("fraud-alerts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "fraud_alerts",
          filter: "is_active=eq.true",
        },
        callback,
      )
      .subscribe();

    this.subscriptions.set("fraud-alerts", channel);

    return () => {
      channel.unsubscribe();
      this.subscriptions.delete("fraud-alerts");
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
export const fraudAlertsService = new FraudAlertsService();
export const realtimeService = new RealtimeService();

// Export database service for health checks
export const databaseService = new DatabaseService();

// Enhanced API helpers
export const apiHelpers = {
  /**
   * Create a new fraud report with validation
   */
  async createReport(
    reportData: ReportInsert,
  ): Promise<ServiceResponse<Report>> {
    // Validate required fields
    if (!reportData.title?.trim()) {
      return { data: null, error: "Report title is required", success: false };
    }
    if (!reportData.description?.trim()) {
      return {
        data: null,
        error: "Report description is required",
        success: false,
      };
    }
    if (!reportData.fraud_type) {
      return { data: null, error: "Fraud type is required", success: false };
    }

    return reportsService.create(reportData);
  },

  /**
   * Get user's complete profile with activity
   */
  async getUserDashboard(userId: string): Promise<
    ServiceResponse<{
      profile: UserProfile;
      activity: any;
      reports: Report[];
      notifications: Notification[];
    }>
  > {
    try {
      const [
        profileResult,
        activityResult,
        reportsResult,
        notificationsResult,
      ] = await Promise.all([
        userProfilesService.getProfile(userId),
        userProfilesService.getUserActivitySummary(userId),
        reportsService.getUserReports(userId),
        notificationsService.getUserNotifications(userId, 10),
      ]);

      if (!profileResult.success) {
        return { data: null, error: profileResult.error, success: false };
      }

      return {
        data: {
          profile: profileResult.data!,
          activity: activityResult.data,
          reports: reportsResult.data || [],
          notifications: notificationsResult.data || [],
        },
        error: null,
        success: true,
      };
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Failed to load dashboard",
        success: false,
      };
    }
  },

  /**
   * Search reports with filters
   */
  async searchReports(query: {
    text?: string;
    fraudType?: string;
    status?: string;
    location?: string;
    dateFrom?: string;
    dateTo?: string;
    page?: number;
    limit?: number;
  }): Promise<ServiceResponse<{ reports: Report[]; total: number }>> {
    const filters: any = {};

    if (query.fraudType) filters.fraud_type = query.fraudType;
    if (query.status) filters.status = query.status;
    if (query.dateFrom) filters.date_from = query.dateFrom;
    if (query.dateTo) filters.date_to = query.dateTo;

    return reportsService.getAll(filters, query.page || 1, query.limit || 20);
  },
};

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
  FraudAlert,
  ServiceResponse,
};
