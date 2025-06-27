import { supabase, isDemoMode } from "@/integrations/supabase/client";
import { seedDatabase } from "./database-seeder";

/**
 * Automatically seeds the database if it's empty and user is authenticated
 * This is designed to run on app initialization for better UX
 */
export async function autoSeedIfEmpty(): Promise<void> {
  // Skip in demo mode
  if (isDemoMode) {
    console.log("Auto-seeding skipped: Demo mode active");
    return;
  }

  try {
    // Check if user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.log("Auto-seeding skipped: No authenticated user");
      return;
    }

    // Check if database already has data
    const { data: existingReports, error } = await supabase
      .from("fraud_reports")
      .select("id")
      .limit(1);

    if (error) {
      console.warn(
        "Auto-seeding skipped: Error checking existing data:",
        error.message,
      );
      return;
    }

    if (existingReports && existingReports.length > 0) {
      console.log("Auto-seeding skipped: Database already contains data");
      return;
    }

    // Check if this is likely a new user (no preferences set)
    const { data: userPrefs } = await supabase
      .from("user_analytics_preferences")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (userPrefs && userPrefs.length > 0) {
      console.log("Auto-seeding skipped: User preferences exist");
      return;
    }

    console.log(
      "Auto-seeding: Database appears empty for new user, seeding...",
    );

    // Perform seeding in background
    const result = await seedDatabase();

    if (result.success) {
      console.log("Auto-seeding completed successfully:", result.details);

      // Show a subtle notification if there's a toast system available
      if (typeof window !== "undefined" && window.dispatchEvent) {
        window.dispatchEvent(
          new CustomEvent("auto-seed-complete", {
            detail: {
              message: "Sample data loaded for demonstration purposes",
            },
          }),
        );
      }
    } else {
      console.warn("Auto-seeding failed:", result.message);
    }
  } catch (error) {
    console.warn("Auto-seeding error:", error);
  }
}

/**
 * Initialize auto-seeding with proper error handling and debouncing
 */
export function initializeAutoSeeding(): void {
  // Use a small delay to ensure auth state is settled
  setTimeout(() => {
    autoSeedIfEmpty().catch((error) => {
      console.warn("Auto-seeding initialization failed:", error);
    });
  }, 1000);
}
