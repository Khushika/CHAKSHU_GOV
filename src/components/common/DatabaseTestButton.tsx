/**
 * Database Test Button Component
 * Allows users to test if the database migration has been applied successfully
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { checkDatabaseHealth } from "@/lib/migration-runner";

export function DatabaseTestButton() {
  const [testing, setTesting] = useState(false);
  const [lastResult, setLastResult] = useState<boolean | null>(null);
  const { toast } = useToast();

  const runTest = async () => {
    setTesting(true);
    try {
      const result = await checkDatabaseHealth();

      if (result.success && !result.error?.includes("infinite recursion")) {
        setLastResult(true);
        toast({
          title: "Database Test Passed! ✅",
          description:
            "The database migration has been applied successfully. You can now submit reports.",
        });
      } else {
        setLastResult(false);
        toast({
          title: "Database Test Failed ❌",
          description:
            "The database still has configuration issues. Please apply the migration.",
          variant: "destructive",
        });
      }
    } catch (error) {
      setLastResult(false);
      toast({
        title: "Test Error",
        description: "Could not test database connection.",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const getButtonVariant = () => {
    if (lastResult === null) return "default";
    return lastResult ? "default" : "destructive";
  };

  const getButtonText = () => {
    if (testing) return "Testing...";
    if (lastResult === null) return "Test Database";
    return lastResult ? "Test Passed ✅" : "Test Failed ❌";
  };

  const getIcon = () => {
    if (testing) return <Loader2 className="h-4 w-4 animate-spin" />;
    if (lastResult === null) return null;
    return lastResult ? (
      <CheckCircle className="h-4 w-4" />
    ) : (
      <XCircle className="h-4 w-4" />
    );
  };

  return (
    <Button
      onClick={runTest}
      disabled={testing}
      variant={getButtonVariant()}
      className="flex items-center gap-2"
    >
      {getIcon()}
      {getButtonText()}
    </Button>
  );
}

export default DatabaseTestButton;
