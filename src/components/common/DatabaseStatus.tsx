/**
 * Database Status Component
 * Displays database health and provides guidance for common issues
 */

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import MigrationInstructions from "./MigrationInstructions";
import {
  checkDatabaseHealth,
  getDatabaseStatus,
  autoFixDatabaseIssues,
  type MigrationResult,
} from "@/lib/migration-runner";

interface DatabaseStatusProps {
  onStatusChange?: (isHealthy: boolean) => void;
  showDetails?: boolean;
}

export function DatabaseStatus({
  onStatusChange,
  showDetails = false,
}: DatabaseStatusProps) {
  const [status, setStatus] = useState<{
    hasRLSFix: boolean;
    hasHealthCheck: boolean;
    isConnected: boolean;
    lastError?: string;
  } | null>(null);

  const [healthCheck, setHealthCheck] = useState<MigrationResult | null>(null);
  const [autoFixResult, setAutoFixResult] = useState<MigrationResult | null>(
    null,
  );
  const [isChecking, setIsChecking] = useState(true);
  const [isFixing, setIsFixing] = useState(false);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const [dbStatus, health] = await Promise.all([
        getDatabaseStatus(),
        checkDatabaseHealth(),
      ]);

      setStatus(dbStatus);
      setHealthCheck(health);

      const isHealthy =
        dbStatus.isConnected &&
        health.success &&
        !health.error?.includes("infinite recursion");
      onStatusChange?.(isHealthy);
    } catch (error) {
      console.error("Error checking database status:", error);
      setHealthCheck({
        success: false,
        error: error instanceof Error ? error.message : "Status check failed",
      });
      onStatusChange?.(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleAutoFix = async () => {
    setIsFixing(true);
    try {
      const result = await autoFixDatabaseIssues();
      setAutoFixResult(result);

      if (result.success) {
        // Re-check status after fix
        await checkStatus();
      }
    } catch (error) {
      setAutoFixResult({
        success: false,
        error: error instanceof Error ? error.message : "Auto-fix failed",
      });
    } finally {
      setIsFixing(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const getStatusColor = () => {
    if (!status || !healthCheck) return "gray";
    if (!status.isConnected) return "red";
    if (healthCheck.error?.includes("infinite recursion")) return "red";
    if (!healthCheck.success) return "yellow";
    return "green";
  };

  const getStatusIcon = () => {
    const color = getStatusColor();
    const iconClass = "h-4 w-4";

    switch (color) {
      case "green":
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      case "yellow":
        return <AlertTriangle className={`${iconClass} text-yellow-500`} />;
      case "red":
        return <XCircle className={`${iconClass} text-red-500`} />;
      default:
        return (
          <RefreshCw className={`${iconClass} text-gray-500 animate-spin`} />
        );
    }
  };

  const getStatusText = () => {
    if (isChecking) return "Checking database status...";
    if (!status) return "Unknown status";
    if (!status.isConnected) return "Database connection failed";
    if (healthCheck?.error?.includes("infinite recursion"))
      return "RLS configuration error";
    if (!healthCheck?.success) return "Database access issues";
    return "Database is healthy";
  };

  const hasInfiniteRecursionError =
    healthCheck?.error?.includes("infinite recursion");

  if (!showDetails && getStatusColor() === "green") {
    return null; // Don't show if everything is working fine
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Database Status
        </CardTitle>
        <CardDescription>
          Current database connection and configuration status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span>Status:</span>
          <Badge
            variant={getStatusColor() === "green" ? "default" : "destructive"}
          >
            {getStatusText()}
          </Badge>
        </div>

        {showDetails && status && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Connection:</span>
              <Badge variant={status.isConnected ? "default" : "destructive"}>
                {status.isConnected ? "Connected" : "Failed"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>RLS Policies:</span>
              <Badge variant={status.hasRLSFix ? "default" : "destructive"}>
                {status.hasRLSFix ? "Fixed" : "Needs Update"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Health Check:</span>
              <Badge variant={status.hasHealthCheck ? "default" : "secondary"}>
                {status.hasHealthCheck ? "Available" : "Basic"}
              </Badge>
            </div>
          </div>
        )}

        {hasInfiniteRecursionError && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Database Configuration Issue:</strong> The database has
              circular references in its security policies. This needs to be
              fixed by running a migration.
            </AlertDescription>
          </Alert>
        )}

        {autoFixResult &&
          !autoFixResult.success &&
          hasInfiniteRecursionError && (
            <div className="mt-4">
              <MigrationInstructions />
            </div>
          )}

        {autoFixResult && autoFixResult.success && (
          <Alert>
            <AlertDescription>
              <span className="text-green-600">✓ {autoFixResult.message}</span>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={checkStatus}
            disabled={isChecking}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`}
            />
            Refresh Status
          </Button>

          {(hasInfiniteRecursionError || getStatusColor() === "red") && (
            <Button
              variant="default"
              size="sm"
              onClick={handleAutoFix}
              disabled={isFixing}
            >
              <AlertTriangle
                className={`h-4 w-4 mr-2 ${isFixing ? "animate-spin" : ""}`}
              />
              Get Fix Instructions
            </Button>
          )}
        </div>

        {status?.lastError && (
          <div className="text-xs text-gray-500 mt-2">
            Last error: {status.lastError}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default DatabaseStatus;
