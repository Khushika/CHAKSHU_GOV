import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Download,
  Filter,
  MapPin,
  Plus,
  BarChart,
  PieChart,
  RefreshCw,
  Mic,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import QuickStatsCards from "@/components/dashboard/QuickStatsCards";
import ReportingHistoryTable from "@/components/dashboard/ReportingHistoryTable";
import FraudTrendsCharts from "@/components/dashboard/FraudTrendsCharts";
import EnhancedDashboardFilters from "@/components/dashboard/EnhancedDashboardFilters";
import FraudHotspotsMap from "@/components/dashboard/FraudHotspotsMap";
import CommunityReportsFeed from "@/components/dashboard/CommunityReportsFeed";

import IndiaFraudMap from "@/components/maps/IndiaFraudMap";
import NavigationButtons from "@/components/common/NavigationButtons";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import AuthGuard from "@/components/auth/AuthGuard";
import DatabaseStatus from "@/components/common/DatabaseStatus";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [filters, setFilters] = useState({
    dateRange: { preset: "last30days" },
    status: [],
    fraudTypes: [],
    severity: [],
    location: "",
    amountRange: {},
  });

  // Load user preferences
  useEffect(() => {
    const savedFilters = localStorage.getItem("dashboard-filters");
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (error) {
        console.error("Failed to load saved filters:", error);
      }
    }
  }, []);

  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem("dashboard-filters", JSON.stringify(filters));
  }, [filters]);

  const handleExportData = async () => {
    try {
      toast({
        title: "Export Started",
        description:
          "Preparing your personal fraud reports data for download...",
      });

      // Simulate data export
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const data = {
        personal_reports: {
          total_reports: 12,
          pending: 3,
          resolved: 8,
          under_review: 1,
        },
        date_range: filters.dateRange,
        filters: filters,
        exported_at: new Date().toISOString(),
        note: "This export contains your personal fraud reporting data",
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `personal-fraud-reports-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description:
          "Your personal fraud reports data has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNewReport = () => {
    toast({
      title: "Redirecting",
      description: "Taking you to the fraud reporting form...",
    });
    navigate("/?report=true");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Simulate data refresh
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setLastRefresh(new Date());
      toast({
        title: "Dashboard Refreshed",
        description: "All data has been updated with the latest information.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    toast({
      title: "Filters Updated",
      description:
        "Dashboard data has been filtered according to your selection.",
    });
  };

  return (
    <AuthGuard message="Sign in to access your personal fraud protection dashboard with report tracking and insights.">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
        <Header />

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b transition-colors">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Welcome back, {user?.user_metadata?.full_name || "User"}
                </h1>
                <p className="text-gray-600 dark:text-white">
                  Monitor your fraud reports and community activity
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Last updated: {lastRefresh.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {/* Refresh Button */}
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                  {isRefreshing ? "Refreshing..." : "Refresh"}
                </Button>

                {/* Export Button */}
                <Button
                  variant="outline"
                  onClick={handleExportData}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Data
                </Button>

                {/* New Report Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleNewReport}
                    variant="outline"
                    className="flex items-center gap-2"
                    size="lg"
                  >
                    <Plus className="h-4 w-4" />
                    New Report
                  </Button>

                  <Button
                    onClick={() => navigate("/voice-reporting")}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                    size="lg"
                  >
                    <Mic className="h-4 w-4" />
                    Record New Report
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-6">
          {/* Navigation Buttons */}
          <NavigationButtons />

          {/* Enhanced Filters */}
          <div className="mb-6">
            <EnhancedDashboardFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Quick Stats */}
          <div className="mb-8">
            <QuickStatsCards />
          </div>

          {/* Database Status - Show if there are issues */}
          <div className="mb-6">
            <DatabaseStatus />
          </div>

          {/* Personal Reporting History - Moved to Top */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="h-5 w-5" />
                  Personal Reporting History
                </CardTitle>
                <CardDescription>
                  Track the status and details of your submitted reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Enhanced Filters Section */}
                <EnhancedDashboardFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  className="mb-6"
                />
                <ReportingHistoryTable filters={filters} />
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-6">
              <FraudTrendsCharts />

              {/* India Fraud Map */}
              <IndiaFraudMap />
            </div>

            {/* Right Column - Community Feed */}
            <div className="space-y-6">
              <CommunityReportsFeed />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate("/voice-reporting")}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Mic className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Voice Report
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-white">
                      Record fraud report using voice
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BarChart className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      View Analytics
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-white">
                      Detailed insights on fraud trends
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link to="/community">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <PieChart className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Community
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-white">
                        Join fraud prevention discussions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/education">
              <Card className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Bell className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Learn & Protect
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-white">
                        Educational resources
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Dashboard;
