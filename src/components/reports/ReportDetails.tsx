import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  CreditCard,
  MapPin,
  Phone,
  Mail,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  Save,
} from "lucide-react";
import SimilarCases from "./SimilarCases";
import FollowUpReminders from "./FollowUpReminders";
import { Database } from "@/integrations/supabase/types";

type FraudType = Database["public"]["Enums"]["fraud_type"];

interface Report {
  id: string;
  title: string;
  description: string;
  fraud_type: FraudType;
  status: string;
  incident_date: string | null;
  amount_involved: number | null;
  created_at: string;
  updated_at: string;
  authority_action: string | null;
  authority_comments: string | null;
  contact_info: any;
  location_info: any;
}

interface ReportDetailsProps {
  report: Report;
  onReportUpdate: () => void;
}

const ReportDetails = ({ report, onReportUpdate }: ReportDetailsProps) => {
  const [statusHistory, setStatusHistory] = useState<any[]>([]);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(report.status);
  const [newAuthorityAction, setNewAuthorityAction] = useState(
    report.authority_action || "",
  );
  const [newComments, setNewComments] = useState(
    report.authority_comments || "",
  );
  const { toast } = useToast();

  useEffect(() => {
    fetchStatusHistory();
    fetchEvidence();
  }, [report.id]);

  const fetchStatusHistory = async () => {
    try {
      const { data, error } = await supabase
        .from("report_status_history")
        .select("*")
        .eq("report_id", report.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setStatusHistory(data || []);
    } catch (error: any) {
      console.error("Error fetching status history:", error);
    }
  };

  const fetchEvidence = async () => {
    try {
      const { data, error } = await supabase
        .from("report_evidence")
        .select("*")
        .eq("report_id", report.id)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setEvidence(data || []);
    } catch (error: any) {
      console.error("Error fetching evidence:", error);
    }
  };

  const handleUpdateReport = async () => {
    try {
      setIsUpdating(true);

      const updateData: any = {
        status: newStatus,
        authority_action: newAuthorityAction || null,
        authority_comments: newComments || null,
      };

      const { error } = await supabase
        .from("reports")
        .update(updateData)
        .eq("id", report.id);

      if (error) throw error;

      toast({
        title: "Report Updated",
        description: "The report has been successfully updated.",
      });

      onReportUpdate();
      await fetchStatusHistory();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "under_review":
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatAmount = (amount: number | null) => {
    if (!amount) return "Not specified";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{report.title}</CardTitle>
              <CardDescription className="mt-2">
                Report ID: {report.id}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(report.status)}
              <Badge
                className={
                  report.status === "resolved"
                    ? "bg-green-100 text-green-800"
                    : report.status === "under_review"
                      ? "bg-blue-100 text-blue-800"
                      : report.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                }
              >
                {report.status.replace("_", " ").toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Fraud Type</p>
                <p className="font-medium">
                  {report.fraud_type.replace("_", " ")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Incident Date</p>
                <p className="font-medium">
                  {report.incident_date
                    ? new Date(report.incident_date).toLocaleDateString("en-IN")
                    : "Not specified"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Amount Involved</p>
                <p className="font-medium">
                  {formatAmount(report.amount_involved)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-medium">{formatDate(report.created_at)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Report Details */}
        <div className="space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">
                {report.description}
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          {report.contact_info && (
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.contact_info.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{report.contact_info.phone}</span>
                    </div>
                  )}
                  {report.contact_info.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{report.contact_info.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location Information */}
          {report.location_info && (
            <Card>
              <CardHeader>
                <CardTitle>Location Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>
                    {report.location_info.address ||
                      "Location details available"}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Evidence Files */}
          {evidence.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Evidence Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {evidence.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium">{file.file_name}</p>
                        <p className="text-sm text-gray-500">
                          {file.file_size &&
                            `${(file.file_size / 1024 / 1024).toFixed(2)} MB`}{" "}
                          •{formatDate(file.uploaded_at)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions and History */}
        <div className="space-y-6">
          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Report Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Status</Label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Authority Action</Label>
                <Select
                  value={newAuthorityAction || "none"}
                  onValueChange={(value) =>
                    setNewAuthorityAction(value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No action</SelectItem>
                    <SelectItem value="investigation_started">
                      Investigation Started
                    </SelectItem>
                    <SelectItem value="evidence_collected">
                      Evidence Collected
                    </SelectItem>
                    <SelectItem value="case_forwarded">
                      Case Forwarded
                    </SelectItem>
                    <SelectItem value="suspect_identified">
                      Suspect Identified
                    </SelectItem>
                    <SelectItem value="legal_action_taken">
                      Legal Action Taken
                    </SelectItem>
                    <SelectItem value="case_closed">Case Closed</SelectItem>
                    <SelectItem value="no_action_required">
                      No Action Required
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Comments</Label>
                <Textarea
                  value={newComments}
                  onChange={(e) => setNewComments(e.target.value)}
                  placeholder="Add comments about the status update..."
                  rows={3}
                />
              </div>

              <Button
                onClick={handleUpdateReport}
                disabled={isUpdating}
                className="w-full flex items-center gap-2"
              >
                {isUpdating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Update Report
              </Button>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statusHistory.length === 0 ? (
                  <p className="text-gray-500">No status changes recorded</p>
                ) : (
                  statusHistory.map((history) => (
                    <div
                      key={history.id}
                      className="border-l-2 border-gray-200 pl-4 pb-3"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(history.status)}
                        <Badge variant="outline">
                          {history.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        {history.authority_action && (
                          <Badge variant="secondary" className="text-xs">
                            {history.authority_action.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(history.created_at)}
                      </p>
                      {history.comments && (
                        <p className="text-sm mt-1">{history.comments}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Similar Cases and Follow-up Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimilarCases reportId={report.id} fraudType={report.fraud_type} />
        <FollowUpReminders reportId={report.id} />
      </div>
    </div>
  );
};

export default ReportDetails;
