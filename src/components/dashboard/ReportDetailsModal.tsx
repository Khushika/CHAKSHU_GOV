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
  // Additional detailed fields
  title?: string;
  incidentDate?: string;
  amountInvolved?: number;
  contactInfo?: {
    phone?: string;
    email?: string;
  };
  locationInfo?: {
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  evidenceFiles?: Array<{
    name: string;
    size: number;
    uploadedAt: string;
  }>;
  statusHistory?: Array<{
    status: string;
    date: string;
    comments?: string;
    authorityAction?: string;
  }>;
  authorityComments?: string;
  authorityAction?: string;
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

  // Enhanced mock data based on the report type and ID
  const getEnhancedReportData = (baseReport: Report): Report => {
    const enhancedData: Report = {
      ...baseReport,
      title: `${baseReport.type} Report - ${baseReport.id}`,
      incidentDate: baseReport.date,
      amountInvolved: baseReport.amountInvolved,
      contactInfo: {
        phone: "+91 98765 43210",
        email: "user@example.com",
      },
      locationInfo: {
        address: "123 Main Street",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400001",
      },
      evidenceFiles:
        baseReport.type !== "Email Spam"
          ? [
              {
                name: "screenshot.png",
                size: 1024 * 1024 * 2.5, // 2.5 MB
                uploadedAt: baseReport.date,
              },
              {
                name: "call_recording.mp3",
                size: 1024 * 1024 * 5.2, // 5.2 MB
                uploadedAt: baseReport.date,
              },
            ]
          : [],
      statusHistory: [
        {
          status: baseReport.status,
          date: baseReport.date,
          comments:
            baseReport.status === "Resolved"
              ? "Case investigation completed successfully. Suspect identified and legal action taken."
              : baseReport.status === "Under Review"
                ? "Case assigned to investigation team. Evidence being analyzed."
                : "Report received and initial verification completed.",
          authorityAction:
            baseReport.status === "Resolved"
              ? "Legal Action Taken"
              : baseReport.status === "Under Review"
                ? "Investigation Started"
                : "Case Registered",
        },
        {
          status: "Pending",
          date: new Date(
            new Date(baseReport.date).getTime() - 24 * 60 * 60 * 1000,
          )
            .toISOString()
            .split("T")[0],
          comments: "Report submitted successfully.",
          authorityAction: "Report Received",
        },
      ],
      authorityComments:
        baseReport.status === "Resolved"
          ? "Investigation completed. The reported fraud attempt has been traced and appropriate action taken against the perpetrators. The case is now closed."
          : baseReport.status === "Under Review"
            ? "Case is currently under investigation. Our team is analyzing the evidence and working with relevant authorities."
            : "Your report has been received and is in the queue for review. We will update you soon.",
      authorityAction:
        baseReport.status === "Resolved"
          ? "Case Closed"
          : baseReport.status === "Under Review"
            ? "Investigation Started"
            : "Case Registered",
    };

    return enhancedData;
  };

  const enhancedReport = getEnhancedReportData(report);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-6xl max-h-[90vh] overflow-hidden"
        aria-labelledby="report-details-title"
        aria-describedby="report-details-description"
      >
        <DialogHeader>
          {enhancedReport.title ? (
            <DialogTitle
              id="report-details-title"
              className="text-2xl font-bold"
            >
              {enhancedReport.title}
            </DialogTitle>
          ) : (
            <VisuallyHidden>
              <DialogTitle id="report-details-title">
                Report Details
              </DialogTitle>
            </VisuallyHidden>
          )}
          <DialogDescription id="report-details-description">
            {enhancedReport.id
              ? `Report ID: ${enhancedReport.id} • Submitted on ${formatDate(enhancedReport.date)}`
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
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(enhancedReport.status)}`}
                >
                  {enhancedReport.status}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Impact Level
                </h4>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getImpactColor(enhancedReport.impact)}`}
                >
                  {enhancedReport.impact}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Amount Involved
                </h4>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {formatAmount(enhancedReport.amountInvolved)}
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
                        {enhancedReport.type}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Incident Date:
                      </span>
                      <span className="ml-2 text-gray-900 dark:text-white">
                        {formatDate(
                          enhancedReport.incidentDate || enhancedReport.date,
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Description:
                      </span>
                      <p className="mt-1 text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded border">
                        {enhancedReport.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                {enhancedReport.contactInfo && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Contact Information
                    </h3>
                    <div className="space-y-2">
                      {enhancedReport.contactInfo.phone && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Phone:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {enhancedReport.contactInfo.phone}
                          </span>
                        </div>
                      )}
                      {enhancedReport.contactInfo.email && (
                        <div>
                          <span className="font-medium text-gray-700 dark:text-gray-300">
                            Email:
                          </span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {enhancedReport.contactInfo.email}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Location Information */}
                {enhancedReport.locationInfo && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                      Location Information
                    </h3>
                    <div className="text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded border">
                      <p>{enhancedReport.locationInfo.address}</p>
                      <p>
                        {enhancedReport.locationInfo.city},{" "}
                        {enhancedReport.locationInfo.state} -{" "}
                        {enhancedReport.locationInfo.pincode}
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
                        {enhancedReport.authorityAction}
                      </span>
                    </div>
                    {enhancedReport.authorityComments && (
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Comments:
                        </span>
                        <p className="mt-1 text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-3 rounded border">
                          {enhancedReport.authorityComments}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Evidence Files */}
                {enhancedReport.evidenceFiles &&
                  enhancedReport.evidenceFiles.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                        Evidence Files
                      </h3>
                      <div className="space-y-2">
                        {enhancedReport.evidenceFiles.map((file, index) => (
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
            {enhancedReport.statusHistory &&
              enhancedReport.statusHistory.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Status History
                  </h3>
                  <div className="space-y-4">
                    {enhancedReport.statusHistory.map((history, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-4 bg-white dark:bg-gray-700 rounded border"
                      >
                        <div className="flex-shrink-0">
                          <div
                            className={`w-3 h-3 rounded-full mt-2 ${
                              history.status === "Resolved"
                                ? "bg-green-500"
                                : history.status === "Under Review"
                                  ? "bg-blue-500"
                                  : "bg-yellow-500"
                            }`}
                          ></div>
                        </div>
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-1 rounded text-sm font-medium ${getStatusColor(history.status)}`}
                            >
                              {history.status}
                            </span>
                            {history.authorityAction && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                                {history.authorityAction}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                            {formatDate(history.date)}
                          </p>
                          {history.comments && (
                            <p className="text-gray-900 dark:text-white">
                              {history.comments}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Next Steps */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Next Steps
              </h3>
              <div className="text-blue-800 dark:text-blue-200">
                {enhancedReport.status === "Resolved" ? (
                  <p>
                    Your case has been resolved. If you have any questions about
                    the resolution, please contact our support team.
                  </p>
                ) : enhancedReport.status === "Under Review" ? (
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
