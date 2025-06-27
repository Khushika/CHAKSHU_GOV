/**
 * Custom React Hooks for Database Operations
 * Provides easy-to-use hooks for database interactions with caching and real-time updates
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  reportsService,
  userProfilesService,
  notificationsService,
  communityService,
  evidenceService,
  supportTicketsService,
  educationService,
  faqService,
  realtimeService,
  type ServiceResponse,
  type Report,
  type ReportInsert,
  type ReportUpdate,
  type UserProfile,
  type UserProfileInsert,
  type UserProfileUpdate,
  type Notification,
  type CommunityInteraction,
  type ReportEvidence,
  type SupportTicket,
  type SupportTicketInsert,
  type EducationArticle,
  type FAQ,
} from "@/services/database";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

// Generic hook state interface
interface HookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Generic database hook
 */
function useGenericDatabase<T>(
  fetcher: () => Promise<ServiceResponse<T>>,
  dependencies: any[] = [],
  options: {
    autoRefresh?: boolean;
    refreshInterval?: number;
    showToasts?: boolean;
    enabled?: boolean;
  } = {},
) {
  const {
    autoRefresh = false,
    refreshInterval = 30000,
    showToasts = false,
    enabled = true,
  } = options;

  const [state, setState] = useState<HookState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null,
  });

  const intervalRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();

  const fetchData = useCallback(
    async (showLoading = true) => {
      if (!enabled) return;

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      if (showLoading) {
        setState((prev) => ({ ...prev, loading: true, error: null }));
      }

      try {
        const response = await fetcher();

        if (!abortControllerRef.current?.signal.aborted) {
          setState({
            data: response.success ? response.data : null,
            loading: false,
            error: response.success ? null : response.error,
            lastUpdated: new Date(),
          });

          if (showToasts) {
            if (response.success && response.message) {
              toast({
                title: "Success",
                description: response.message,
              });
            } else if (!response.success && response.error) {
              toast({
                title: "Error",
                description: response.error,
                variant: "destructive",
              });
            }
          }
        }
      } catch (error) {
        if (!abortControllerRef.current?.signal.aborted) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));

          if (showToasts) {
            toast({
              title: "Error",
              description: errorMessage,
              variant: "destructive",
            });
          }
        }
      }
    },
    [fetcher, showToasts, enabled],
  );

  // Initial load
  useEffect(() => {
    if (enabled) {
      fetchData();
    }
  }, [...dependencies, enabled]);

  // Auto refresh
  useEffect(() => {
    if (enabled && autoRefresh && refreshInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData(false);
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, fetchData, enabled]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const refresh = useCallback(() => fetchData(false), [fetchData]);
  const forceRefresh = useCallback(() => fetchData(true), [fetchData]);

  return {
    ...state,
    refresh,
    forceRefresh,
    isStale: state.lastUpdated
      ? Date.now() - state.lastUpdated.getTime() > refreshInterval
      : true,
  };
}

/**
 * Hook for fetching reports
 */
export function useReports(
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
  options: { autoRefresh?: boolean; showToasts?: boolean } = {},
) {
  const fetcher = useCallback(
    () => reportsService.getAll(filters, page, limit),
    [filters, page, limit],
  );

  const result = useGenericDatabase(
    fetcher,
    [JSON.stringify(filters), page, limit],
    { autoRefresh: true, refreshInterval: 30000, ...options },
  );

  return {
    ...result,
    reports: result.data?.reports || [],
    total: result.data?.total || 0,
  };
}

/**
 * Hook for fetching a single report
 */
export function useReport(
  id: string,
  options: { showToasts?: boolean; enabled?: boolean } = {},
) {
  const fetcher = useCallback(() => reportsService.getById(id), [id]);

  return useGenericDatabase(fetcher, [id], {
    autoRefresh: false,
    enabled: !!id,
    ...options,
  });
}

/**
 * Hook for user's reports
 */
export function useUserReports(
  userId?: string,
  options: { autoRefresh?: boolean } = {},
) {
  const { user } = useAuth();
  const actualUserId = userId || user?.id;

  const fetcher = useCallback(async () => {
    if (!actualUserId) {
      return Promise.resolve({ data: [], error: null, success: true });
    }

    try {
      const result = await reportsService.getUserReports(actualUserId);

      // If we get an infinite recursion error, provide helpful guidance
      if (!result.success && result.error?.includes("infinite recursion")) {
        console.error(
          "RLS infinite recursion detected. Database migration needed.",
        );
        return {
          data: [],
          error:
            "Database configuration error detected. Please contact support or check the console for migration instructions.",
          success: false,
          message:
            "RLS policies need to be updated to fix circular references.",
        };
      }

      return result;
    } catch (error) {
      console.error("Error fetching user reports:", error);
      return {
        data: [],
        error:
          error instanceof Error ? error.message : "Failed to fetch reports",
        success: false,
      };
    }
  }, [actualUserId]);

  return useGenericDatabase(fetcher, [actualUserId], {
    autoRefresh: true,
    refreshInterval: 60000,
    enabled: !!actualUserId,
    showToasts: false, // Don't show toast for every error, we'll handle it specially
    ...options,
  });
}

/**
 * Hook for report statistics
 */
export function useReportStats(options: { autoRefresh?: boolean } = {}) {
  const fetcher = useCallback(() => reportsService.getStats(), []);

  return useGenericDatabase(fetcher, [], {
    autoRefresh: true,
    refreshInterval: 60000,
    ...options,
  });
}

/**
 * Hook for user profile
 */
export function useUserProfile(
  userId?: string,
  options: { autoRefresh?: boolean } = {},
) {
  const { user } = useAuth();
  const actualUserId = userId || user?.id;

  const fetcher = useCallback(() => {
    if (!actualUserId) {
      return Promise.resolve({ data: null, error: null, success: true });
    }
    return userProfilesService.getProfile(actualUserId);
  }, [actualUserId]);

  return useGenericDatabase(fetcher, [actualUserId], {
    autoRefresh: false,
    enabled: !!actualUserId,
    ...options,
  });
}

/**
 * Hook for user notifications
 */
export function useNotifications(
  userId?: string,
  options: { autoRefresh?: boolean } = {},
) {
  const { user } = useAuth();
  const actualUserId = userId || user?.id;

  const fetcher = useCallback(() => {
    if (!actualUserId) {
      return Promise.resolve({ data: [], error: null, success: true });
    }
    return notificationsService.getUserNotifications(actualUserId);
  }, [actualUserId]);

  const result = useGenericDatabase(fetcher, [actualUserId], {
    autoRefresh: true,
    refreshInterval: 30000,
    enabled: !!actualUserId,
    ...options,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!actualUserId) return;

    const unsubscribe = realtimeService.subscribeToNotifications(
      actualUserId,
      (payload) => {
        console.log("Notification update:", payload);
        result.refresh();
      },
    );

    return unsubscribe;
  }, [actualUserId, result.refresh]);

  return result;
}

/**
 * Hook for unread notifications count
 */
export function useUnreadNotificationsCount(userId?: string) {
  const { user } = useAuth();
  const actualUserId = userId || user?.id;

  const fetcher = useCallback(() => {
    if (!actualUserId) {
      return Promise.resolve({ data: 0, error: null, success: true });
    }
    return notificationsService.getUnreadCount(actualUserId);
  }, [actualUserId]);

  return useGenericDatabase(fetcher, [actualUserId], {
    autoRefresh: true,
    refreshInterval: 10000,
    enabled: !!actualUserId,
  });
}

/**
 * Hook for community interactions
 */
export function useCommunityInteractions(
  reportId: string,
  options: { autoRefresh?: boolean } = {},
) {
  const fetcher = useCallback(
    () => communityService.getReportInteractions(reportId),
    [reportId],
  );

  const result = useGenericDatabase(fetcher, [reportId], {
    autoRefresh: true,
    refreshInterval: 30000,
    enabled: !!reportId,
    ...options,
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!reportId) return;

    const unsubscribe = realtimeService.subscribeToCommunityInteractions(
      reportId,
      (payload) => {
        console.log("Community interaction update:", payload);
        result.refresh();
      },
    );

    return unsubscribe;
  }, [reportId, result.refresh]);

  return result;
}

/**
 * Hook for report evidence
 */
export function useReportEvidence(
  reportId: string,
  options: { autoRefresh?: boolean } = {},
) {
  const fetcher = useCallback(
    () => evidenceService.getReportEvidence(reportId),
    [reportId],
  );

  return useGenericDatabase(fetcher, [reportId], {
    autoRefresh: false,
    enabled: !!reportId,
    ...options,
  });
}

/**
 * Hook for support tickets
 */
export function useSupportTickets(
  userId?: string,
  options: { autoRefresh?: boolean } = {},
) {
  const { user } = useAuth();
  const actualUserId = userId || user?.id;

  const fetcher = useCallback(() => {
    if (!actualUserId) {
      return Promise.resolve({ data: [], error: null, success: true });
    }
    return supportTicketsService.getUserTickets(actualUserId);
  }, [actualUserId]);

  return useGenericDatabase(fetcher, [actualUserId], {
    autoRefresh: true,
    refreshInterval: 60000,
    enabled: !!actualUserId,
    ...options,
  });
}

/**
 * Hook for education articles
 */
export function useEducationArticles(category?: string, limit: number = 20) {
  const fetcher = useCallback(
    () => educationService.getPublishedArticles(category, limit),
    [category, limit],
  );

  return useGenericDatabase(fetcher, [category, limit], { autoRefresh: false });
}

/**
 * Hook for featured articles
 */
export function useFeaturedArticles() {
  const fetcher = useCallback(() => educationService.getFeaturedArticles(), []);

  return useGenericDatabase(fetcher, [], { autoRefresh: false });
}

/**
 * Hook for single article
 */
export function useEducationArticle(
  id: string,
  options: { enabled?: boolean } = {},
) {
  const fetcher = useCallback(() => educationService.getArticleById(id), [id]);

  return useGenericDatabase(fetcher, [id], {
    autoRefresh: false,
    enabled: !!id && options.enabled !== false,
  });
}

/**
 * Hook for FAQs
 */
export function useFAQs(category?: string) {
  const fetcher = useCallback(() => faqService.getAll(category), [category]);

  return useGenericDatabase(fetcher, [category], { autoRefresh: false });
}

/**
 * Hook for featured FAQs
 */
export function useFeaturedFAQs() {
  const fetcher = useCallback(() => faqService.getFeatured(), []);

  return useGenericDatabase(fetcher, [], { autoRefresh: false });
}

/**
 * Hook for creating reports with optimistic updates
 */
export function useCreateReport() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createReport = useCallback(
    async (reportData: Omit<ReportInsert, "user_id">) => {
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create a report",
          variant: "destructive",
        });
        return { success: false, error: "Not authenticated" };
      }

      setLoading(true);

      try {
        const result = await reportsService.create({
          ...reportData,
          user_id: user.id,
        });

        if (result.success) {
          toast({
            title: "Report Created",
            description: "Your report has been submitted successfully",
          });
        } else {
          toast({
            title: "Failed to Create Report",
            description: result.error || "Unknown error occurred",
            variant: "destructive",
          });
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  return { createReport, loading };
}

/**
 * Hook for updating reports
 */
export function useUpdateReport() {
  const [loading, setLoading] = useState(false);

  const updateReport = useCallback(
    async (id: string, updates: ReportUpdate) => {
      setLoading(true);

      try {
        const result = await reportsService.update(id, updates);

        if (result.success) {
          toast({
            title: "Report Updated",
            description: "Your report has been updated successfully",
          });
        } else {
          toast({
            title: "Failed to Update Report",
            description: result.error || "Unknown error occurred",
            variant: "destructive",
          });
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { updateReport, loading };
}

/**
 * Hook for updating user profile
 */
export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);

  const updateProfile = useCallback(
    async (profile: UserProfileInsert | UserProfileUpdate) => {
      setLoading(true);

      try {
        const result = await userProfilesService.upsertProfile(profile);

        if (result.success) {
          toast({
            title: "Profile Updated",
            description: "Your profile has been updated successfully",
          });
        } else {
          toast({
            title: "Failed to Update Profile",
            description: result.error || "Unknown error occurred",
            variant: "destructive",
          });
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { updateProfile, loading };
}

/**
 * Hook for managing notifications
 */
export function useNotificationActions() {
  const [loading, setLoading] = useState(false);

  const markAsRead = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const result = await notificationsService.markAsRead(id);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const result = await notificationsService.markAllAsRead(userId);
      if (result.success) {
        toast({
          title: "All Notifications Marked as Read",
          description: "All your notifications have been marked as read",
        });
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const result = await notificationsService.delete(id);
      if (result.success) {
        toast({
          title: "Notification Deleted",
          description: "The notification has been deleted",
        });
      }
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    markAsRead,
    markAllAsRead,
    deleteNotification,
    loading,
  };
}

/**
 * Hook for file uploads
 */
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();

  const uploadFile = useCallback(
    async (file: File, reportId: string) => {
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please log in to upload files",
          variant: "destructive",
        });
        return { success: false, error: "Not authenticated" };
      }

      setUploading(true);
      setProgress(0);

      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        const result = await evidenceService.uploadFile(
          file,
          reportId,
          user.id,
        );

        clearInterval(progressInterval);
        setProgress(100);

        if (result.success) {
          toast({
            title: "File Uploaded",
            description: "Your evidence has been uploaded successfully",
          });
        } else {
          toast({
            title: "Upload Failed",
            description: result.error || "Failed to upload file",
            variant: "destructive",
          });
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        toast({
          title: "Upload Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      } finally {
        setUploading(false);
        setTimeout(() => setProgress(0), 1000); // Reset progress after a delay
      }
    },
    [user?.id],
  );

  return {
    uploadFile,
    uploading,
    progress,
  };
}

/**
 * Hook for creating support tickets
 */
export function useCreateSupportTicket() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const createTicket = useCallback(
    async (ticketData: Omit<SupportTicketInsert, "user_id">) => {
      if (!user?.id) {
        toast({
          title: "Authentication Required",
          description: "Please log in to create a support ticket",
          variant: "destructive",
        });
        return { success: false, error: "Not authenticated" };
      }

      setLoading(true);

      try {
        const result = await supportTicketsService.create({
          ...ticketData,
          user_id: user.id,
        });

        if (result.success) {
          toast({
            title: "Support Ticket Created",
            description: "Your support ticket has been submitted successfully",
          });
        } else {
          toast({
            title: "Failed to Create Ticket",
            description: result.error || "Unknown error occurred",
            variant: "destructive",
          });
        }

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return { success: false, error: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    [user?.id],
  );

  return { createTicket, loading };
}

/**
 * Hook for real-time report updates
 */
export function useRealtimeReports(userId?: string) {
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = realtimeService.subscribeToReports((payload) => {
      console.log("Report update:", payload);
      setUpdates((prev) => [payload, ...prev.slice(0, 9)]); // Keep last 10 updates
    }, userId);

    return unsubscribe;
  }, [userId]);

  return { updates };
}
