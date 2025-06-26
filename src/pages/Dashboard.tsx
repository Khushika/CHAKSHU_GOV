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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 lg:gap-6">
              <div className="w-full lg:w-auto">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back, {user?.user_metadata?.full_name || "User"}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-white mb-1">
                  Monitor your fraud reports and community activity
                </p>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {lastRefresh.toLocaleString()}
                </p>
              </div>

              <div className="w-full lg:w-auto">
                {/* Mobile Layout - Stacked */}
                <div className="flex flex-col sm:hidden gap-3">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="flex-1 flex items-center justify-center gap-2 touch-manipulation"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                      />
                      {isRefreshing ? "Refreshing..." : "Refresh"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      className="flex-1 flex items-center justify-center gap-2 touch-manipulation"
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleNewReport}
                      variant="outline"
                      className="flex-1 flex items-center justify-center gap-2 touch-manipulation"
                    >
                      <Plus className="h-4 w-4" />
                      New Report
                    </Button>
                    <Button
                      onClick={() => navigate("/voice-reporting")}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
                    >
                      <Mic className="h-4 w-4" />
                      Voice Report
                    </Button>
                  </div>
                </div>

                {/* Tablet and Desktop Layout */}
                <div className="hidden sm:flex items-center gap-3 lg:gap-4 flex-wrap lg:flex-nowrap">
                  {/* Action Buttons Row 1 */}
                  <div className="flex gap-2 lg:gap-3">
                    <Button
                      variant="outline"
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      className="flex items-center gap-2 touch-manipulation text-sm lg:text-base"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                      />
                      <span className="hidden md:inline">
                        {isRefreshing ? "Refreshing..." : "Refresh"}
                      </span>
                    </Button>

                    <Button
                      variant="outline"
                      onClick={handleExportData}
                      className="flex items-center gap-2 touch-manipulation text-sm lg:text-base"
                    >
                      <Download className="h-4 w-4" />
                      <span className="hidden md:inline">Export Data</span>
                    </Button>
                  </div>

                  {/* Action Buttons Row 2 */}
                  <div className="flex gap-2 lg:gap-3">
                    <Button
                      onClick={handleNewReport}
                      variant="outline"
                      className="flex items-center gap-2 touch-manipulation text-sm lg:text-base"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden md:inline">New Report</span>
                    </Button>

                    <Button
                      onClick={() => navigate("/voice-reporting")}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation text-sm lg:text-base"
                    >
                      <Mic className="h-4 w-4" />
                      <span className="hidden md:inline">Voice Report</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
          {/* Navigation Buttons */}
          <div className="mb-4 sm:mb-6">
            <NavigationButtons />
          </div>

          {/* Enhanced Filters */}
          <div className="mb-4 sm:mb-6">
            <EnhancedDashboardFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </div>

          {/* Quick Stats */}
          <div className="mb-6 sm:mb-8">
            <QuickStatsCards />
          </div>

          {/* Personal Reporting History - Enhanced for Mobile */}
          <div className="mb-6 sm:mb-8">
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader className="pb-4 sm:pb-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <BarChart className="h-4 w-4 sm:h-5 sm:w-5" />
                  Personal Reporting History
                </CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Track the status and details of your submitted reports
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {/* Enhanced Filters Section - Hidden on mobile to avoid redundancy */}
                <div className="hidden lg:block mb-6">
                  <EnhancedDashboardFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    className="mb-6"
                  />
                </div>
                <div className="overflow-x-auto">
                  <ReportingHistoryTable filters={filters} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Dashboard Grid - Enhanced Responsive Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            {/* Left Column - Charts */}
            <div className="xl:col-span-2 space-y-4 sm:space-y-6">
              <FraudTrendsCharts />

              {/* India Fraud Map */}
              <IndiaFraudMap />
            </div>

            {/* Right Column - Community Feed */}
            <div className="space-y-4 sm:space-y-6">
              <CommunityReportsFeed />
            </div>
          </div>

          {/* Quick Actions - Enhanced Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <Card
              className="cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 touch-manipulation"
              onClick={() => navigate("/voice-reporting")}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="p-2 sm:p-3 bg-green-100 rounded-lg flex-shrink-0">
                    <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                      Voice Report
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-white line-clamp-2">
                      Record fraud report using voice
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link to="/analytics" className="block">
              <Card className="h-full cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 touch-manipulation">
                <CardContent className="p-4 sm:p-6 h-full">
                  <div className="flex items-center gap-3 sm:gap-4 h-full">
                    <div className="p-2 sm:p-3 bg-blue-100 rounded-lg flex-shrink-0">
                      <BarChart className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                        View Analytics
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-white line-clamp-2">
                        Detailed insights on fraud trends
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/community" className="block">
              <Card className="h-full cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 touch-manipulation">
                <CardContent className="p-4 sm:p-6 h-full">
                  <div className="flex items-center gap-3 sm:gap-4 h-full">
                    <div className="p-2 sm:p-3 bg-emerald-100 rounded-lg flex-shrink-0">
                      <PieChart className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                        Community
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-white line-clamp-2">
                        Join fraud prevention discussions
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link to="/education" className="block">
              <Card className="h-full cursor-pointer hover:shadow-md hover:scale-105 transition-all duration-200 touch-manipulation">
                <CardContent className="p-4 sm:p-6 h-full">
                  <div className="flex items-center gap-3 sm:gap-4 h-full">
                    <div className="p-2 sm:p-3 bg-purple-100 rounded-lg flex-shrink-0">
                      <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white truncate">
                        Learn & Protect
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-white line-clamp-2">
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
