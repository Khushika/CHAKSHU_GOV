import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  reportsService,
  communityPostsService,
  communityCommentsService,
  userProfilesService,
  notificationsService,
  ServiceResponse,
} from "@/services/database";

// Generic CRUD hook interface
interface CRUDHookReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  create: (item: Partial<T>) => Promise<ServiceResponse<T>>;
  update: (id: string, updates: Partial<T>) => Promise<ServiceResponse<T>>;
  remove: (id: string) => Promise<ServiceResponse<boolean>>;
  refresh: () => Promise<void>;
  pagination: {
    page: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    setPage: (page: number) => void;
  };
}

// Generic CRUD hook
export function useCRUD<T extends { id: string }>(
  serviceFn: any,
  deps: any[] = [],
): CRUDHookReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await serviceFn(page);
      if (response.success) {
        if (Array.isArray(response.data)) {
          setData(response.data);
        } else if (response.data?.reports) {
          setData(response.data.reports);
          setTotalPages(response.data.page_info?.total_pages || 1);
          setHasNext(response.data.page_info?.has_next || false);
          setHasPrev(response.data.page_info?.has_prev || false);
        } else if (response.data?.posts) {
          setData(response.data.posts);
        }
      } else {
        setError(response.error || "Failed to load data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [serviceFn, page, ...deps]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const create = async (item: Partial<T>): Promise<ServiceResponse<T>> => {
    try {
      const response = await serviceFn.create(item);
      if (response.success) {
        await loadData(); // Refresh data
        toast({
          title: "Success",
          description: "Item created successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create item.",
          variant: "destructive",
        });
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage, success: false };
    }
  };

  const update = async (
    id: string,
    updates: Partial<T>,
  ): Promise<ServiceResponse<T>> => {
    try {
      const response = await serviceFn.update(id, updates);
      if (response.success) {
        await loadData(); // Refresh data
        toast({
          title: "Success",
          description: "Item updated successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to update item.",
          variant: "destructive",
        });
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage, success: false };
    }
  };

  const remove = async (id: string): Promise<ServiceResponse<boolean>> => {
    try {
      const response = await serviceFn.delete(id);
      if (response.success) {
        await loadData(); // Refresh data
        toast({
          title: "Success",
          description: "Item deleted successfully.",
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete item.",
          variant: "destructive",
        });
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage, success: false };
    }
  };

  const refresh = async (): Promise<void> => {
    await loadData();
  };

  const handleSetPage = (newPage: number) => {
    setPage(newPage);
  };

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
    refresh,
    pagination: {
      page,
      totalPages,
      hasNext,
      hasPrev,
      setPage: handleSetPage,
    },
  };
}

// Specialized hooks for different entity types

// Reports CRUD hook
export function useReports(filters: any = {}) {
  const { user } = useAuth();

  const loadReports = useCallback(
    async (page: number = 1) => {
      return reportsService.getAll(filters, page, 10);
    },
    [filters],
  );

  return useCRUD(
    {
      ...loadReports,
      create: reportsService.create.bind(reportsService),
      update: reportsService.update.bind(reportsService),
      delete: reportsService.delete.bind(reportsService),
    },
    [filters],
  );
}

// User reports hook
export function useUserReports() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({});
  const { toast } = useToast();

  const loadUserReports = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await reportsService.getUserReports(user.id);
      if (response.success && response.data) {
        setData(response.data.reports);
        setStats(response.data.stats);
      } else {
        setError(response.error || "Failed to load reports");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadUserReports();
  }, [loadUserReports]);

  const createReport = async (reportData: any) => {
    if (!user)
      return { data: null, error: "User not authenticated", success: false };

    try {
      const response = await reportsService.create({
        ...reportData,
        user_id: user.id,
      });

      if (response.success) {
        await loadUserReports();
        toast({
          title: "Report Submitted",
          description: "Your fraud report has been submitted successfully.",
        });
      }

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage, success: false };
    }
  };

  const updateReport = async (id: string, updates: any) => {
    try {
      const response = await reportsService.update(id, updates, user?.id);
      if (response.success) {
        await loadUserReports();
        toast({
          title: "Report Updated",
          description: "Your report has been updated successfully.",
        });
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage, success: false };
    }
  };

  const deleteReport = async (id: string) => {
    try {
      const response = await reportsService.delete(id, user?.id);
      if (response.success) {
        await loadUserReports();
        toast({
          title: "Report Deleted",
          description: "Your report has been withdrawn successfully.",
        });
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage, success: false };
    }
  };

  return {
    data,
    loading,
    error,
    stats,
    createReport,
    updateReport,
    deleteReport,
    refresh: loadUserReports,
  };
}

// Community posts hook
export function useCommunityPosts(filters: any = {}) {
  const { user } = useAuth();

  const loadPosts = useCallback(
    async (page: number = 1) => {
      return communityPostsService.getPosts(filters, page, 10);
    },
    [filters],
  );

  const createPost = async (postData: any) => {
    if (!user)
      return { data: null, error: "User not authenticated", success: false };

    return communityPostsService.createPost({
      ...postData,
      user_id: user.id,
    });
  };

  const crudHook = useCRUD(
    {
      ...loadPosts,
      create: createPost,
      update: () =>
        Promise.resolve({
          data: null,
          error: "Not implemented",
          success: false,
        }),
      delete: () =>
        Promise.resolve({
          data: null,
          error: "Not implemented",
          success: false,
        }),
    },
    [filters],
  );

  const toggleLike = async (postId: string) => {
    if (!user)
      return { data: null, error: "User not authenticated", success: false };

    try {
      const response = await communityPostsService.toggleLike(postId, user.id);
      if (response.success) {
        await crudHook.refresh();
      }
      return response;
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Unknown error",
        success: false,
      };
    }
  };

  return {
    ...crudHook,
    toggleLike,
  };
}

// Comments hook
export function useComments(postId: string) {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadComments = useCallback(async () => {
    if (!postId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await communityCommentsService.getComments(postId);
      if (response.success) {
        setData(response.data || []);
      } else {
        setError(response.error || "Failed to load comments");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const addComment = async (content: string, parentId?: string) => {
    if (!user)
      return { data: null, error: "User not authenticated", success: false };

    try {
      const response = await communityCommentsService.addComment({
        post_id: postId,
        user_id: user.id,
        content,
        parent_comment_id: parentId,
      });

      if (response.success) {
        await loadComments();
        toast({
          title: "Comment Added",
          description: "Your comment has been posted successfully.",
        });
      }

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage, success: false };
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    if (!user)
      return { data: null, error: "User not authenticated", success: false };

    try {
      const response = await communityCommentsService.updateComment(
        commentId,
        content,
        user.id,
      );
      if (response.success) {
        await loadComments();
        toast({
          title: "Comment Updated",
          description: "Your comment has been updated successfully.",
        });
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage, success: false };
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!user)
      return { data: null, error: "User not authenticated", success: false };

    try {
      const response = await communityCommentsService.deleteComment(
        commentId,
        user.id,
      );
      if (response.success) {
        await loadComments();
        toast({
          title: "Comment Deleted",
          description: "Your comment has been deleted successfully.",
        });
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage, success: false };
    }
  };

  return {
    data,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
    refresh: loadComments,
  };
}

// Profile hook
export function useProfile() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({});
  const { toast } = useToast();

  const loadProfile = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const [profileResponse, statsResponse] = await Promise.all([
        userProfilesService.getProfile(user.id),
        userProfilesService.getUserStats(user.id),
      ]);

      if (profileResponse.success) {
        setData(profileResponse.data);
      }

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (!profileResponse.success && !statsResponse.success) {
        setError("Failed to load profile data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = async (updates: any) => {
    if (!user)
      return { data: null, error: "User not authenticated", success: false };

    try {
      const response = await userProfilesService.updateProfile(
        user.id,
        updates,
      );
      if (response.success) {
        await loadProfile();
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      }
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return { data: null, error: errorMessage, success: false };
    }
  };

  return {
    data,
    loading,
    error,
    stats,
    updateProfile,
    refresh: loadProfile,
  };
}

// Notifications hook
export function useNotifications() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  const loadNotifications = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await notificationsService.getUserNotifications(user.id);
      if (response.success && response.data) {
        setData(response.data.notifications);
        setUnreadCount(response.data.unread_count);
      } else {
        setError(response.error || "Failed to load notifications");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;

    try {
      const response = await notificationsService.markAsRead(
        notificationId,
        user.id,
      );
      if (response.success) {
        await loadNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const response = await notificationsService.markAllAsRead(user.id);
      if (response.success) {
        await loadNotifications();
        toast({
          title: "All Notifications Marked as Read",
          description: "All your notifications have been marked as read.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notifications as read.",
        variant: "destructive",
      });
    }
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) return;

    try {
      const response = await notificationsService.deleteNotification(
        notificationId,
        user.id,
      );
      if (response.success) {
        await loadNotifications();
        toast({
          title: "Notification Deleted",
          description: "The notification has been deleted.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete notification.",
        variant: "destructive",
      });
    }
  };

  return {
    data,
    loading,
    error,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refresh: loadNotifications,
  };
}

export default useCRUD;
