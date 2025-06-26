import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Shield,
  Star,
  Trophy,
  Target,
  TrendingUp,
  Edit,
  Camera,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  MessageSquare,
  Heart,
} from "lucide-react";
import { format } from "date-fns";

const ProfileOverview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  const userStats = {
    reportsSubmitted: 12,
    communityPoints: 850,
    trustScore: 92,
    memberSince: new Date(2023, 5, 15),
    verificationLevel: "Verified",
    contributions: 28,
    helpfulVotes: 156,
    responseRate: 94,
  };

  const achievements = [
    {
      id: 1,
      title: "First Report",
      description: "Submitted your first fraud report",
      icon: FileText,
      earned: true,
      date: new Date(2023, 5, 16),
    },
    {
      id: 2,
      title: "Community Helper",
      description: "Helped 10+ community members",
      icon: Heart,
      earned: true,
      date: new Date(2023, 7, 22),
    },
    {
      id: 3,
      title: "Fraud Fighter",
      description: "Reported 10+ fraud cases",
      icon: Shield,
      earned: true,
      date: new Date(2023, 9, 5),
    },
    {
      id: 4,
      title: "Top Contributor",
      description: "Among top 10% contributors this month",
      icon: Trophy,
      earned: false,
      progress: 78,
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "report",
      title: "Submitted UPI fraud report",
      description: "Report #FR-2024-001234",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "under_review",
    },
    {
      id: 2,
      type: "comment",
      title: "Helped community member",
      description: "Provided advice on suspicious SMS",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: "completed",
    },
    {
      id: 3,
      type: "achievement",
      title: "Earned Fraud Fighter badge",
      description: "Reached 10 fraud reports milestone",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "completed",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "under_review":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getVerificationColor = (level: string) => {
    switch (level) {
      case "Verified":
        return "bg-green-100 text-green-800";
      case "Premium":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAvatarUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // In a real app, you would upload the file to a server
        toast({
          title: "Avatar Updated",
          description: "Your profile picture has been updated successfully.",
        });
      }
    };
    input.click();
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Profile Header */}
      <Card className="transition-all duration-300 hover:shadow-lg">
        <CardContent className="p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8">
            <div className="relative mx-auto sm:mx-0">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`}
                  alt="Profile"
                />
                <AvatarFallback className="text-lg sm:text-xl lg:text-2xl">
                  {user?.user_metadata?.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 h-6 w-6 sm:h-8 sm:w-8 rounded-full p-0 touch-manipulation"
                onClick={handleAvatarUpload}
              >
                <Camera className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>

            <div className="flex-1 w-full space-y-3 sm:space-y-4 text-center sm:text-left">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    {user?.user_metadata?.full_name || "User"}
                  </h2>
                  <Badge
                    className={`${getVerificationColor(
                      userStats.verificationLevel,
                    )} text-xs sm:text-sm`}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {userStats.verificationLevel}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Mail className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>
                      Member since {format(userStats.memberSince, "MMM yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span>India</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                <div className="text-center bg-orange-50 rounded-lg p-2 sm:p-3">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-india-saffron">
                    {userStats.reportsSubmitted}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Reports
                  </div>
                </div>
                <div className="text-center bg-blue-50 rounded-lg p-2 sm:p-3">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-blue-600">
                    {userStats.communityPoints}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">Points</div>
                </div>
                <div className="text-center bg-green-50 rounded-lg p-2 sm:p-3">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                    {userStats.trustScore}%
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Trust Score
                  </div>
                </div>
                <div className="text-center bg-purple-50 rounded-lg p-2 sm:p-3">
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
                    {userStats.helpfulVotes}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600">
                    Helpful Votes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
        {/* Achievements */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            {achievements.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border hover:border-gray-300 transition-colors"
                >
                  <div
                    className={`p-2 sm:p-3 rounded-full ${achievement.earned ? "bg-green-100" : "bg-gray-100"}`}
                  >
                    <IconComponent
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${achievement.earned ? "text-green-600" : "text-gray-400"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base truncate">
                      {achievement.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                      {achievement.description}
                    </p>
                    {achievement.earned && achievement.date && (
                      <p className="text-xs text-gray-500 mt-1">
                        Earned on {format(achievement.date, "MMM d, yyyy")}
                      </p>
                    )}
                    {!achievement.earned && achievement.progress && (
                      <div className="mt-2 space-y-1">
                        <Progress
                          value={achievement.progress}
                          className="h-1.5 sm:h-2"
                        />
                        <p className="text-xs text-gray-500">
                          {achievement.progress}% complete
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="transition-all duration-300 hover:shadow-lg">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border hover:border-gray-300 transition-colors"
              >
                <div className="mt-0.5 sm:mt-1">
                  {getStatusIcon(activity.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm sm:text-base truncate">
                    {activity.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(activity.timestamp, "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              className="w-full mt-4 touch-manipulation"
            >
              View All Activity
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Trust Score Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Trust Score Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Report Accuracy</span>
                <span className="text-sm text-gray-600">95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  Community Engagement
                </span>
                <span className="text-sm text-gray-600">88%</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Response Rate</span>
                <span className="text-sm text-gray-600">
                  {userStats.responseRate}%
                </span>
              </div>
              <Progress value={userStats.responseRate} className="h-2" />
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              How to improve your Trust Score
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Submit detailed and accurate fraud reports</li>
              <li>• Engage positively with the community</li>
              <li>• Respond to follow-up questions promptly</li>
              <li>• Help other users with their queries</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileOverview;
