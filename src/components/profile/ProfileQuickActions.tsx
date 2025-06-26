import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Download,
  Bell,
  Shield,
  BarChart3,
  MessageSquare,
  Settings,
  HelpCircle,
} from "lucide-react";

const ProfileQuickActions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const quickActions = [
    {
      icon: FileText,
      title: "Create Report",
      description: "Submit a new fraud report",
      action: () => navigate("/?report=true"),
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      icon: BarChart3,
      title: "View Dashboard",
      description: "Check your reports and stats",
      action: () => navigate("/dashboard"),
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      icon: MessageSquare,
      title: "Community",
      description: "Join fraud prevention discussions",
      action: () => navigate("/community"),
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      icon: Shield,
      title: "Security Center",
      description: "Manage your account security",
      action: () => {}, // Will be handled by parent component
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      icon: Download,
      title: "Export Data",
      description: "Download your report history",
      action: () => {
        // Simulate data export
        const data = {
          user_id: user?.id,
          export_date: new Date().toISOString(),
          reports: "User report data would be here",
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `profile-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      icon: HelpCircle,
      title: "Help Center",
      description: "Get help and support",
      action: () => navigate("/help"),
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-all"
                onClick={action.action}
              >
                <div className={`p-2 rounded-lg ${action.color} text-white`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-sm">{action.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {action.description}
                  </p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileQuickActions;
