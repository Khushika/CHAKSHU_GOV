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
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  ThumbsUp,
  Share2,
  MapPin,
  Calendar,
  Search,
  Filter,
  AlertTriangle,
  Flag,
  Eye,
  TrendingUp,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatCurrencyCompact } from "@/lib/currency";

interface CommunityReport {
  id: string;
  type: string;
  title: string;
  description: string;
  location: {
    city: string;
    state: string;
  };
  amount?: number;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: Date;
  helpfulVotes: number;
  hasVoted: boolean;
  isVerified: boolean;
  tags: string[];
  viewCount: number;
}

interface Filters {
  search: string;
  location: string;
  fraudType: string;
  severity: string;
  timeRange: string;
  sortBy: string;
}

// Mock data for community reports
const generateMockReports = (): CommunityReport[] => [
  {
    id: "1",
    type: "UPI Fraud",
    title: "Fake UPI payment confirmation scam",
    description:
      'Received fake payment confirmation screenshot and asked to refund "extra" amount. Almost fell for it but verified with bank first.',
    location: { city: "Mumbai", state: "Maharashtra" },
    amount: 15000,
    severity: "high",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    helpfulVotes: 24,
    hasVoted: false,
    isVerified: true,
    tags: ["UPI", "Screenshot", "Refund"],
    viewCount: 156,
  },
  {
    id: "2",
    type: "Call Fraud",
    title: 'Fake KYC update call from "bank"',
    description:
      "Someone called claiming to be from SBI asking for OTP to update KYC. They knew my account number! Reported to cyber cell.",
    location: { city: "Delhi", state: "Delhi" },
    severity: "critical",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    helpfulVotes: 31,
    hasVoted: true,
    isVerified: true,
    tags: ["KYC", "OTP", "Banking"],
    viewCount: 203,
  },
  {
    id: "3",
    type: "WhatsApp Scam",
    title: 'Emergency help scam from "relative"',
    description:
      "Got WhatsApp message from unknown number claiming to be my cousin urgently needing money for medical emergency. Family confirmed it was fake.",
    location: { city: "Bangalore", state: "Karnataka" },
    amount: 25000,
    severity: "medium",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    helpfulVotes: 18,
    hasVoted: false,
    isVerified: false,
    tags: ["WhatsApp", "Emergency", "Family"],
    viewCount: 89,
  },
  {
    id: "4",
    type: "Investment Scam",
    title: "Cryptocurrency doubling scheme on Telegram",
    description:
      "Telegram group promised to double Bitcoin investment in 24 hours. Showed fake testimonials and screenshots. Blocked before investing.",
    location: { city: "Pune", state: "Maharashtra" },
    amount: 50000,
    severity: "high",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    helpfulVotes: 42,
    hasVoted: false,
    isVerified: true,
    tags: ["Cryptocurrency", "Telegram", "Investment"],
    viewCount: 267,
  },
  {
    id: "5",
    type: "Job Scam",
    title: "Fake work from home data entry job",
    description:
      'Company asked for ₹2000 registration fee for "training materials". Said they would reimburse after first month. Obviously fake.',
    location: { city: "Chennai", state: "Tamil Nadu" },
    amount: 2000,
    severity: "medium",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    helpfulVotes: 15,
    hasVoted: false,
    isVerified: false,
    tags: ["Job", "Work from home", "Registration fee"],
    viewCount: 134,
  },
  {
    id: "6",
    type: "Lottery Scam",
    title: 'Won "international lottery" I never entered',
    description:
      "Email saying I won ₹50,00,000 in Microsoft lottery. Asked for bank details and processing fee. Marked as spam immediately.",
    location: { city: "Kolkata", state: "West Bengal" },
    severity: "low",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    helpfulVotes: 8,
    hasVoted: true,
    isVerified: false,
    tags: ["Lottery", "Email", "Microsoft"],
    viewCount: 67,
  },
];

const EnhancedCommunityReports: React.FC = () => {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    location: "",
    fraudType: "",
    severity: "",
    timeRange: "",
    sortBy: "recent",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 3;
  const { toast } = useToast();

  useEffect(() => {
    setReports(generateMockReports());
  }, []);

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

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
      case "high":
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const filteredReports = reports.filter((report) => {
    if (
      filters.search &&
      !report.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !report.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    if (
      filters.location &&
      !report.location.city
        .toLowerCase()
        .includes(filters.location.toLowerCase()) &&
      !report.location.state
        .toLowerCase()
        .includes(filters.location.toLowerCase())
    ) {
      return false;
    }
    if (filters.fraudType && report.type !== filters.fraudType) return false;
    if (filters.severity && report.severity !== filters.severity) return false;
    if (filters.timeRange) {
      const now = new Date();
      const reportTime = report.timestamp;
      const hoursDiff =
        (now.getTime() - reportTime.getTime()) / (1000 * 60 * 60);

      switch (filters.timeRange) {
        case "last24h":
          if (hoursDiff > 24) return false;
          break;
        case "last7d":
          if (hoursDiff > 24 * 7) return false;
          break;
        case "last30d":
          if (hoursDiff > 24 * 30) return false;
          break;
      }
    }
    return true;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (filters.sortBy) {
      case "helpful":
        return b.helpfulVotes - a.helpfulVotes;
      case "views":
        return b.viewCount - a.viewCount;
      case "severity":
        const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      case "recent":
      default:
        return b.timestamp.getTime() - a.timestamp.getTime();
    }
  });

  const paginatedReports = sortedReports.slice(
    (currentPage - 1) * reportsPerPage,
    currentPage * reportsPerPage,
  );

  const totalPages = Math.ceil(sortedReports.length / reportsPerPage);

  const handleVote = (reportId: string) => {
    setReports((prev) =>
      prev.map((report) => {
        if (report.id === reportId) {
          return {
            ...report,
            hasVoted: !report.hasVoted,
            helpfulVotes: report.hasVoted
              ? report.helpfulVotes - 1
              : report.helpfulVotes + 1,
          };
        }
        return report;
      }),
    );

    toast({
      title: "Vote recorded",
      description: "Thank you for helping the community!",
    });
  };

  const handleShare = (report: CommunityReport) => {
    navigator.clipboard.writeText(
      `Check out this fraud alert: ${report.title} - ${window.location.origin}/community/report/${report.id}`,
    );
    toast({
      title: "Link copied",
      description: "Report link copied to clipboard",
    });
  };

  const handleReport = (reportId: string) => {
    toast({
      title: "Report submitted",
      description:
        "Thank you for helping keep the community safe. We'll review this content.",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-india-saffron" />
            Community Fraud Reports
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{sortedReports.length} reports</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1"
            >
              <Filter className="h-3 w-3" />
              Filters
            </Button>
          </div>
        </div>

        {/* Search and Quick Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reports, locations, fraud types..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="pl-10"
              />
            </div>
          </div>

          <Select
            value={filters.sortBy}
            onValueChange={(value) =>
              setFilters((prev) => ({ ...prev, sortBy: value }))
            }
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="helpful">Most Helpful</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
              <SelectItem value="severity">By Severity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t">
            <Input
              placeholder="Filter by location..."
              value={filters.location}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, location: e.target.value }))
              }
            />

            <Select
              value={filters.fraudType || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  fraudType: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Fraud Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="UPI Fraud">UPI Fraud</SelectItem>
                <SelectItem value="Call Fraud">Call Fraud</SelectItem>
                <SelectItem value="WhatsApp Scam">WhatsApp Scam</SelectItem>
                <SelectItem value="Investment Scam">Investment Scam</SelectItem>
                <SelectItem value="Job Scam">Job Scam</SelectItem>
                <SelectItem value="Lottery Scam">Lottery Scam</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.severity || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  severity: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.timeRange || "all"}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  timeRange: value === "all" ? "" : value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="last24h">Last 24 Hours</SelectItem>
                <SelectItem value="last7d">Last 7 Days</SelectItem>
                <SelectItem value="last30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Reports List */}
        <div className="space-y-4">
          {paginatedReports.map((report) => (
            <Card
              key={report.id}
              className="border-l-4 border-l-india-saffron hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">
                          {report.title}
                        </h3>
                        {report.isVerified && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 text-xs"
                          >
                            ✓ Verified
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {report.location.city}, {report.location.state}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(report.timestamp, {
                            addSuffix: true,
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {report.viewCount} views
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <Badge
                        className={`text-xs flex items-center gap-1 ${getSeverityColor(report.severity)}`}
                      >
                        {getSeverityIcon(report.severity)}
                        {report.severity.toUpperCase()}
                      </Badge>
                      {report.amount && (
                        <Badge variant="outline" className="text-xs">
                          {formatCurrencyCompact(report.amount)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-gray-700 line-clamp-2">
                    {report.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {report.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-3">
                      <Button
                        variant={report.hasVoted ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleVote(report.id)}
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        Helpful ({report.helpfulVotes})
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleShare(report)}
                        className="flex items-center gap-1"
                      >
                        <Share2 className="h-3 w-3" />
                        Share
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        #{report.type}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleReport(report.id)}
                        className="text-red-600 hover:text-red-800 h-6 w-6 p-0"
                        title="Report inappropriate content"
                      >
                        <Flag className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {sortedReports.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your filters or search terms
            </p>
            <Button
              variant="outline"
              onClick={() =>
                setFilters({
                  search: "",
                  location: "",
                  fraudType: "",
                  severity: "",
                  timeRange: "",
                  sortBy: "recent",
                })
              }
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {(currentPage - 1) * reportsPerPage + 1} to{" "}
              {Math.min(currentPage * reportsPerPage, sortedReports.length)} of{" "}
              {sortedReports.length} reports
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={page === currentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  ),
                )}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Community Guidelines */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border">
          <h4 className="font-medium text-sm mb-2">Community Guidelines</h4>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Share your experiences to help others stay safe</li>
            <li>• Remove personal information before posting</li>
            <li>• Vote helpful on accurate and useful reports</li>
            <li>• Report inappropriate or misleading content</li>
            <li>• All reports are anonymous to protect privacy</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCommunityReports;
