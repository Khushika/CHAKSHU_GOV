/**
 * CRUD Operations Tester
 * Component to test all database CRUD operations
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  CheckCircle,
  XCircle,
  Database,
  User,
  FileText,
  MessageSquare,
  Bell,
  Settings,
} from "lucide-react";

import {
  reportsService,
  userProfilesService,
  notificationsService,
  communityService,
  evidenceService,
  supportTicketsService,
  educationService,
  faqService,
  fraudAlertsService,
  databaseService,
  apiHelpers,
  type Report,
  type UserProfile,
  type Notification,
  type ServiceResponse,
} from "@/services/database";

import { authService } from "@/services/auth";
import { isDemoMode } from "@/integrations/supabase/client";
import SupabaseStatus from "./SupabaseStatus";

interface TestResult {
  operation: string;
  success: boolean;
  message: string;
  data?: any;
  timestamp: Date;
}

const CRUDTester: React.FC = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [testData, setTestData] = useState({
    reportTitle: "Test Fraud Report",
    reportDescription: "This is a test fraud report for CRUD testing",
    fraudType: "phishing" as const,
    amount: 1000,
    profileName: "Test User",
    profileEmail: "test@example.com",
    notificationTitle: "Test Notification",
    notificationMessage: "This is a test notification",
  });

  useEffect(() => {
    checkCurrentUser();
  }, []);

  const addResult = (operation: string, response: ServiceResponse<any>) => {
    const result: TestResult = {
      operation,
      success: response.success,
      message: response.error || response.message || "Operation completed",
      data: response.data,
      timestamp: new Date(),
    };
    setResults((prev) => [result, ...prev]);
  };

  const checkCurrentUser = async () => {
    const userResult = await authService.getCurrentUser();
    if (userResult.success) {
      setCurrentUser(userResult.user);
    }
  };

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const result = await databaseService.healthCheck();
      addResult("Database Health Check", result);
    } catch (error) {
      addResult("Database Health Check", {
        data: null,
        error: error instanceof Error ? error.message : "Health check failed",
        success: false,
      });
    }
    setLoading(false);
  };

  const testReportsCRUD = async () => {
    setLoading(true);

    if (!currentUser) {
      addResult("Reports CRUD Test", {
        data: null,
        error: "No authenticated user found",
        success: false,
      });
      setLoading(false);
      return;
    }

    try {
      // Create Report
      const createData = {
        user_id: currentUser.id,
        title: testData.reportTitle,
        description: testData.reportDescription,
        fraud_type: testData.fraudType,
        amount_involved: testData.amount,
        currency: "INR",
        city: "Test City",
        state: "Test State",
      };

      const createResult = await apiHelpers.createReport(createData);
      addResult("Create Report", createResult);

      if (createResult.success && createResult.data) {
        const reportId = createResult.data.id;

        // Read Report
        const readResult = await reportsService.getById(reportId);
        addResult("Read Report", readResult);

        // Update Report
        const updateResult = await reportsService.update(reportId, {
          title: testData.reportTitle + " (Updated)",
          description: testData.reportDescription + " (Updated)",
        });
        addResult("Update Report", updateResult);

        // Get User Reports
        const userReportsResult = await reportsService.getUserReports(
          currentUser.id,
        );
        addResult("Get User Reports", userReportsResult);

        // Get Report Statistics
        const statsResult = await reportsService.getStats();
        addResult("Get Report Statistics", statsResult);

        // Delete Report (cleanup)
        const deleteResult = await reportsService.delete(reportId);
        addResult("Delete Report", deleteResult);
      }
    } catch (error) {
      addResult("Reports CRUD Test Error", {
        data: null,
        error:
          error instanceof Error ? error.message : "Reports CRUD test failed",
        success: false,
      });
    }

    setLoading(false);
  };

  const testUserProfileCRUD = async () => {
    setLoading(true);

    if (!currentUser) {
      addResult("User Profile CRUD Test", {
        data: null,
        error: "No authenticated user found",
        success: false,
      });
      setLoading(false);
      return;
    }

    try {
      // Get Profile
      const getResult = await userProfilesService.getProfile(currentUser.id);
      addResult("Get User Profile", getResult);

      // Upsert Profile
      const upsertData = {
        user_id: currentUser.id,
        full_name: testData.profileName,
        email: testData.profileEmail,
        phone_number: "+1234567890",
        city: "Test City",
        state: "Test State",
        country: "India",
        profile_completed: true,
      };

      const upsertResult = await userProfilesService.upsertProfile(upsertData);
      addResult("Upsert User Profile", upsertResult);

      // Get Activity Summary
      const activityResult = await userProfilesService.getUserActivitySummary(
        currentUser.id,
      );
      addResult("Get User Activity Summary", activityResult);

      // Update Notification Preferences
      const preferencesResult =
        await userProfilesService.updateNotificationPreferences(
          currentUser.id,
          { email: true, sms: false, push: true },
        );
      addResult("Update Notification Preferences", preferencesResult);
    } catch (error) {
      addResult("User Profile CRUD Test Error", {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "User profile CRUD test failed",
        success: false,
      });
    }

    setLoading(false);
  };

  const testNotificationsCRUD = async () => {
    setLoading(true);

    if (!currentUser) {
      addResult("Notifications CRUD Test", {
        data: null,
        error: "No authenticated user found",
        success: false,
      });
      setLoading(false);
      return;
    }

    try {
      // Create Notification
      const createData = {
        user_id: currentUser.id,
        type: "system_announcement" as const,
        title: testData.notificationTitle,
        message: testData.notificationMessage,
        priority: "medium" as const,
      };

      const createResult = await notificationsService.create(createData);
      addResult("Create Notification", createResult);

      if (createResult.success && createResult.data) {
        const notificationId = createResult.data.id;

        // Get User Notifications
        const getUserNotificationsResult =
          await notificationsService.getUserNotifications(currentUser.id);
        addResult("Get User Notifications", getUserNotificationsResult);

        // Mark as Read
        const markReadResult =
          await notificationsService.markAsRead(notificationId);
        addResult("Mark Notification as Read", markReadResult);

        // Get Unread Count
        const unreadCountResult = await notificationsService.getUnreadCount(
          currentUser.id,
        );
        addResult("Get Unread Notifications Count", unreadCountResult);

        // Delete Notification (cleanup)
        const deleteResult = await notificationsService.delete(notificationId);
        addResult("Delete Notification", deleteResult);
      }
    } catch (error) {
      addResult("Notifications CRUD Test Error", {
        data: null,
        error:
          error instanceof Error
            ? error.message
            : "Notifications CRUD test failed",
        success: false,
      });
    }

    setLoading(false);
  };

  const testEducationCRUD = async () => {
    setLoading(true);

    try {
      // Get Published Articles
      const articlesResult = await educationService.getPublishedArticles();
      addResult("Get Published Articles", articlesResult);

      // Get Featured Articles
      const featuredResult = await educationService.getFeaturedArticles();
      addResult("Get Featured Articles", featuredResult);

      // Get FAQs
      const faqsResult = await faqService.getAll();
      addResult("Get All FAQs", faqsResult);

      // Get Featured FAQs
      const featuredFaqsResult = await faqService.getFeatured();
      addResult("Get Featured FAQs", featuredFaqsResult);

      // Search FAQs
      const searchResult = await faqService.search("fraud");
      addResult("Search FAQs", searchResult);
    } catch (error) {
      addResult("Education CRUD Test Error", {
        data: null,
        error:
          error instanceof Error ? error.message : "Education CRUD test failed",
        success: false,
      });
    }

    setLoading(false);
  };

  const testFraudAlerts = async () => {
    setLoading(true);

    try {
      // Get Active Alerts
      const activeAlertsResult = await fraudAlertsService.getActiveAlerts();
      addResult("Get Active Fraud Alerts", activeAlertsResult);

      // Get Alerts by Region
      const regionalAlertsResult =
        await fraudAlertsService.getAlertsByRegion("Delhi");
      addResult("Get Regional Fraud Alerts", regionalAlertsResult);

      // Get Alerts by Fraud Type
      const typeAlertsResult =
        await fraudAlertsService.getAlertsByFraudType("phishing");
      addResult("Get Fraud Type Alerts", typeAlertsResult);
    } catch (error) {
      addResult("Fraud Alerts Test Error", {
        data: null,
        error:
          error instanceof Error ? error.message : "Fraud alerts test failed",
        success: false,
      });
    }

    setLoading(false);
  };

  const runAllTests = async () => {
    setResults([]);
    await runHealthCheck();
    await testUserProfileCRUD();
    await testReportsCRUD();
    await testNotificationsCRUD();
    await testEducationCRUD();
    await testFraudAlerts();
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database CRUD Operations Tester
          </CardTitle>
          <CardDescription>
            Test all database operations to ensure proper functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            <Button onClick={runHealthCheck} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Health Check"
              )}
            </Button>
            <Button onClick={testReportsCRUD} disabled={loading}>
              Test Reports CRUD
            </Button>
            <Button onClick={testUserProfileCRUD} disabled={loading}>
              Test User Profile CRUD
            </Button>
            <Button onClick={testNotificationsCRUD} disabled={loading}>
              Test Notifications CRUD
            </Button>
            <Button onClick={testEducationCRUD} disabled={loading}>
              Test Education Content
            </Button>
            <Button onClick={testFraudAlerts} disabled={loading}>
              Test Fraud Alerts
            </Button>
            <Button onClick={runAllTests} disabled={loading} variant="outline">
              Run All Tests
            </Button>
            <Button onClick={clearResults} variant="secondary">
              Clear Results
            </Button>
          </div>

          <Tabs
            defaultValue={isDemoMode ? "status" : "config"}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="status" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Supabase Status
              </TabsTrigger>
              <TabsTrigger value="config">Test Configuration</TabsTrigger>
              <TabsTrigger value="results">
                Test Results ({results.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="status">
              <SupabaseStatus />
            </TabsContent>

            <TabsContent value="config" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportTitle">Report Title</Label>
                  <Input
                    id="reportTitle"
                    value={testData.reportTitle}
                    onChange={(e) =>
                      setTestData((prev) => ({
                        ...prev,
                        reportTitle: e.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fraudType">Fraud Type</Label>
                  <Select
                    value={testData.fraudType}
                    onValueChange={(value) =>
                      setTestData((prev) => ({
                        ...prev,
                        fraudType: value as any,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="phishing">Phishing</SelectItem>
                      <SelectItem value="sms_fraud">SMS Fraud</SelectItem>
                      <SelectItem value="call_fraud">Call Fraud</SelectItem>
                      <SelectItem value="investment_scam">
                        Investment Scam
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={testData.amount}
                    onChange={(e) =>
                      setTestData((prev) => ({
                        ...prev,
                        amount: Number(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profileName">Profile Name</Label>
                  <Input
                    id="profileName"
                    value={testData.profileName}
                    onChange={(e) =>
                      setTestData((prev) => ({
                        ...prev,
                        profileName: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportDescription">Report Description</Label>
                <Textarea
                  id="reportDescription"
                  value={testData.reportDescription}
                  onChange={(e) =>
                    setTestData((prev) => ({
                      ...prev,
                      reportDescription: e.target.value,
                    }))
                  }
                  rows={3}
                />
              </div>

              {currentUser && (
                <Alert>
                  <User className="h-4 w-4" />
                  <AlertDescription>
                    Authenticated as: {currentUser.email} (ID: {currentUser.id})
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="results">
              <div className="space-y-3">
                {results.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No test results yet. Run some tests to see results here.
                    </AlertDescription>
                  </Alert>
                ) : (
                  results.map((result, index) => (
                    <Card
                      key={index}
                      className={
                        result.success ? "border-green-200" : "border-red-200"
                      }
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {result.success ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            <div>
                              <h4 className="font-semibold">
                                {result.operation}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {result.message}
                              </p>
                              {result.data && (
                                <details className="mt-2">
                                  <summary className="text-xs text-blue-600 cursor-pointer">
                                    View Data
                                  </summary>
                                  <pre className="mt-1 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                                    {JSON.stringify(result.data, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge
                              variant={
                                result.success ? "default" : "destructive"
                              }
                            >
                              {result.success ? "Success" : "Failed"}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {result.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CRUDTester;
