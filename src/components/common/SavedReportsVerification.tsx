/**
 * Saved Reports Verification Component
 * Shows user's submitted reports to verify they were saved to database
 */

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, FileText, Loader2, RefreshCw } from "lucide-react";
import { reportsService } from "@/services/database";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

interface SavedReport {
  id: string;
  description: string;
  fraud_category: string;
  status: string;
  created_at: string;
  fraudulent_number: string;
}

export function SavedReportsVerification() {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchReports = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const result = await reportsService.getUserReports(user.id);

      if (result.success && result.data) {
        setReports(result.data as SavedReport[]);
        console.log(`✅ Found ${result.data.length} saved reports in database`);
      } else {
        setError(result.error || "Failed to fetch reports");
        console.error("❌ Failed to fetch reports:", result.error);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("❌ Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "under_review":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Your Saved Reports
          <Badge variant="outline" className="ml-auto">
            {reports.length} report{reports.length !== 1 ? "s" : ""}
          </Badge>
        </CardTitle>
        <CardDescription>
          Verify your fraud reports have been saved to the database
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {reports.length > 0
              ? `${reports.length} report${reports.length !== 1 ? "s" : ""} found in database`
              : "No reports found"}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">Error: {error}</p>
          </div>
        )}

        {reports.length > 0 && (
          <div className="space-y-3">
            {reports.slice(0, 5).map((report) => (
              <div
                key={report.id}
                className="flex items-start gap-3 p-3 border rounded-lg"
              >
                <CheckCircle className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {report.description.slice(0, 50)}...
                    </p>
                    <Badge
                      variant="outline"
                      className={`text-xs ${getStatusColor(report.status)}`}
                    >
                      {report.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>ID: {report.id.slice(0, 8)}...</span>
                    <span>Number: {report.fraudulent_number}</span>
                    <span>Category: {report.fraud_category}</span>
                    <span>
                      {formatDistanceToNow(new Date(report.created_at))} ago
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {reports.length > 5 && (
              <p className="text-xs text-gray-500 text-center">
                Showing latest 5 reports. Total: {reports.length}
              </p>
            )}
          </div>
        )}

        {reports.length === 0 && !loading && !error && (
          <div className="text-center py-6">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reports found in database</p>
            <p className="text-xs text-gray-400 mt-1">
              Submit a fraud report to see it appear here
            </p>
          </div>
        )}

        {reports.length > 0 && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>✅ All reports successfully saved to database</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SavedReportsVerification;
