import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const DemoLogin: React.FC = () => {
  const { signIn, user } = useAuth();

  const handleDemoLogin = async () => {
    try {
      const result = await signIn("demo@chakshu.gov.in", "demo123");
      if (!result.error) {
        toast({
          title: "Demo Login Successful",
          description:
            "You're now logged in as a demo user. Explore all profile features!",
        });
      }
    } catch (error) {
      console.log("Demo login initiated");
    }
  };

  if (user) {
    return null; // Don't show demo login if user is already logged in
  }

  return (
    <Card className="max-w-md mx-auto mt-8 border-2 border-dashed border-blue-300 bg-blue-50">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-blue-700">
          <Zap className="h-5 w-5" />
          Demo Mode
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-blue-600 text-center">
          Want to explore the user profile features? Try our demo login!
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <User className="h-4 w-4" />
            <span>Demo Email: demo@chakshu.gov.in</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-blue-600">
            <Shield className="h-4 w-4" />
            <span>Demo Password: demo123</span>
          </div>
        </div>

        <Button
          onClick={handleDemoLogin}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <User className="h-4 w-4 mr-2" />
          Login as Demo User
        </Button>

        <p className="text-xs text-gray-500 text-center">
          This will allow you to test profile management, dashboard, and all
          user features.
        </p>
      </CardContent>
    </Card>
  );
};

export default DemoLogin;
