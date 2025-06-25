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
import { Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReportDetailsModal, { Report } from "./ReportDetailsModal";
import { mockReportsData, type MockReport } from "@/data/mockReports";

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

const ReportingHistoryTable = ({ filters }: ReportingHistoryTableProps) => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof MockReport;
    direction: "asc" | "desc";
  }>({
    key: "date",
    direction: "desc",
  });
  const { toast } = useToast();

  // State for all reports including user reports
  const [allReports, setAllReports] = useState<MockReport[]>(mockReportsData);

  // Function to load user reports from localStorage
  const loadUserReports = () => {
    try {
      const userReports = JSON.parse(
        localStorage.getItem("user-fraud-reports") || "[]",
      );
      setAllReports([...userReports, ...mockReportsData]);
    } catch (error) {
      console.error("Failed to load user reports:", error);
      setAllReports(mockReportsData);
    }
  };

  // Load user reports on component mount and listen for updates
  useEffect(() => {
    loadUserReports();

    const handleUserReportsUpdate = () => {
      loadUserReports();
    };

    window.addEventListener("user-reports-updated", handleUserReportsUpdate);

    return () => {
      window.removeEventListener(
        "user-reports-updated",
        handleUserReportsUpdate,
      );
    };
  }, []);

  // Apply filters to the reports
  const filteredReports = allReports.filter((report) => {
    // Date range filter
    const reportDate = new Date(report.date);
    const now = new Date();

    if (filters.dateRange.preset && filters.dateRange.preset !== "all") {
      let cutoffDate = new Date();
      switch (filters.dateRange.preset) {
        case "7days":
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case "30days":
          cutoffDate.setDate(now.getDate() - 30);
          break;
        case "90days":
          cutoffDate.setDate(now.getDate() - 90);
          break;
        case "1year":
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          cutoffDate = new Date(0);
      }

      if (reportDate < cutoffDate) {
        return false;
      }
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(report.status)) {
      return false;
    }

    // Fraud type filter
    if (
      filters.fraudTypes.length > 0 &&
      !filters.fraudTypes.includes(report.type)
    ) {
      return false;
    }

    // Severity filter (using impact field)
    if (
      filters.severity.length > 0 &&
      !filters.severity.includes(report.impact)
    ) {
      return false;
    }

    // Location filter
    if (
      filters.location &&
      !report.location.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }

    // Amount range filter
    if (filters.amountRange.min !== undefined && report.amount) {
      if (report.amount < filters.amountRange.min) {
        return false;
      }
    }

    if (filters.amountRange.max !== undefined && report.amount) {
      if (report.amount > filters.amountRange.max) {
        return false;
      }
    }

    return true;
  });

  // Sort the filtered reports
  const sortedReports = [...filteredReports].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    // Handle date sorting specifically
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
    link.download = `fraud_reports_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Your reporting data has been exported to CSV.",
    });
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);

    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsRefreshing(false);

    toast({
      title: "Data Refreshed",
      description: "Your personal reporting history has been updated.",
    });
  };

  const handleViewDetails = (mockReport: MockReport) => {
    // Convert MockReport to Report format for the modal
    const convertedReport: Report = {
      id: mockReport.referenceId || mockReport.id,
      date: mockReport.date,
      type: mockReport.type,
      description: mockReport.description,
      status: mockReport.status,
      impact: mockReport.impact,
      title: mockReport.title || `${mockReport.type} Report`,
      incidentDate: mockReport.date,
      amountInvolved: mockReport.amount,
      contactInfo: {
        phone: mockReport.phoneNumber,
      },
      locationInfo: {
        address: mockReport.location,
        city: mockReport.location?.split(",")[0]?.trim(),
        state: mockReport.location?.split(",")[1]?.trim(),
      },
      evidenceFiles: mockReport.evidenceCount
        ? Array.from({ length: mockReport.evidenceCount }, (_, i) => ({
            name: `Evidence_${i + 1}.jpg`,
            size: Math.floor(Math.random() * 1000000) + 100000,
        uploadedAt: mockReport.submittedAt ? (mockReport.submittedAt instanceof Date ? mockReport.submittedAt.toISOString() : String(mockReport.submittedAt)) : mockReport.date,
        uploadedAt: mockReport.submittedAt ? (mockReport.submittedAt instanceof Date ? mockReport.submittedAt.toISOString() : String(mockReport.submittedAt)) : mockReport.date,
          }))
        : [],
      statusHistory: [
        {
          status: mockReport.status,
          date: mockReport.updatedAt ? (mockReport.updatedAt instanceof Date ? mockReport.updatedAt.toISOString().split("T")[0] : String(mockReport.updatedAt).split("T")[0]) : mockReport.date,
          comments: `Report ${mockReport.status.toLowerCase()}`,
        },
      ],
    };

    setSelectedReport(convertedReport);
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
    } else if (status === "Pending") {
      variant = "secondary";
    } else if (status === "Under Review") {
      variant = "outline";
    }

    return (
      <Badge variant={variant} className="text-xs">
        {status}
      </Badge>
    );
  };

  const getImpactBadge = (impact: string) => {
    let variant: "default" | "destructive" | "outline" | "secondary" =
      "outline";

    if (impact === "High" || impact === "Critical") {
      variant = "destructive";
    } else if (impact === "Medium") {
      variant = "default";
    } else {
      variant = "secondary";
    }

    return (
      <Badge variant={variant} className="text-xs">
        {impact}
      </Badge>
    );
  };

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No reports found
        </h3>
        <p className="text-gray-500">
          Try adjusting your search filters or create your first fraud report.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {reports.length} of {allReports.length} reports
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshData}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("date")}
            >
              Date {getSortIcon("date")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("type")}
            >
              Type {getSortIcon("type")}
            </TableHead>
            <TableHead>Description</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("status")}
            >
              Status {getSortIcon("status")}
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("impact")}
            >
              Impact {getSortIcon("impact")}
            </TableHead>
            <TableHead
              className="cursor-pointer text-right"
              onClick={() => handleSort("amount")}
            >
              Amount {getSortIcon("amount")}
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">
                {new Date(report.date).toLocaleDateString("en-IN")}
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium">{report.type}</span>
              </TableCell>
              <TableCell>
                <span className="text-sm line-clamp-2">
                  {report.description}
                </span>
              </TableCell>
              <TableCell>{getStatusBadge(report.status)}</TableCell>
              <TableCell>{getImpactBadge(report.impact)}</TableCell>
              <TableCell className="text-right">
                {report.amount ? (
                  <span className="font-medium">
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