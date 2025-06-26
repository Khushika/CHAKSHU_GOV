import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import {
  CheckCircle,
  Clock,
  Shield,
  AlertTriangle,
  User,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

const UserStatusIndicator: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const getAccountStatus = () => {
    if (user.email?.includes("demo")) {
      return {
        status: "Demo Account",
        icon: User,
        color: "bg-blue-100 text-blue-800",
        description: "Demo user account for testing features",
      };
    }

    if (user.user_metadata?.verified) {
      return {
        status: "Verified",
        icon: CheckCircle,
        color: "bg-green-100 text-green-800",
        description: "Account verified and fully active",
      };
    }

    return {
      status: "Active",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-800",
      description: "Account active, verification pending",
    };
  };

  const accountStatus = getAccountStatus();
  const IconComponent = accountStatus.icon;
  const joinDate = user.created_at ? new Date(user.created_at) : new Date();

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <IconComponent className="h-4 w-4" />
              <span className="font-medium">Account Status</span>
            </div>
            <Badge className={accountStatus.color}>
              {accountStatus.status}
            </Badge>
          </div>

          <div className="text-right">
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>Joined {format(joinDate, "MMM yyyy")}</span>
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-600 mt-2">
          {accountStatus.description}
        </p>

        {user.email?.includes("demo") && (
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                Demo Mode Active
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              This is a demonstration account. All features are functional for
              testing purposes.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserStatusIndicator;
