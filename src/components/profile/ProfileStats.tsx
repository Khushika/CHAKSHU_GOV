import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Shield,
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  Trophy,
  Target,
  Clock,
  CheckCircle,
} from "lucide-react";

const ProfileStats = () => {
  const stats = {
    reportsSubmitted: 12,
    reportsResolved: 8,
    communityPoints: 850,
    trustScore: 92,
    helpfulVotes: 156,
    responseRate: 94,
    activeDays: 45,
    badgesEarned: 5,
  };

  const recentAchievements = [
    {
      title: "Fraud Fighter",
      description: "Submitted 10+ fraud reports",
      icon: Shield,
      color: "bg-blue-500",
      earnedDate: "2 days ago",
    },
    {
      title: "Community Helper",
      description: "Helped 10+ community members",
      icon: Users,
      color: "bg-green-500",
      earnedDate: "1 week ago",
    },
    {
      title: "Trusted Reporter",
      description: "90%+ report accuracy rate",
      icon: Star,
      color: "bg-yellow-500",
      earnedDate: "2 weeks ago",
    },
  ];

  const progressMetrics = [
    {
      label: "Next Achievement",
      description: "Top Contributor (15 reports needed)",
      current: 12,
      target: 25,
      color: "bg-blue-500",
    },
    {
      label: "Trust Score Goal",
      description: "Reach 95% trust score",
      current: 92,
      target: 95,
      color: "bg-green-500",
    },
    {
      label: "Community Impact",
      description: "Help 50 community members",
      current: 28,
      target: 50,
      color: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
      {/* Quick Stats */}
      <Card className="xl:col-span-2 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            Your Impact
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <div className="text-center p-3 sm:p-4 lg:p-6 bg-blue-50 rounded-lg transition-all duration-200 hover:bg-blue-100">
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
                {stats.reportsSubmitted}
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-blue-700 font-medium">
                Reports Submitted
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.reportsResolved} resolved
              </div>
            </div>

            <div className="text-center p-3 sm:p-4 lg:p-6 bg-green-50 rounded-lg transition-all duration-200 hover:bg-green-100">
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <Star className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-green-600" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600">
                {stats.trustScore}%
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-green-700 font-medium">
                Trust Score
              </div>
              <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                <TrendingUp className="inline h-3 w-3" />
                +5% this month
              </div>
            </div>

            <div className="text-center p-3 sm:p-4 lg:p-6 bg-purple-50 rounded-lg transition-all duration-200 hover:bg-purple-100">
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-purple-600" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">
                {stats.communityPoints}
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-purple-700 font-medium">
                Community Points
              </div>
              <div className="text-xs text-gray-500 mt-1">Rank: Top 15%</div>
            </div>

            <div className="text-center p-3 sm:p-4 lg:p-6 bg-yellow-50 rounded-lg transition-all duration-200 hover:bg-yellow-100">
              <div className="flex items-center justify-center mb-2 sm:mb-3">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-yellow-600" />
              </div>
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600">
                {stats.helpfulVotes}
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-yellow-700 font-medium">
                Helpful Votes
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {stats.responseRate}% response rate
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
            <div className="flex items-center justify-center gap-2 p-2 sm:p-3 rounded-lg bg-gray-50">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600">
                {stats.activeDays} active days
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2 sm:p-3 rounded-lg bg-gray-50">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600">
                {stats.badgesEarned} badges earned
              </span>
            </div>
            <div className="flex items-center justify-center gap-2 p-2 sm:p-3 rounded-lg bg-gray-50">
              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600">
                Verified member
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentAchievements.map((achievement, index) => {
            const IconComponent = achievement.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg border"
              >
                <div
                  className={`p-2 rounded-full ${achievement.color} text-white`}
                >
                  <IconComponent className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{achievement.title}</h4>
                  <p className="text-xs text-gray-600">
                    {achievement.description}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {achievement.earnedDate}
                  </p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Progress Tracking */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Progress Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {progressMetrics.map((metric, index) => (
              <div key={index} className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">{metric.label}</h4>
                  <Badge variant="outline">
                    {metric.current}/{metric.target}
                  </Badge>
                </div>
                <Progress
                  value={(metric.current / metric.target) * 100}
                  className="h-2"
                />
                <p className="text-sm text-gray-600">{metric.description}</p>
                <div className="text-xs text-gray-500">
                  {Math.round((metric.current / metric.target) * 100)}% complete
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStats;
