import { supabase, isDemoMode } from "@/integrations/supabase/client";
import { mockReportsData } from "@/data/mockReports";

export interface DatabaseSeedingResult {
  success: boolean;
  message: string;
  details?: {
    reports?: number;
    notifications?: number;
    userPreferences?: number;
    interactions?: number;
  };
  errors?: string[];
}

/**
 * Seeds the database with initial sample data for development and demo purposes
 */
export async function seedDatabase(): Promise<DatabaseSeedingResult> {
  if (isDemoMode) {
    return {
      success: false,
      message: "Cannot seed database in demo mode. Supabase is not configured.",
    };
  }

  const errors: string[] = [];
  const details = {
    reports: 0,
    notifications: 0,
    userPreferences: 0,
    interactions: 0,
  };

  try {
    // First, check if we have any existing data
    const { data: existingReports } = await supabase
      .from("fraud_reports")
      .select("id")
      .limit(1);

    if (existingReports && existingReports.length > 0) {
      return {
        success: false,
        message:
          "Database already contains data. Seeding skipped to prevent duplicates.",
      };
    }

    // Get current user for seeding
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "User must be authenticated to seed database.",
      };
    }

    // 1. Seed Reports
    console.log("Seeding reports...");
    const reportsToSeed = mockReportsData.map((mockReport, index) => {
      // Map legacy fraud types to database enum values
      const fraudTypeMap: Record<string, string> = {
        Phishing: "phishing",
        "SMS Fraud": "sms_fraud",
        "Call Fraud": "call_fraud",
        "UPI Fraud": "other",
        "WhatsApp Scam": "other",
        "Investment Fraud": "investment_scam",
        "Job Fraud": "other",
        "Email Spam": "email_spam",
        "Online Shopping Fraud": "other",
        "Credit Card Fraud": "other",
        "Insurance Fraud": "other",
        "Social Media Fraud": "other",
      };

      // Map legacy statuses to database enum values
      const statusMap: Record<string, string> = {
        Resolved: "resolved",
        "Under Review": "under_review",
        Escalated: "pending",
        Pending: "pending",
        Rejected: "rejected",
      };

      const [city, state] = mockReport.location.split(",").map((s) => s.trim());

      return {
        id: mockReport.id,
        title: mockReport.title || `${mockReport.type} Report`,
        description: mockReport.description,
        fraud_type: fraudTypeMap[mockReport.type] || "other",
        status: statusMap[mockReport.status] || "pending",
        amount_involved: mockReport.amount,
        currency: "INR",
        estimated_loss: mockReport.amount,
        city: city,
        state: state,
        country: "India",
        user_id: user.id,
        created_at:
          mockReport.submittedAt?.toISOString() ||
          new Date(mockReport.date).toISOString(),
        updated_at:
          mockReport.updatedAt?.toISOString() ||
          new Date(mockReport.date).toISOString(),
        incident_date: mockReport.date,
        contact_info: mockReport.phoneNumber
          ? { phone: mockReport.phoneNumber }
          : null,
        // Add some sample coordinates for Indian cities
        latitude: getLatitudeForCity(city),
        longitude: getLongitudeForCity(city),
      };
    });

    const { data: insertedReports, error: reportsError } = await supabase
      .from("fraud_reports")
      .insert(reportsToSeed)
      .select();

    if (reportsError) {
      errors.push(`Reports seeding error: ${reportsError.message}`);
    } else {
      details.reports = insertedReports?.length || 0;
      console.log(`✓ Seeded ${details.reports} reports`);
    }

    // 2. Seed Notifications
    console.log("Seeding notifications...");
    const notifications = [
      {
        user_id: user.id,
        type: "system_announcement",
        title: "Welcome to Chakshu Portal",
        message:
          "Thank you for joining the fight against fraud. Your account has been successfully created.",
        priority: "medium",
        data: { welcome: true },
      },
      {
        user_id: user.id,
        type: "fraud_warning",
        title: "New Fraud Alert in Your Area",
        message:
          "Several phishing attempts have been reported in your location. Stay vigilant.",
        priority: "high",
        data: { alert_type: "regional", fraud_type: "phishing" },
      },
      {
        user_id: user.id,
        type: "case_update",
        title: "Report Status Updated",
        message:
          "Your recent fraud report has been reviewed and is now under investigation.",
        priority: "medium",
        data: { report_id: reportsToSeed[0]?.id },
      },
      {
        user_id: user.id,
        type: "community_alert",
        title: "Community Milestone Reached",
        message:
          "Great news! Our community has successfully helped resolve over 1000 fraud cases.",
        priority: "low",
        data: { milestone: 1000 },
      },
      {
        user_id: user.id,
        type: "security_alert",
        title: "Security Tip of the Day",
        message:
          "Never share your OTP or banking credentials over phone calls, even if the caller claims to be from your bank.",
        priority: "medium",
        data: { tip_category: "banking" },
      },
    ];

    const { data: insertedNotifications, error: notificationsError } =
      await supabase.from("notifications").insert(notifications).select();

    if (notificationsError) {
      errors.push(`Notifications seeding error: ${notificationsError.message}`);
    } else {
      details.notifications = insertedNotifications?.length || 0;
      console.log(`✓ Seeded ${details.notifications} notifications`);
    }

    // 3. Seed User Analytics Preferences
    console.log("Seeding user preferences...");
    const userPreferences = {
      user_id: user.id,
      dashboard_filters: {
        dateRange: { preset: "last30days" },
        status: [],
        fraudTypes: [],
        severity: [],
        location: "",
        amountRange: {},
      },
      notification_settings: {
        case_updates: true,
        fraud_warnings: true,
        community_alerts: true,
        system_announcements: true,
        security_alerts: true,
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
      },
    };

    const { data: insertedPreferences, error: preferencesError } =
      await supabase
        .from("user_analytics_preferences")
        .insert(userPreferences)
        .select();

    if (preferencesError) {
      errors.push(
        `User preferences seeding error: ${preferencesError.message}`,
      );
    } else {
      details.userPreferences = insertedPreferences?.length || 0;
      console.log(`✓ Seeded ${details.userPreferences} user preference sets`);
    }

    // 4. Seed Community Interactions (if we have reports)
    if (insertedReports && insertedReports.length > 0) {
      console.log("Seeding community interactions...");
      const interactions = [
        {
          report_id: insertedReports[0].id,
          user_id: user.id,
          interaction_type: "helpful",
          content:
            "This report helped me identify a similar scam. Thank you for sharing!",
        },
        {
          report_id: insertedReports[1].id,
          user_id: user.id,
          interaction_type: "similar_experience",
          content:
            "I received a similar SMS last week. The pattern matches exactly.",
        },
        {
          report_id: insertedReports[2].id,
          user_id: user.id,
          interaction_type: "comment",
          content:
            "Has anyone else received calls from this number? We should report to telecom authorities.",
        },
      ];

      const { data: insertedInteractions, error: interactionsError } =
        await supabase
          .from("community_interactions")
          .insert(interactions)
          .select();

      if (interactionsError) {
        errors.push(
          `Community interactions seeding error: ${interactionsError.message}`,
        );
      } else {
        details.interactions = insertedInteractions?.length || 0;
        console.log(`✓ Seeded ${details.interactions} community interactions`);
      }
    }

    // 5. Seed Report Status History
    if (insertedReports && insertedReports.length > 0) {
      console.log("Seeding report status history...");
      const statusHistory = insertedReports.flatMap((report) => [
        {
          report_id: report.id,
          status: "pending",
          changed_by: user.id,
          comments: "Report submitted and awaiting initial review.",
          created_at: report.created_at,
        },
        ...(report.status !== "pending"
          ? [
              {
                report_id: report.id,
                status: report.status,
                changed_by: user.id,
                comments: getStatusChangeComment(report.status),
                created_at: new Date(
                  new Date(report.created_at).getTime() + 24 * 60 * 60 * 1000,
                ).toISOString(),
              },
            ]
          : []),
      ]);

      const { error: historyError } = await supabase
        .from("report_status_history")
        .insert(statusHistory);

      if (historyError) {
        errors.push(
          `Report status history seeding error: ${historyError.message}`,
        );
      } else {
        console.log(`✓ Seeded ${statusHistory.length} status history entries`);
      }
    }

    if (errors.length > 0) {
      return {
        success: false,
        message: `Database seeding completed with some errors.`,
        details,
        errors,
      };
    }

    return {
      success: true,
      message: `Database seeding completed successfully!`,
      details,
    };
  } catch (error) {
    console.error("Database seeding failed:", error);
    return {
      success: false,
      message: `Database seeding failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
}

/**
 * Clears all seeded data (for development purposes)
 */
export async function clearSeedData(): Promise<DatabaseSeedingResult> {
  if (isDemoMode) {
    return {
      success: false,
      message:
        "Cannot clear database in demo mode. Supabase is not configured.",
    };
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        success: false,
        message: "User must be authenticated to clear seed data.",
      };
    }

    // Clear in reverse order due to foreign key constraints
    await supabase
      .from("community_interactions")
      .delete()
      .eq("user_id", user.id);
    await supabase
      .from("report_status_history")
      .delete()
      .eq("changed_by", user.id);
    await supabase.from("notifications").delete().eq("user_id", user.id);
    await supabase
      .from("user_analytics_preferences")
      .delete()
      .eq("user_id", user.id);
    await supabase.from("fraud_reports").delete().eq("user_id", user.id);

    return {
      success: true,
      message: "All seeded data cleared successfully!",
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to clear seed data: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

// Helper functions
function getLatitudeForCity(city: string): number | null {
  const coordinates: Record<string, [number, number]> = {
    Mumbai: [19.076, 72.8777],
    Delhi: [28.7041, 77.1025],
    Bangalore: [12.9716, 77.5946],
    Pune: [18.5204, 73.8567],
    Hyderabad: [17.385, 78.4867],
    Chennai: [13.0827, 80.2707],
    Kolkata: [22.5726, 88.3639],
    Ahmedabad: [23.0225, 72.5714],
    Jaipur: [26.9124, 75.7873],
    Indore: [22.7196, 75.8577],
    Lucknow: [26.8467, 80.9462],
    Bhopal: [23.2599, 77.4126],
  };

  return coordinates[city]?.[0] || null;
}

function getLongitudeForCity(city: string): number | null {
  const coordinates: Record<string, [number, number]> = {
    Mumbai: [19.076, 72.8777],
    Delhi: [28.7041, 77.1025],
    Bangalore: [12.9716, 77.5946],
    Pune: [18.5204, 73.8567],
    Hyderabad: [17.385, 78.4867],
    Chennai: [13.0827, 80.2707],
    Kolkata: [22.5726, 88.3639],
    Ahmedabad: [23.0225, 72.5714],
    Jaipur: [26.9124, 75.7873],
    Indore: [22.7196, 75.8577],
    Lucknow: [26.8467, 80.9462],
    Bhopal: [23.2599, 77.4126],
  };

  return coordinates[city]?.[1] || null;
}

function getStatusChangeComment(status: string): string {
  const comments: Record<string, string> = {
    under_review:
      "Report has been assigned to an investigator and is under detailed review.",
    resolved: "Investigation completed. Appropriate action has been taken.",
    rejected: "Report does not meet the criteria for further investigation.",
    withdrawn: "Report has been withdrawn by the user.",
  };

  return comments[status] || "Status updated.";
}
