/**
 * Supabase Configuration Status Component
 * Shows the current Supabase configuration status and setup instructions
 */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { checkConnection, isDemoMode } from "@/integrations/supabase/client";
import { checkSupabaseFullHealth } from "@/lib/supabase-health";

const SupabaseStatus: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    error?: string;
  } | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const envVariables = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  };

  const checkStatus = async () => {
    setLoading(true);
    try {
      const [connection, health] = await Promise.all([
        checkConnection(),
        checkSupabaseFullHealth(),
      ]);
      setConnectionStatus(connection);
      setHealthStatus(health);
    } catch (error) {
      console.error("Error checking Supabase status:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const copyEnvTemplate = () => {
    const template = `# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development Settings
VITE_APP_ENV=development
VITE_APP_NAME=Chakshu Portal
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_COMMUNITY=true

# Demo Mode (set to false for production)
VITE_DEMO_MODE=false`;

    navigator.clipboard.writeText(template);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusIcon = (connected: boolean) => {
    if (connected) return <CheckCircle className="h-5 w-5 text-green-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusBadge = (connected: boolean) => {
    if (connected)
      return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
    return <Badge variant="destructive">Not Connected</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Supabase Configuration Status
          </CardTitle>
          <CardDescription>
            Current status of your Supabase database connection and
            configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {connectionStatus ? (
                getStatusIcon(connectionStatus.connected)
              ) : (
                <RefreshCw className="h-5 w-5 animate-spin" />
              )}
              <span className="font-medium">Database Connection</span>
            </div>
            <div className="flex items-center gap-2">
              {connectionStatus && getStatusBadge(connectionStatus.connected)}
              <Button
                variant="outline"
                size="sm"
                onClick={checkStatus}
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  "Refresh"
                )}
              </Button>
            </div>
          </div>

          {connectionStatus?.error && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{connectionStatus.error}</AlertDescription>
            </Alert>
          )}

          <Separator />

          {/* Environment Variables Status */}
          <div className="space-y-3">
            <h4 className="font-medium">Environment Variables</h4>
            <div className="grid grid-cols-1 gap-2">
              {Object.entries(envVariables).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="font-mono text-sm">{key}</span>
                  <div className="flex items-center gap-2">
                    {value ? (
                      <>
                        <Badge className="bg-green-100 text-green-800">
                          Set
                        </Badge>
                        <span className="text-xs text-gray-500 font-mono">
                          {value.substring(0, 20)}...
                        </span>
                      </>
                    ) : (
                      <Badge variant="destructive">Missing</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Mode Status */}
          {isDemoMode && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Demo Mode Active:</strong> Supabase is not configured.
                Database operations will be simulated.
              </AlertDescription>
            </Alert>
          )}

          {/* Health Check Details */}
          {healthStatus && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Service Health Check</h4>
                {healthStatus.details && (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(healthStatus.details).map(
                      ([service, status]) => (
                        <div
                          key={service}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="capitalize">{service}</span>
                          {status ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                      ),
                    )}
                  </div>
                )}
                {healthStatus.responseTime && (
                  <p className="text-sm text-gray-600">
                    Response time: {healthStatus.responseTime}ms
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      {isDemoMode && (
        <Card>
          <CardHeader>
            <CardTitle>Setup Instructions</CardTitle>
            <CardDescription>
              Follow these steps to configure Supabase for your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Create a Supabase Project</p>
                  <p className="text-sm text-gray-600">
                    Go to{" "}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center gap-1"
                    >
                      supabase.com <ExternalLink className="h-3 w-3" />
                    </a>{" "}
                    and create a new project
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Get Your Project Credentials</p>
                  <p className="text-sm text-gray-600">
                    Copy your Project URL and Anon Key from Settings → API
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div className="flex-1">
                  <p className="font-medium">Create .env File</p>
                  <p className="text-sm text-gray-600 mb-2">
                    Create a .env file in your project root with the template
                    below
                  </p>
                  <div className="relative">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyEnvTemplate}
                      className="absolute top-2 right-2 z-10"
                    >
                      <Copy className="h-4 w-4" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded text-xs overflow-auto max-h-40">
                      {`# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Development Settings  
VITE_APP_ENV=development
VITE_DEMO_MODE=false`}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  4
                </div>
                <div>
                  <p className="font-medium">Run Database Migrations</p>
                  <p className="text-sm text-gray-600">
                    Execute the SQL migration file in your Supabase SQL Editor
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  5
                </div>
                <div>
                  <p className="font-medium">Restart Your Development Server</p>
                  <p className="text-sm text-gray-600">
                    After setting up the .env file, restart your dev server to
                    apply changes
                  </p>
                </div>
              </div>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Need help?</strong> Check the detailed setup guide in
                SETUP.md for complete instructions.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SupabaseStatus;
