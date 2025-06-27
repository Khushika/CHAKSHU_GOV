import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

export interface Report {
  id: string;
  date: string;
  type: string;
  description: string;
  status: string;
  impact: string;
  // Database fields from fraud_reports
  user_id?: string;
  report_type?: string;
  fraudulent_number?: string;
  incident_date?: string;
  incident_time?: string;
  fraud_category?: string;
  evidence_urls?: string[];
  priority?: string;
  created_at?: string;
  updated_at?: string;
  amount_involved?: number;
  contact_info?: {
    phone?: string;
    email?: string;
  };
  location_info?: any;
  authority_comments?: string;
  authority_action?: string;
}

interface ReportDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: Report | null;
}

const ReportDetailsModal = ({
  isOpen,
  onClose,
  report,
}: ReportDetailsModalProps) => {
  // Early return if no report data to prevent DialogTitle accessibility errors
  if (!report || !isOpen) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved":
        return "text-green-600 bg-green-100";
      case "under review":
        return "text-blue-600 bg-blue-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const formatAmount = (amount?: number) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Use actual report data without mock enhancement
  const actualReport = {
    ...report,
    title: `${report.type} Report`,
    incidentDate: report.incident_date || report.date,
    amountInvolved: report.amount_involved || 0,
    contactInfo: report.contact_info || { phone: report.fraudulent_number },
    locationInfo: report.location_info || {},
    evidenceFiles: (report.evidence_urls || []).map((url, index) => ({
      name: `evidence_${index + 1}.file`,
      size: 1024 * 1024, // 1MB default
      uploadedAt: report.date,
      url: url,
    })),
    authorityComments:
      report.authority_comments || "No comments available yet.",
    authorityAction: report.authority_action || "Case Registered",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-6xl max-h-[90vh] overflow-hidden"
        aria-labelledby="report-details-title"
        aria-describedby="report-details-description"
      >
        <DialogHeader>
          {actualReport.title ? (
            <DialogTitle
              id="report-details-title"
              className="text-2xl font-bold"
            >
              {actualReport.title}
            </DialogTitle>
          ) : (
            <VisuallyHidden>
              <DialogTitle id="report-details-title">
                Report Details
              </DialogTitle>
            </VisuallyHidden>
          )}
          <DialogDescription id="report-details-description">
            {actualReport.id
              ? `Report ID: ${actualReport.id} • Submitted on ${formatDate(actualReport.date)}`
              : "Loading report details..."}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          <div className="space-y-6">
            {/* Status and Impact Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Current Status
                </h4>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(actualReport.status)}`}
                >
                  {actualReport.status}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Impact Level
                </h4>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(actualReport.impact)}`}
                >
                  {actualReport.impact}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Amount Involved
                </h4>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatAmount(actualReport.amountInvolved)}
                </span>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Incident Details
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Type:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {actualReport.type}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Incident Date:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {formatDate(
                          actualReport.incidentDate || actualReport.date,
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Description:
                      </span>
                      <p className="mt-1 text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded border">
                        {actualReport.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                {actualReport.contactInfo && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      {actualReport.contactInfo.phone && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Phone:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {actualReport.contactInfo.phone}
                          </span>
                        </div>
                      )}
                      {actualReport.contactInfo.email && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Email:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {actualReport.contactInfo.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location Information */}
                {actualReport.locationInfo && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Location Information
                    </h3>
                    <div className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded border">
                      <p>{actualReport.locationInfo.address}</p>
                      <p>
                        {actualReport.locationInfo.city},{" "}
                        {actualReport.locationInfo.state} -{" "}
                        {actualReport.locationInfo.pincode}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {/* Authority Response */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Authority Response
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Current Action:
                      </span>
                      <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                        {actualReport.authorityAction}
                      </span>
                    </div>
                    {actualReport.authorityComments && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Comments:
                        </span>
                        <p className="mt-1 text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded border">
                          {actualReport.authorityComments}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Evidence Files */}
                {actualReport.evidenceFiles &&
                  actualReport.evidenceFiles.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Evidence Files
                      </h3>
                      <div className="space-y-2">
                        {actualReport.evidenceFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded border"
                          >
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">
                                {file.name}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {(file.size / 1024 / 1024).toFixed(2)} MB •
                                Uploaded {formatDate(file.uploadedAt)}
                              </p>
                            </div>
                            <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                              Download
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Status History */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Status History
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-white dark:bg-gray-700 rounded border">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-3 h-3 rounded-full mt-2 ${
                        actualReport.status === "resolved"
                          ? "bg-green-500"
                          : actualReport.status === "under_review"
                            ? "bg-blue-500"
                            : "bg-yellow-500"
                      }`}
                    ></div>
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(actualReport.status)}`}
                      >
                        {actualReport.status}
                      </span>
                      {actualReport.authorityAction && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {actualReport.authorityAction}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {formatDate(actualReport.date)}
                    </p>
                    {actualReport.authorityComments && (
                      <p className="text-gray-900 dark:text-white">
                        {actualReport.authorityComments}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Next Steps
              </h3>
              <div className="text-blue-800 dark:text-blue-200">
                {actualReport.status === "resolved" ? (
                  <p>
                    Your case has been resolved. If you have any questions about
                    the resolution, please contact our support team.
                  </p>
                ) : actualReport.status === "under_review" ? (
                  <p>
                    Your case is currently being investigated. We will notify
                    you of any updates. Expected resolution time: 7-14 business
                    days.
                  </p>
                ) : (
                  <p>
                    Your report is in the queue for review. We will assign an
                    investigator soon and notify you of the progress.
                  </p>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDetailsModal;
