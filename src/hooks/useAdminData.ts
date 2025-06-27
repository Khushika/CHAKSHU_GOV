import { useState, useEffect } from "react";
import { supabase, isDemoMode } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Types for admin data
export interface AdminStats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  rejectedReports: number;
  activeUsers: number;
  totalAmount: number;
  averageResponseTime: number;
  monthlyGrowth: {
    reports: number;
    users: number;
    amount: number;
  };
}

export interface ReportWithUser {
  id: string;
  title: string;
  description: string;
  fraud_type: string;
  status: string;
  amount_involved: number | null;
  currency: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  priority?: "low" | "medium" | "high" | "critical";
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  last_seen: string | null;
  reports_count: number;
  status: "active" | "inactive" | "suspended";
}

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  created_at: string;
  user_id: string;
  user_email?: string;
}

// Custom hooks for admin data
export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (isDemoMode) {
      // Return mock stats for demo mode
      setStats({
        totalReports: 12847,
        pendingReports: 234,
        resolvedReports: 11890,
        rejectedReports: 723,
        activeUsers: 45623,
        totalAmount: 8920000,
        averageResponseTime: 2.4,
        monthlyGrowth: {
          reports: 12.5,
          users: 7.8,
          amount: 22.1,
        },
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch reports statistics
      const { data: reportsData, error: reportsError } = await supabase
        .from("fraud_reports")
        .select("status, created_at");

      if (reportsError) throw reportsError;

      // Fetch user count (using auth.users metadata if available)
      const { count: usersCount, error: usersError } = await supabase
        .from("user_analytics_preferences")
        .select("*", { count: "exact", head: true });

      if (usersError) console.warn("Could not fetch user count:", usersError);

      // Calculate stats
      const totalReports = reportsData?.length || 0;
      const pendingReports =
        reportsData?.filter((r) => r.status === "pending").length || 0;
      const resolvedReports =
        reportsData?.filter((r) => r.status === "resolved").length || 0;
      const rejectedReports =
        reportsData?.filter((r) => r.status === "rejected").length || 0;
      const totalAmount =
        reportsData?.reduce((sum, r) => sum + (r.amount_involved || 0), 0) || 0;

      // Calculate monthly growth (simplified)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const recentReports =
        reportsData?.filter((r) => new Date(r.created_at) >= lastMonth)
          .length || 0;

      const monthlyGrowth = {
        reports: totalReports > 0 ? (recentReports / totalReports) * 100 : 0,
        users: 7.8, // Placeholder since we can't easily track user growth
        amount: totalAmount > 0 ? 15.0 : 0, // Placeholder
      };

      setStats({
        totalReports,
        pendingReports,
        resolvedReports,
        rejectedReports,
        activeUsers: usersCount || 1,
        totalAmount,
        averageResponseTime: 2.4, // Placeholder - would need status history to calculate
        monthlyGrowth,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
}

export function useAdminReports() {
  const [reports, setReports] = useState<ReportWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReports = async () => {
    if (isDemoMode) {
      // Return mock reports for demo mode
      const mockReports: ReportWithUser[] = [
        {
          id: "RPT-2024-001",
          title: "Phone Scam Report",
          description: "Received fraudulent call claiming to be from bank",
          fraud_type: "call_fraud",
          status: "under_review",
          amount_involved: 50000,
          currency: "INR",
          city: "Mumbai",
          state: "Maharashtra",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: "demo-user",
          user_email: "rajesh.kumar@example.com",
          user_name: "Rajesh Kumar",
          priority: "high",
        },
        {
          id: "RPT-2024-002",
          title: "SMS Fraud Alert",
          description: "Lottery scam message requesting processing fee",
          fraud_type: "sms_fraud",
          status: "pending",
          amount_involved: 15000,
          currency: "INR",
          city: "Delhi",
          state: "Delhi",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString(),
          user_id: "demo-user",
          user_email: "priya.sharma@example.com",
          user_name: "Priya Sharma",
          priority: "medium",
        },
        {
          id: "RPT-2024-003",
          title: "UPI Fraud Case",
          description: "Unauthorized UPI transaction through phishing link",
          fraud_type: "other",
          status: "pending",
          amount_involved: 125000,
          currency: "INR",
          city: "Bangalore",
          state: "Karnataka",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString(),
          user_id: "demo-user",
          user_email: "amit.singh@example.com",
          user_name: "Amit Singh",
          priority: "critical",
        },
      ];
      setReports(mockReports);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("fraud_reports")
        .select(
          `
          id,
          description,
          report_type,
          fraud_category,
          status,
          currency,
          city,
          state,
          created_at,
          updated_at,
          user_id
        `,
        )
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Transform data and add priority logic
      const reportsWithUsers: ReportWithUser[] = (data || []).map((report) => ({
        ...report,
        user_email: `user-${report.user_id.slice(0, 8)}@example.com`, // Placeholder
        user_name: `User ${report.user_id.slice(0, 8)}`, // Placeholder
        priority: calculatePriority(report.amount_involved, report.fraud_type),
      }));

      setReports(reportsWithUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch reports");
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (
    reportId: string,
    newStatus: string,
    comments?: string,
  ) => {
    try {
      const { error } = await supabase
        .from("fraud_reports")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      // Add to status history
      await supabase.from("report_status_history").insert({
        report_id: reportId,
        status: newStatus,
        comments: comments || `Status changed to ${newStatus}`,
        changed_by: (await supabase.auth.getUser()).data.user?.id,
      });

      toast({
        title: "Status Updated",
        description: `Report ${reportId} has been updated to ${newStatus}`,
      });

      // Refresh data
      fetchReports();
    } catch (err) {
      toast({
        title: "Update Failed",
        description:
          err instanceof Error ? err.message : "Failed to update report status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return { reports, loading, error, refetch: fetchReports, updateReportStatus };
}

export function useAdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    if (isDemoMode) {
      // Return mock users for demo mode
      const mockUsers: UserProfile[] = [
        {
          id: "user-1",
          email: "rajesh.kumar@example.com",
          full_name: "Rajesh Kumar",
          created_at: new Date(Date.now() - 2592000000).toISOString(),
          last_seen: new Date(Date.now() - 86400000).toISOString(),
          reports_count: 3,
          status: "active",
        },
        {
          id: "user-2",
          email: "priya.sharma@example.com",
          full_name: "Priya Sharma",
          created_at: new Date(Date.now() - 1296000000).toISOString(),
          last_seen: new Date(Date.now() - 172800000).toISOString(),
          reports_count: 1,
          status: "active",
        },
      ];
      setUsers(mockUsers);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch user preferences (proxy for users)
      const { data: userPrefs, error: prefsError } = await supabase
        .from("user_analytics_preferences")
        .select("user_id, created_at");

      if (prefsError) throw prefsError;

      // Get reports count per user
      const { data: reportCounts, error: reportsError } = await supabase
        .from("fraud_reports")
        .select("user_id")
        .not("user_id", "is", null);

      if (reportsError)
        console.warn("Could not fetch report counts:", reportsError);

      // Build user profiles
      const userProfiles: UserProfile[] = (userPrefs || []).map((pref) => {
        const reportsCount =
          reportCounts?.filter((r) => r.user_id === pref.user_id).length || 0;

        return {
          id: pref.user_id,
          email: `user-${pref.user_id.slice(0, 8)}@example.com`,
          full_name: `User ${pref.user_id.slice(0, 8)}`,
          created_at: pref.created_at,
          last_seen: new Date(
            Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          reports_count: reportsCount,
          status: reportsCount > 0 ? "active" : "inactive",
        };
      });

      setUsers(userProfiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, error, refetch: fetchUsers };
}

export function useAdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    if (isDemoMode) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("notifications")
        .select(
          `
          id,
          type,
          title,
          message,
          priority,
          created_at,
          user_id
        `,
        )
        .order("created_at", { ascending: false })
        .limit(50);

      if (fetchError) throw fetchError;

      const notificationsWithUsers: AdminNotification[] = (data || []).map(
        (notif) => ({
          ...notif,
          user_email: `user-${notif.user_id.slice(0, 8)}@example.com`,
        }),
      );

      setNotifications(notificationsWithUsers);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch notifications",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return { notifications, loading, error, refetch: fetchNotifications };
}

// Helper functions
function calculatePriority(
  amount: number | null,
  fraudType: string,
): "low" | "medium" | "high" | "critical" {
  if (!amount) return "low";

  if (amount >= 100000) return "critical";
  if (amount >= 50000) return "high";
  if (amount >= 10000) return "medium";
  return "low";
}

// Export utility function for manual data refresh
export function useAdminDataRefresh() {
  const { refetch: refetchStats } = useAdminStats();
  const { refetch: refetchReports } = useAdminReports();
  const { refetch: refetchUsers } = useAdminUsers();
  const { refetch: refetchNotifications } = useAdminNotifications();

  const refreshAllData = async () => {
    await Promise.all([
      refetchStats(),
      refetchReports(),
      refetchUsers(),
      refetchNotifications(),
    ]);
  };

  return { refreshAllData };
}
