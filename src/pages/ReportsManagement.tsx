import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AuthGuard from "@/components/auth/AuthGuard";
import NavigationButtons from "@/components/common/NavigationButtons";
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Phone,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Shield,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/currency";
import ReportDetailsModal from "@/components/dashboard/ReportDetailsModal";
import EditReportModal from "@/components/reports/EditReportModal";
import { mockReportsData, getReportStats } from "@/data/mockReports";

interface Report {
  id: string;
  type: string;
  title: string;
  description: string;
  phoneNumber: string;
  location: string;
  amount?: number;
  status: "pending" | "under_review" | "resolved" | "rejected" | "escalated";
  severity: "low" | "medium" | "high" | "critical";
  submittedAt: Date;
  updatedAt: Date;
  referenceId: string;
  evidenceCount: number;
}

// Convert shared mock data to ReportsManagement format
const convertToReportsFormat = (): Report[] => {
  return mockReportsData.map((report, index) => ({
    id: (index + 1).toString(),
    type: report.type,
    title: report.title || report.description,
    description: report.description,
    phoneNumber: report.phoneNumber || "+91-9876543210",
    location: report.location,
    amount: report.amount,
    status: report.status.toLowerCase().replace(" ", "_") as Report["status"],
    severity:
      report.severity || (report.impact.toLowerCase() as Report["severity"]),
    submittedAt: report.submittedAt || new Date(report.date),
    updatedAt: report.updatedAt || new Date(report.date),
    referenceId:
      report.referenceId || `FR-2024-${String(index + 1).padStart(6, "0")}`,
    evidenceCount: report.evidenceCount || Math.floor(Math.random() * 5) + 1,
  }));
};

const mockReports: Report[] = convertToReportsFormat();

const ReportsManagement = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showNewReportModal, setShowNewReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Function to load all reports (user + mock)
  const loadAllReports = () => {
    try {
      // Get user reports from localStorage
      const userReportsData = JSON.parse(
        localStorage.getItem("user-fraud-reports") || "[]",
      );

      // Convert user reports to Report format
      const userReports: Report[] = userReportsData.map((report: any) => ({
        id: report.id,
        type: report.type,
        title: report.title,
        description: report.description,
        phoneNumber: report.phoneNumber || "+91-9876543210",
        location: report.location,
        amount: report.amount,
        status: report.status
          .toLowerCase()
          .replace(" ", "_") as Report["status"],
        severity:
          report.severity ||
          (report.impact?.toLowerCase() as Report["severity"]) ||
          "medium",
        submittedAt: report.submittedAt
          ? new Date(report.submittedAt)
          : new Date(report.date),
        updatedAt: report.updatedAt
          ? new Date(report.updatedAt)
          : new Date(report.date),
        referenceId: report.referenceId,
        evidenceCount: report.evidenceCount || 0,
      }));

      // Combine user reports with mock reports
      const allReports = [...userReports, ...mockReports];
      setReports(allReports);
    } catch (error) {
      console.error("Failed to load user reports:", error);
      setReports(mockReports);
    }
  };

  // Load reports on component mount and listen for updates
  useEffect(() => {
    loadAllReports();

    const handleUserReportsUpdate = () => {
      loadAllReports();
    };

    window.addEventListener("user-reports-updated", handleUserReportsUpdate);

    return () => {
      window.removeEventListener(
        "user-reports-updated",
        handleUserReportsUpdate,
      );
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "under_review":
        return <Eye className="h-4 w-4 text-blue-600" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "escalated":
        return <AlertCircle className="h-4 w-4 text-purple-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "under_review":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "escalated":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.referenceId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleNewReport = () => {
    setShowNewReportModal(false);
    toast({
      title: "Redirecting to Report Form",
      description: "Taking you to the fraud reporting form...",
    });
    navigate("/?report=true");
  };

  const handleExportReports = () => {
    const data = {
      reports: filteredReports,
      exportDate: new Date().toISOString(),
      totalReports: filteredReports.length,
      summary: {
        pending: filteredReports.filter((r) => r.status === "pending").length,
        under_review: filteredReports.filter((r) => r.status === "under_review")
          .length,
        resolved: filteredReports.filter((r) => r.status === "resolved").length,
        rejected: filteredReports.filter((r) => r.status === "rejected").length,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `my-fraud-reports-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Reports Exported",
      description: "Your reports have been downloaded successfully.",
    });
  };

  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setIsViewModalOpen(true);
  };

  const handleEditReport = (report: Report) => {
    setSelectedReport(report);
    setIsEditModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedReport(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedReport(null);
  };

  const handleSaveReport = (updatedReport: Report) => {
    setReports((prevReports) =>
      prevReports.map((report) =>
        report.id === updatedReport.id ? updatedReport : report,
      ),
    );
    setIsEditModalOpen(false);
    setSelectedReport(null);
    toast({
      title: "Report Updated",
      description: "Your fraud report has been updated successfully.",
    });
  };

  const statusCounts = {
    all: reports.length,
    pending: reports.filter((r) => r.status === "pending").length,
    under_review: reports.filter((r) => r.status === "under_review").length,
    resolved: reports.filter((r) => r.status === "resolved").length,
    rejected: reports.filter((r) => r.status === "rejected").length,
    escalated: reports.filter((r) => r.status === "escalated").length,
  };

  return (
    <AuthGuard message="Sign in to access your fraud reports and track their status. Create an account to manage and monitor all your submissions.">
      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Header Section */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  My Fraud Reports
                </h1>
                <p className="text-gray-600">
                  Track and manage all your submitted fraud reports
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={handleExportReports}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export Reports
                </Button>

                <Dialog
                  open={showNewReportModal}
                  onOpenChange={setShowNewReportModal}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-india-saffron hover:bg-saffron-600 text-white flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200">
                      <Plus className="h-4 w-4" />
                      New Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Plus className="h-5 w-5 text-india-saffron" />
                        Create New Fraud Report
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <p className="text-gray-600">
                        Start a new fraud report to help protect yourself and
                        others from scammers.
                      </p>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm">
                              Quick & Secure
                            </p>
                            <p className="text-xs text-gray-600">
                              Your information is protected
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                          <FileText className="h-5 w-5 text-green-600" />
                          <div>
                            <p className="font-medium text-sm">
                              Evidence Support
                            </p>
                            <p className="text-xs text-gray-600">
                              Upload screenshots and recordings
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                          <Eye className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="font-medium text-sm">
                              Track Progress
                            </p>
                            <p className="text-xs text-gray-600">
                              Monitor report status in real-time
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowNewReportModal(false)}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleNewReport}
                          className="flex-1 bg-india-saffron hover:bg-saffron-600"
                        >
                          Start Report
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Navigation Buttons */}
          <NavigationButtons />

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search reports by title, description, or reference ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Status ({statusCounts.all})
                    </SelectItem>
                    <SelectItem value="pending">
                      Pending ({statusCounts.pending})
                    </SelectItem>
                    <SelectItem value="under_review">
                      Under Review ({statusCounts.under_review})
                    </SelectItem>
                    <SelectItem value="resolved">
                      Resolved ({statusCounts.resolved})
                    </SelectItem>
                    <SelectItem value="rejected">
                      Rejected ({statusCounts.rejected})
                    </SelectItem>
                    <SelectItem value="escalated">
                      Escalated ({statusCounts.escalated})
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="UPI Fraud">UPI Fraud</SelectItem>
                    <SelectItem value="Call Fraud">Call Fraud</SelectItem>
                    <SelectItem value="WhatsApp Scam">WhatsApp Scam</SelectItem>
                    <SelectItem value="SMS Fraud">SMS Fraud</SelectItem>
                    <SelectItem value="Email Spam">Email Spam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">
                    No reports found
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm ||
                    statusFilter !== "all" ||
                    typeFilter !== "all"
                      ? "Try adjusting your search criteria"
                      : "You haven't submitted any fraud reports yet"}
                  </p>
                  {!searchTerm &&
                    statusFilter === "all" &&
                    typeFilter === "all" && (
                      <Button
                        onClick={() => setShowNewReportModal(true)}
                        className="bg-india-saffron hover:bg-saffron-600"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Submit Your First Report
                      </Button>
                    )}
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => (
                <Card
                  key={report.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                      {/* Main Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg mb-1">
                              {report.title}
                            </h3>
                            <p className="text-gray-600 line-clamp-2">
                              {report.description}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="h-4 w-4" />
                            {report.phoneNumber}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-4 w-4" />
                            {report.location}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {format(report.submittedAt, "MMM dd, yyyy")}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>
                            Reference: <strong>{report.referenceId}</strong>
                          </span>
                          <span>•</span>
                          <span>{report.evidenceCount} evidence files</span>
                          {report.amount && (
                            <>
                              <span>•</span>
                              <span>
                                Amount:{" "}
                                <strong>{formatCurrency(report.amount)}</strong>
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status and Actions */}
                      <div className="flex flex-col gap-3 lg:items-end">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={`flex items-center gap-1 ${getStatusColor(report.status)}`}
                          >
                            {getStatusIcon(report.status)}
                            {report.status.replace("_", " ").toUpperCase()}
                          </Badge>
                          <Badge
                            className={`${getSeverityColor(report.severity)}`}
                          >
                            {report.severity.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewReport(report)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditReport(report)}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>

                        <div className="text-xs text-gray-500">
                          Updated {format(report.updatedAt, "MMM dd, yyyy")}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* View Report Modal */}
        {selectedReport && (
          <ReportDetailsModal
            isOpen={isViewModalOpen}
            onClose={handleCloseViewModal}
            report={{
              id: selectedReport.referenceId,
              date: selectedReport.submittedAt.toISOString().split("T")[0],
              type: selectedReport.type,
              description: selectedReport.description,
              status: selectedReport.status.replace("_", " "),
              impact: selectedReport.severity,
            }}
          />
        )}

        {/* Edit Report Modal */}
        <EditReportModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          report={selectedReport}
          onSave={handleSaveReport}
        />
      </div>
    </AuthGuard>
  );
};

export default ReportsManagement;
