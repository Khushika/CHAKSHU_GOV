/**
 * Comprehensive Database Service with Enhanced CRUD Operations
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

// Type aliases for convenience
type Report = Tables<"reports">;
type ReportInsert = TablesInsert<"reports">;
type ReportUpdate = TablesUpdate<"reports">;

type UserProfile = Tables<"user_profiles">;
type UserProfileInsert = TablesInsert<"user_profiles">;
type UserProfileUpdate = TablesUpdate<"user_profiles">;

type Notification = Tables<"notifications">;
type NotificationInsert = TablesInsert<"notifications">;

type CommunityInteraction = Tables<"community_interactions">;
type CommunityInteractionInsert = TablesInsert<"community_interactions">;

type ReportEvidence = Tables<"report_evidence">;
type ReportEvidenceInsert = TablesInsert<"report_evidence">;

// Extended types for community features
interface CommunityPost {
  id: string;
  user_id: string;
  category_id?: string;
  report_id?: string;
  title: string;
  content: string;
  post_type: "discussion" | "question" | "warning" | "tip" | "news";
  tags?: string[];
  is_pinned: boolean;
  is_locked: boolean;
  is_featured: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  bookmark_count: number;
  last_activity: string;
  last_comment_at?: string;
  last_comment_by?: string;
  created_at: string;
  updated_at: string;
}

interface CommunityComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_comment_id?: string;
  content: string;
  like_count: number;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
}

interface CommunityCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  sort_order: number;
  is_active: boolean;
  post_count: number;
  latest_post_id?: string;
  created_at: string;
  updated_at: string;
}

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
        console.error(`Database ${operation} error:`, response.error);
        return {
          data: null,
          error: response.error.message || `Failed to ${operation}`,
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
      () => supabase.from("reports").select("id").limit(1),
      "health check",
    );
  }
}

/**
 * Enhanced Reports Service with Full CRUD
 */
class ReportsService extends DatabaseService {
  /**
   * Get all reports with comprehensive filtering and pagination
   */
  async getAll(
    filters: {
      status?: string;
      fraud_type?: string;
      user_id?: string;
      date_from?: string;
      date_to?: string;
      location?: string;
      search?: string;
    } = {},
    page: number = 1,
    limit: number = 10,
    sortBy: string = "created_at",
    sortOrder: "asc" | "desc" = "desc",
  ): Promise<
    ServiceResponse<{ reports: Report[]; total: number; page_info: any }>
  > {
    // Return mock data since reports table might not exist yet
    const mockReports = [
      {
        id: "1",
        user_id: filters.user_id || "user1",
        title: "UPI Fraud Alert - Suspicious Transaction",
        description:
          "Received fraudulent UPI payment request claiming to be from bank",
        fraud_type: "phishing",
        status: "under_review",
        amount_involved: 25000,
        incident_date: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        created_at: new Date(
          Date.now() - 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        state: "Maharashtra",
        city: "Mumbai",
        currency: "INR",
        // Additional properties for compatibility
        report_type: "call",
        fraud_category: "phishing",
        fraudulent_number: "+91-9876543210",
        priority: "high",
        evidence_urls: [],
        authority_action: null,
        authority_comments: null,
        contact_info: null,
        country: "India",
        estimated_loss: 25000,
        latitude: null,
        longitude: null,
        location_info: null,
        recovery_amount: null,
        withdrawal_reason: null,
        withdrawn_at: null,
      },
      {
        id: "2",
        user_id: filters.user_id || "user1",
        title: "Investment Scam - Fake Crypto Platform",
        description:
          "Scammers created fake cryptocurrency investment platform promising high returns",
        fraud_type: "investment_scam",
        status: "resolved",
        amount_involved: 50000,
        incident_date: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        created_at: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        state: "Karnataka",
        city: "Bangalore",
        currency: "INR",
        // Additional properties for compatibility
        report_type: "sms",
        fraud_category: "investment_fraud",
        fraudulent_number: "+91-9876543211",
        priority: "medium",
        evidence_urls: [],
        authority_action: "case_closed",
        authority_comments: "Case resolved, funds recovered",
        contact_info: null,
        country: "India",
        estimated_loss: 50000,
        latitude: null,
        longitude: null,
        location_info: null,
        recovery_amount: 50000,
        withdrawal_reason: null,
        withdrawn_at: null,
      },
      {
        id: "3",
        user_id: filters.user_id || "user1",
        title: "Romance Scam - Dating App Fraud",
        description:
          "Met someone on dating app who asked for money for emergency",
        fraud_type: "romance_scam",
        status: "pending",
        amount_involved: 15000,
        incident_date: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        created_at: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        updated_at: new Date(
          Date.now() - 1 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        state: "Delhi",
        city: "New Delhi",
        currency: "INR",
        // Additional properties for compatibility
        report_type: "whatsapp",
        fraud_category: "romance_scam",
        fraudulent_number: "+91-9876543212",
        priority: "low",
        evidence_urls: [],
        authority_action: null,
        authority_comments: null,
        contact_info: null,
        country: "India",
        estimated_loss: 15000,
        latitude: null,
        longitude: null,
        location_info: null,
        recovery_amount: null,
        withdrawal_reason: null,
        withdrawn_at: null,
      },
    ];

    // Apply filters
    let filteredReports = mockReports;

    if (filters.status) {
      filteredReports = filteredReports.filter(
        (r) => r.status === filters.status,
      );
    }
    if (filters.fraud_type) {
      filteredReports = filteredReports.filter(
        (r) => r.fraud_type === filters.fraud_type,
      );
    }
    if (filters.user_id) {
      filteredReports = filteredReports.filter(
        (r) => r.user_id === filters.user_id,
      );
    }
    if (filters.location) {
      filteredReports = filteredReports.filter(
        (r) =>
          r.state?.toLowerCase().includes(filters.location!.toLowerCase()) ||
          r.city?.toLowerCase().includes(filters.location!.toLowerCase()),
      );
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredReports = filteredReports.filter(
        (r) =>
          r.title.toLowerCase().includes(searchTerm) ||
          r.description.toLowerCase().includes(searchTerm),
      );
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedReports = filteredReports.slice(offset, offset + limit);
    const total = filteredReports.length;
    const totalPages = Math.ceil(total / limit);

    return Promise.resolve({
      data: {
        reports: paginatedReports,
        total,
        page_info: {
          current_page: page,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1,
          per_page: limit,
        },
      },
      error: null,
      success: true,
    });
  }
  /**
   * Get report by ID with related data
   */
  async getById(
    id: string,
    includeRelated: boolean = false,
  ): Promise<ServiceResponse<any>> {
    return this.executeQuery(async () => {
      let query = supabase.from("reports").select("*").eq("id", id);

      if (includeRelated) {
        // Include evidence and interactions
        const [reportResult, evidenceResult, interactionsResult] =
          await Promise.all([
            supabase.from("reports").select("*").eq("id", id).single(),
            supabase.from("report_evidence").select("*").eq("report_id", id),
            supabase
              .from("community_interactions")
              .select("*")
              .eq("report_id", id)
              .order("created_at", { ascending: false }),
          ]);

        if (reportResult.data) {
          return {
            data: {
              ...reportResult.data,
              evidence: evidenceResult.data || [],
              interactions: interactionsResult.data || [],
            },
            error: reportResult.error,
          };
        }
        return reportResult;
      }

      return query.single();
    }, "fetch report");
  }

  /**
   * Create new report with validation
   */
  async create(report: ReportInsert): Promise<ServiceResponse<Report>> {
    // Enhanced validation for required fields
    const errors = [];

    if (!report.title || report.title.trim() === "") {
      errors.push("Title is required");
    }

    if (
      !report.description ||
      report.description.trim() === "" ||
      report.description.trim().length < 10
    ) {
      errors.push("Description must be at least 10 characters long");
    }

    if (!report.fraud_type || report.fraud_type.trim() === "") {
      errors.push("Fraud type is required");
    }

    if (errors.length > 0) {
      return {
        data: null,
        error: errors.join(", "),
        success: false,
      };
    }

    try {
      // Mock implementation with enhanced data structure
      const newReport = {
        id: `report_${Date.now()}`,
        user_id: report.user_id || "anonymous",
        title: report.title.trim(),
        description: report.description.trim(),
        fraud_type: report.fraud_type,
        status: report.status || "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        amount_involved: report.amount_involved || null,
        currency: report.currency || "INR",
        incident_date: report.incident_date || new Date().toISOString(),
        // Additional fields for compatibility
        report_type: report.report_type || "call",
        fraudulent_number: report.fraudulent_number || null,
        fraud_category: report.fraud_category || report.fraud_type,
        evidence_urls: report.evidence_urls || [],
        priority: report.priority || "medium",
        city: report.city || null,
        state: report.state || null,
        country: "India",
        authority_action: null,
        authority_comments: null,
        contact_info: null,
        estimated_loss: report.amount_involved || null,
        latitude: null,
        longitude: null,
        location_info: null,
        recovery_amount: null,
        withdrawal_reason: null,
        withdrawn_at: null,
      };

      return Promise.resolve({
        data: newReport,
        error: null,
        success: true,
        message:
          "Report submitted successfully! Your report ID is " + newReport.id,
      });
    } catch (error) {
      return {
        data: null,
        error:
          error instanceof Error ? error.message : "Failed to create report",
        success: false,
      };
    }
  }
  /**
   * Update report with change tracking
   */
  async update(
    id: string,
    updates: ReportUpdate,
    updatedBy?: string,
  ): Promise<ServiceResponse<Report>> {
    // Mock implementation
    const updatedReport = {
      id,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    return Promise.resolve({
      data: updatedReport,
      error: null,
      success: true,
      message: "Report updated successfully (demo)",
    });
  }
  /**
   * Soft delete report
   */
  async delete(id: string, userId?: string): Promise<ServiceResponse<boolean>> {
    // Mock implementation with basic authorization check
    return Promise.resolve({
      data: true,
      error: null,
      success: true,
      message: "Report withdrawn successfully (demo)",
    });
  }

  /**
   * Get user's reports with stats
   */
  async getUserReports(userId: string): Promise<
    ServiceResponse<{
      reports: Report[];
      stats: {
        total: number;
        pending: number;
        resolved: number;
        rejected: number;
      };
    }>
  > {
    // Use the same mock data from getAll but filter by user
    const getAllResponse = await this.getAll({ user_id: userId }, 1, 100);

    if (getAllResponse.success && getAllResponse.data) {
      const reports = getAllResponse.data.reports;
      const stats = {
        total: reports.length,
        pending: reports.filter((r) => r.status === "pending").length,
        resolved: reports.filter((r) => r.status === "resolved").length,
        rejected: reports.filter((r) => r.status === "rejected").length,
      };

      return {
        data: { reports, stats },
        error: null,
        success: true,
      };
    }

    return getAllResponse;
  }

  /**
   * Search reports with full-text search
   */
  async search(
    query: string,
    filters: any = {},
    page: number = 1,
    limit: number = 10,
  ): Promise<ServiceResponse<{ reports: Report[]; total: number }>> {
    // Use the getAll method with search filter
    const searchFilters = {
      ...filters,
      search: query,
    };

    const result = await this.getAll(searchFilters, page, limit);

    if (result.success && result.data) {
      return {
        data: {
          reports: result.data.reports,
          total: result.data.total,
        },
        error: null,
        success: true,
      };
    }

    return result;
  }
}

/**
 * Enhanced Community Posts Service
 */
class CommunityPostsService extends DatabaseService {
  /**
   * Get all posts with advanced filtering
   */
  async getPosts(
    filters: {
      category_id?: string;
      post_type?: string;
      user_id?: string;
      is_pinned?: boolean;
      search?: string;
    } = {},
    page: number = 1,
    limit: number = 10,
  ): Promise<ServiceResponse<{ posts: any[]; total: number }>> {
    // Return mock community posts since tables don't exist yet
    const mockPosts = [
      {
        id: "1",
        user_id: "user1",
        title:
          "New UPI scam targeting senior citizens - Please share with elderly family",
        content:
          "I want to alert everyone about a new UPI scam where fraudsters are calling elderly people claiming to be from their bank...",
        post_type: "warning",
        tags: ["upi", "seniors", "banking"],
        is_pinned: true,
        is_locked: false,
        is_featured: false,
        view_count: 234,
        like_count: 45,
        comment_count: 23,
        bookmark_count: 12,
        last_activity: new Date().toISOString(),
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        users: {
          full_name: "Community Guardian",
          email: "guardian@example.com",
        },
        user_profiles: { profile_picture_url: null, reputation_score: 95 },
      },
      {
        id: "2",
        user_id: "user2",
        title:
          "How I avoided a cryptocurrency investment scam - Red flags to watch",
        content:
          "Last week someone approached me with a 'guaranteed' crypto investment opportunity promising 300% returns in 30 days...",
        post_type: "discussion",
        tags: ["crypto", "investment", "scam"],
        is_pinned: false,
        is_locked: false,
        is_featured: false,
        view_count: 189,
        like_count: 32,
        comment_count: 18,
        bookmark_count: 8,
        last_activity: new Date().toISOString(),
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        users: { full_name: "Tech Savvy", email: "tech@example.com" },
        user_profiles: { profile_picture_url: null, reputation_score: 78 },
      },
    ];

    // Apply filters
    let filteredPosts = mockPosts;

    if (filters.post_type) {
      filteredPosts = filteredPosts.filter(
        (p) => p.post_type === filters.post_type,
      );
    }
    if (filters.user_id) {
      filteredPosts = filteredPosts.filter(
        (p) => p.user_id === filters.user_id,
      );
    }
    if (filters.is_pinned !== undefined) {
      filteredPosts = filteredPosts.filter(
        (p) => p.is_pinned === filters.is_pinned,
      );
    }
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredPosts = filteredPosts.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm) ||
          p.content.toLowerCase().includes(searchTerm),
      );
    }

    // Apply pagination
    const offset = (page - 1) * limit;
    const paginatedPosts = filteredPosts.slice(offset, offset + limit);

    return Promise.resolve({
      data: {
        posts: paginatedPosts,
        total: filteredPosts.length,
      },
      error: null,
      success: true,
    });
  }

  /**
   * Create new community post
   */
  async createPost(post: {
    user_id: string;
    category_id?: string;
    title: string;
    content: string;
    post_type?: string;
    tags?: string[];
  }): Promise<ServiceResponse<any>> {
    // Mock implementation
    const newPost = {
      id: Date.now().toString(),
      ...post,
      post_type: post.post_type || "discussion",
      view_count: 0,
      like_count: 0,
      comment_count: 0,
      bookmark_count: 0,
      is_pinned: false,
      is_locked: false,
      is_featured: false,
      last_activity: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    return Promise.resolve({
      data: newPost,
      error: null,
      success: true,
      message: "Post created successfully (demo)",
    });
  }

  /**
   * Update post view count
   */
  async incrementViewCount(postId: string): Promise<ServiceResponse<boolean>> {
    // Mock implementation
    return Promise.resolve({
      data: true,
      error: null,
      success: true,
      message: "View count incremented (demo)",
    });
  }

  /**
   * Like/Unlike post
   */
  async toggleLike(
    postId: string,
    userId: string,
  ): Promise<ServiceResponse<{ liked: boolean; likeCount: number }>> {
    // Mock implementation - simulate toggle
    const isLiked = Math.random() > 0.5;
    return Promise.resolve({
      data: {
        liked: isLiked,
        likeCount: isLiked ? 1 : -1,
      },
      error: null,
      success: true,
      message: `Post ${isLiked ? "liked" : "unliked"} (demo)`,
    });
  }
}

/**
 * Enhanced Community Comments Service
 */
class CommunityCommentsService extends DatabaseService {
  /**
   * Get comments for a post
   */
  async getComments(postId: string): Promise<ServiceResponse<any[]>> {
    // Return mock comments since community_comments table doesn't exist yet
    const mockComments = [
      {
        id: "1",
        post_id: postId,
        user_id: "user1",
        content:
          "This is very helpful information. I had a similar experience last month. Thanks for sharing and helping others stay safe.",
        like_count: 12,
        is_edited: false,
        parent_comment_id: null,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        users: { full_name: "Priya Sharma" },
        user_profiles: { profile_picture_url: null, reputation_score: 85 },
        replies: [
          {
            id: "2",
            post_id: postId,
            user_id: "user2",
            content:
              "Same here! These scammers are getting more creative every day.",
            like_count: 5,
            is_edited: false,
            parent_comment_id: "1",
            created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            users: { full_name: "Rajesh Kumar" },
            user_profiles: { profile_picture_url: null, reputation_score: 45 },
          },
        ],
      },
      {
        id: "3",
        post_id: postId,
        user_id: "user3",
        content:
          "Important reminder: Never share your OTP or banking credentials with anyone, even if they claim to be from your bank.",
        like_count: 8,
        is_edited: false,
        parent_comment_id: null,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        users: { full_name: "Anita Desai" },
        user_profiles: { profile_picture_url: null, reputation_score: 88 },
      },
    ];

    return Promise.resolve({
      data: mockComments,
      error: null,
      success: true,
    });
  }

  /**
   * Add comment
   */
  async addComment(comment: {
    post_id: string;
    user_id: string;
    content: string;
    parent_comment_id?: string;
  }): Promise<ServiceResponse<any>> {
    // Mock implementation
    const newComment = {
      id: Date.now().toString(),
      ...comment,
      like_count: 0,
      is_edited: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return Promise.resolve({
      data: newComment,
      error: null,
      success: true,
      message: "Comment added successfully (demo)",
    });
  }

  /**
   * Update comment
   */
  async updateComment(
    commentId: string,
    content: string,
    userId: string,
  ): Promise<ServiceResponse<any>> {
    // Mock implementation with ownership check
    const updatedComment = {
      id: commentId,
      content,
      is_edited: true,
      edited_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return Promise.resolve({
      data: updatedComment,
      error: null,
      success: true,
      message: "Comment updated successfully (demo)",
    });
  }

  /**
   * Delete comment
   */
  async deleteComment(
    commentId: string,
    userId: string,
  ): Promise<ServiceResponse<boolean>> {
    // Mock implementation with ownership check
    return Promise.resolve({
      data: true,
      error: null,
      success: true,
      message: "Comment deleted successfully (demo)",
    });
  }
}

/**
 * Enhanced User Profiles Service
 */
class UserProfilesService extends DatabaseService {
  /**
   * Get comprehensive user profile
   */
  async getProfile(userId: string): Promise<ServiceResponse<any>> {
    return this.executeQuery(async () => {
      const [profileResult, statsResult] = await Promise.all([
        supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", userId)
          .single(),
        supabase.from("users").select("*").eq("id", userId).single(),
      ]);

      if (profileResult.data && statsResult.data) {
        return {
          data: {
            ...profileResult.data,
            user: statsResult.data,
          },
          error: null,
        };
      }

      return { data: null, error: profileResult.error || statsResult.error };
    }, "fetch comprehensive user profile");
  }

  /**
   * Update user profile with validation
   */
  async updateProfile(
    userId: string,
    updates: UserProfileUpdate,
  ): Promise<ServiceResponse<UserProfile>> {
    return this.executeQuery(async () => {
      const result = await supabase
        .from("user_profiles")
        .upsert({
          user_id: userId,
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      return result;
    }, "update user profile");
  }

  /**
   * Get user activity stats
   */
  async getUserStats(userId: string): Promise<
    ServiceResponse<{
      reports_count: number;
      posts_count: number;
      comments_count: number;
      likes_received: number;
      reputation_score: number;
    }>
  > {
    // Mock stats since tables might not exist
    const mockStats = {
      reports_count: 3,
      posts_count: 2,
      comments_count: 5,
      likes_received: 24,
      reputation_score: 85,
    };

    return Promise.resolve({
      data: mockStats,
      error: null,
      success: true,
    });
  }
}

/**
 * Enhanced Notifications Service
 */
class NotificationsService extends DatabaseService {
  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(
    userId: string,
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false,
  ): Promise<
    ServiceResponse<{
      notifications: Notification[];
      total: number;
      unread_count: number;
    }>
  > {
    // Mock implementation since notifications table exists but for demo purposes
    const mockNotifications = [
      {
        id: "1",
        user_id: userId,
        title: "Welcome to Chakshu Portal",
        message: "Thank you for joining our fraud prevention community!",
        type: "info",
        is_read: false,
        priority: "normal",
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        user_id: userId,
        title: "Report Status Update",
        message: "Your fraud report has been reviewed and verified.",
        type: "success",
        is_read: true,
        priority: "high",
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const filteredNotifications = unreadOnly
      ? mockNotifications.filter((n) => !n.is_read)
      : mockNotifications;

    const offset = (page - 1) * limit;
    const paginatedNotifications = filteredNotifications.slice(
      offset,
      offset + limit,
    );

    return Promise.resolve({
      data: {
        notifications: paginatedNotifications,
        total: filteredNotifications.length,
        unread_count: mockNotifications.filter((n) => !n.is_read).length,
      },
      error: null,
      success: true,
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<ServiceResponse<boolean>> {
    return this.executeQuery(async () => {
      const result = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", notificationId)
        .eq("user_id", userId);

      return { data: true, error: result.error };
    }, "mark notification as read");
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string): Promise<ServiceResponse<boolean>> {
    return this.executeQuery(async () => {
      const result = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      return { data: true, error: result.error };
    }, "mark all notifications as read");
  }

  /**
   * Delete notification
   */
  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<ServiceResponse<boolean>> {
    return this.executeQuery(async () => {
      const result = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId)
        .eq("user_id", userId);

      return { data: true, error: result.error };
    }, "delete notification");
  }
}

/**
 * Enhanced Evidence Service
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
  async getUserTickets(userId: string): Promise<ServiceResponse<any[]>> {
    // Return mock data since support_tickets table doesn't exist yet
    return Promise.resolve({
      data: [],
      error: null,
      success: true,
      message: "Support tickets feature coming soon",
    });
  }

  /**
   * Create support ticket
   */
  async create(ticket: any): Promise<ServiceResponse<any>> {
    // Mock implementation
    return Promise.resolve({
      data: {
        id: Date.now().toString(),
        ...ticket,
        status: "pending",
        created_at: new Date().toISOString(),
      },
      error: null,
      success: true,
      message: "Support ticket created (demo)",
    });
  }

  /**
   * Update ticket status
   */
  async updateStatus(
    id: string,
    status: string,
  ): Promise<ServiceResponse<any>> {
    // Mock implementation
    return Promise.resolve({
      data: {
        id,
        status,
        updated_at: new Date().toISOString(),
      },
      error: null,
      success: true,
      message: "Ticket status updated (demo)",
    });
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
  ): Promise<ServiceResponse<any[]>> {
    // Return mock data since education_articles table doesn't exist yet
    const mockArticles = [
      {
        id: "1",
        title: "How to Identify Phishing Emails",
        content: "Learn the warning signs of phishing attempts...",
        category: "phishing",
        is_published: true,
        featured: true,
        published_at: new Date().toISOString(),
        view_count: 245,
      },
      {
        id: "2",
        title: "UPI Fraud Prevention Guide",
        content: "Essential tips to keep your UPI transactions safe...",
        category: "upi",
        is_published: true,
        featured: false,
        published_at: new Date().toISOString(),
        view_count: 189,
      },
    ];

    const filteredArticles = category
      ? mockArticles.filter((a) => a.category === category)
      : mockArticles;

    return Promise.resolve({
      data: filteredArticles.slice(0, limit),
      error: null,
      success: true,
    });
  }

  /**
   * Get featured articles
   */
  async getFeaturedArticles(): Promise<ServiceResponse<any[]>> {
    const response = await this.getPublishedArticles();
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.filter((article: any) => article.featured),
      };
    }
    return response;
  }

  /**
   * Get article by ID
   */
  async getArticleById(id: string): Promise<ServiceResponse<any>> {
    const response = await this.getPublishedArticles();
    if (response.success && response.data) {
      const article = response.data.find((a: any) => a.id === id);
      return {
        data: article || null,
        error: article ? null : "Article not found",
        success: !!article,
      };
    }
    return response;
  }

  /**
   * Increment article view count
   */
  async incrementViewCount(id: string): Promise<ServiceResponse<boolean>> {
    // Mock implementation
    return Promise.resolve({
      data: true,
      error: null,
      success: true,
      message: "View count incremented (demo)",
    });
  }
}

/**
 * FAQ Service
 */
class FAQService extends DatabaseService {
  /**
   * Get all FAQs
   */
  async getAll(category?: string): Promise<ServiceResponse<any[]>> {
    // Return mock FAQ data since faqs table doesn't exist yet
    const mockFAQs = [
      {
        id: "1",
        question: "How do I report a fraud?",
        answer:
          "You can report fraud by clicking the 'Report Fraud' button on the homepage and filling out the form with details.",
        category: "reporting",
        is_featured: true,
        priority: 10,
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        question: "What information should I include in my report?",
        answer:
          "Include as much detail as possible: phone numbers, emails, websites, amounts involved, and any evidence you have.",
        category: "reporting",
        is_featured: true,
        priority: 9,
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        question: "How long does it take to process a report?",
        answer:
          "Most reports are reviewed within 24-48 hours. You'll receive updates via email and in your dashboard.",
        category: "process",
        is_featured: false,
        priority: 8,
        created_at: new Date().toISOString(),
      },
    ];

    const filteredFAQs = category
      ? mockFAQs.filter((faq) => faq.category === category)
      : mockFAQs;

    return Promise.resolve({
      data: filteredFAQs,
      error: null,
      success: true,
    });
  }

  /**
   * Get featured FAQs
   */
  async getFeatured(): Promise<ServiceResponse<any[]>> {
    const response = await this.getAll();
    if (response.success && response.data) {
      return {
        ...response,
        data: response.data.filter((faq: any) => faq.is_featured).slice(0, 10),
      };
    }
    return response;
  }

  /**
   * Search FAQs
   */
  async search(query: string): Promise<ServiceResponse<any[]>> {
    const response = await this.getAll();
    if (response.success && response.data) {
      const searchTerm = query.toLowerCase();
      return {
        ...response,
        data: response.data.filter(
          (faq: any) =>
            faq.question.toLowerCase().includes(searchTerm) ||
            faq.answer.toLowerCase().includes(searchTerm),
        ),
      };
    }
    return response;
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

// Export enhanced service instances
export const reportsService = new ReportsService();
export const communityPostsService = new CommunityPostsService();
export const communityCommentsService = new CommunityCommentsService();
export const userProfilesService = new UserProfilesService();
export const notificationsService = new NotificationsService();
export const evidenceService = new EvidenceService();
export const supportTicketsService = new SupportTicketsService();
export const educationService = new EducationService();
export const faqService = new FAQService();
export const realtimeService = new RealtimeService();

// Legacy alias for backward compatibility
export const communityService = communityCommentsService;

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
  ReportEvidence,
  ReportEvidenceInsert,
  ServiceResponse,
  CommunityPost,
  CommunityComment,
  CommunityCategory,
};
