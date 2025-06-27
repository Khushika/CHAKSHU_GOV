import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, RefreshCw, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReportDetailsModal, { Report } from "./ReportDetailsModal";
import {
  reportsService,
  type Report as DatabaseReport,
} from "@/services/database";
import { useAuth } from "@/contexts/AuthContext";

interface ReportingHistoryTableProps {
  filters: {
    dateRange: { preset: string };
    status: string[];
    fraudTypes: string[];
    severity: string[];
    location: string;
    amountRange: { min?: number; max?: number };
  };
}

interface MockReport {
  id: string;
  date: string;
  type: string;
  description: string;
  status: string;
  impact: string;
  amount?: number;
  location: string;
}

// Convert database report to mock report format for compatibility
const convertToMockFormat = (report: DatabaseReport): MockReport => {
  return {
    id: report.id,
    date: new Date(report.created_at).toLocaleDateString(),
    type: report.report_type
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    description: report.description,
    status: report.status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase()),
    impact: report.priority.replace(/\b\w/g, (l) => l.toUpperCase()), // Use priority as impact
    amount: undefined, // Not stored in fraud_reports schema
    location: "Not specified", // Not stored in this schema
  };
};

const ReportingHistoryTable = ({ filters }: ReportingHistoryTableProps) => {
  const { user } = useAuth();
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [allReports, setAllReports] = useState<MockReport[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof MockReport;
    direction: "asc" | "desc";
  }>({
    key: "date",
    direction: "desc",
  });
  const { toast } = useToast();

  // Load reports from database
  useEffect(() => {
    const loadReports = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await reportsService.getUserReports(user.id);
        if (result.success && result.data) {
          const mockReports = result.data.map(convertToMockFormat);
          setAllReports(mockReports);
        } else {
          console.error("Failed to load reports:", result.error);
          setAllReports([]);
        }
      } catch (error) {
        console.error("Error loading reports:", error);
        setAllReports([]);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, [user]);

  // Apply filters to the reports
  const filteredReports = allReports.filter((report) => {
    // Date range filter
    const reportDate = new Date(report.date);
    const now = new Date();

    if (filters.dateRange.preset && filters.dateRange.preset !== "all") {
      let dateThreshold = new Date();
      switch (filters.dateRange.preset) {
        case "last7days":
          dateThreshold.setDate(now.getDate() - 7);
          break;
        case "last30days":
          dateThreshold.setDate(now.getDate() - 30);
          break;
        case "last90days":
          dateThreshold.setDate(now.getDate() - 90);
          break;
        case "last12months":
          dateThreshold.setFullYear(now.getFullYear() - 1);
          break;
        case "lastyear":
          dateThreshold.setFullYear(now.getFullYear() - 1);
          break;
        default:
          dateThreshold = new Date(0); // No filter
      }

      if (reportDate < dateThreshold) {
        return false;
      }
    }

    // Custom date range filter
    if (filters.dateRange.customStart || filters.dateRange.customEnd) {
      if (
        filters.dateRange.customStart &&
        reportDate < filters.dateRange.customStart
      ) {
        return false;
      }
      if (
        filters.dateRange.customEnd &&
        reportDate > filters.dateRange.customEnd
      ) {
        return false;
      }
    }

    // Status filter (case insensitive)
    if (filters.status.length > 0) {
      const matchesStatus = filters.status.some(
        (status) =>
          report.status.toLowerCase().includes(status.toLowerCase()) ||
          status.toLowerCase().includes(report.status.toLowerCase()),
      );
      if (!matchesStatus) {
        return false;
      }
    }

    // Fraud types filter (case insensitive)
    if (filters.fraudTypes.length > 0) {
      const matchesFraudType = filters.fraudTypes.some(
        (type) =>
          report.type.toLowerCase().includes(type.toLowerCase()) ||
          type.toLowerCase().includes(report.type.toLowerCase()),
      );
      if (!matchesFraudType) {
        return false;
      }
    }

    // Severity filter (maps to impact field)
    if (filters.severity.length > 0) {
      const matchesSeverity = filters.severity.some(
        (severity) =>
          report.impact.toLowerCase().includes(severity.toLowerCase()) ||
          severity.toLowerCase().includes(report.impact.toLowerCase()),
      );
      if (!matchesSeverity) {
        return false;
      }
    }

    // Location filter (enhanced search)
    if (filters.location && filters.location.trim()) {
      const locationTerms = filters.location.toLowerCase().split(" ");
      const reportLocation = report.location.toLowerCase();
      const matchesLocation = locationTerms.every((term) =>
        reportLocation.includes(term),
      );
      if (!matchesLocation) {
        return false;
      }
    }

    // Amount range filter (with null safety)
    if (
      filters.amountRange?.min &&
      (report.amount || 0) < filters.amountRange.min
    ) {
      return false;
    }
    if (
      filters.amountRange?.max &&
      (report.amount || 0) > filters.amountRange.max
    ) {
      return false;
    }

    return true;
  });

  // Sort the filtered reports
  const sortedReports = [...filteredReports].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue === undefined || aValue === null) return 1;
    if (bValue === undefined || bValue === null) return -1;

    // Handle different data types
    if (sortConfig.key === "date") {
      const aDate = new Date(aValue as string);
      const bDate = new Date(bValue as string);
      return sortConfig.direction === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    if (sortConfig.key === "amount") {
      const aAmount = (aValue as number) || 0;
      const bAmount = (bValue as number) || 0;
      return sortConfig.direction === "asc"
        ? aAmount - bAmount
        : bAmount - aAmount;
    }

    // String comparison
    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();

    if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
    if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Ensure we always show some data - if filters result in no data, show recent reports
  const reports =
    sortedReports.length > 0 ? sortedReports : allReports.slice(0, 5);

  const handleSort = (key: keyof MockReport) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  const getSortIcon = (key: keyof MockReport) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? " ↑" : " ↓";
  };

  const handleExportData = () => {
    const exportData = sortedReports.map((report) => ({
      "Report ID": report.id,
      Date: report.date,
      Type: report.type,
      Description: report.description,
      Status: report.status,
      Impact: report.impact,
      Amount: report.amount ? `₹${report.amount.toLocaleString("en-IN")}` : "-",
      Location: report.location,
    }));

    const csvContent = [
      Object.keys(exportData[0] || {}).join(","),
      ...exportData.map((row) =>
        Object.values(row)
          .map((value) => `"${value}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `personal-reports-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: `Exported ${sortedReports.length} reports to CSV file.`,
    });
  };

  const handleRefresh = async () => {
    if (!user) return;

    setIsRefreshing(true);
    try {
      const result = await reportsService.getUserReports(user.id);
      if (result.success && result.data) {
        const mockReports = result.data.map(convertToMockFormat);
        setAllReports(mockReports);
        toast({
          title: "Data Refreshed",
          description: "Your personal reporting history has been updated.",
        });
      } else {
        throw new Error(result.error || "Failed to refresh reports");
      }
    } catch (error) {
      console.error("Error refreshing reports:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh your reports. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewDetails = (report: Report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const getStatusBadge = (status: string) => {
    let variant: "default" | "destructive" | "outline" | "secondary" =
      "outline";

    if (status === "Resolved") {
      variant = "default";
    } else if (status === "Under Review") {
      variant = "secondary";
    } else if (status === "Pending") {
      variant = "outline";
    }

    return <Badge variant={variant}>{status}</Badge>;
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      Medium:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };
    return (
      <Badge className={colors[impact as keyof typeof colors]}>{impact}</Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filter Summary and Actions */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Showing {filteredReports.length} of {allReports.length} reports
          {filteredReports.length !== allReports.length && (
            <span className="ml-2 text-india-saffron">• Filtered</span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw
              className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          {sortedReports.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="flex items-center gap-1"
            >
              <Download className="h-3 w-3" />
              Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* Active Filter Tags */}
      {(filters.dateRange.preset !== "all" ||
        filters.status.length > 0 ||
        filters.fraudTypes.length > 0 ||
        filters.location) && (
        <div className="flex flex-wrap gap-1 mb-4">
          {filters.dateRange.preset !== "all" && (
            <Badge variant="outline" className="text-xs">
              {filters.dateRange.preset === "last7days" && "Last 7 days"}
              {filters.dateRange.preset === "last30days" && "Last 30 days"}
              {filters.dateRange.preset === "last90days" && "Last 90 days"}
              {filters.dateRange.preset === "last12months" && "Last 12 months"}
            </Badge>
          )}
          {filters.status.length > 0 && (
            <Badge variant="outline" className="text-xs">
              Status: {filters.status.length} selected
            </Badge>
          )}
          {filters.fraudTypes.length > 0 && (
            <Badge variant="outline" className="text-xs">
              Types: {filters.fraudTypes.length} selected
            </Badge>
          )}
          {filters.location && (
            <Badge variant="outline" className="text-xs">
              Location: {filters.location}
            </Badge>
          )}
        </div>
      )}

      {/* No Results Message */}
      {filteredReports.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <div className="text-center">
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
              <span className="font-medium">
                No reports match your current filters
              </span>
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-300 mb-3">
              Try adjusting your filter criteria or clear filters to see all
              reports
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Reset filters to show all reports
                window.location.reload();
              }}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
              onClick={() => handleSort("id")}
            >
              Report ID{getSortIcon("id")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
              onClick={() => handleSort("date")}
            >
              Date{getSortIcon("date")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
              onClick={() => handleSort("type")}
            >
              Type{getSortIcon("type")}
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
              onClick={() => handleSort("status")}
            >
              Status{getSortIcon("status")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
              onClick={() => handleSort("impact")}
            >
              Impact{getSortIcon("impact")}
            </TableHead>
            <TableHead
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
              onClick={() => handleSort("amount")}
            >
              Amount{getSortIcon("amount")}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.id}</TableCell>
              <TableCell>{report.date}</TableCell>
              <TableCell>{report.type}</TableCell>
              <TableCell className="max-w-xs truncate">
                {report.description}
              </TableCell>
              <TableCell>{getStatusBadge(report.status)}</TableCell>
              <TableCell>{getImpactBadge(report.impact)}</TableCell>
              <TableCell>
                {report.amount ? (
                  <span className="text-sm font-medium">
                    ₹{report.amount.toLocaleString("en-IN")}
                  </span>
                ) : (
                  <span className="text-gray-400 text-sm">-</span>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewDetails(report)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedReport && (
        <ReportDetailsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          report={selectedReport}
        />
      )}
    </div>
  );
};

export default ReportingHistoryTable;
