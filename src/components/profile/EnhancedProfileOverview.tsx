import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { userProfilesService, reportsService } from "@/services/database";
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
  Award,
  Users,
  Activity,
  BarChart3,
  Download,
  Upload,
  RefreshCw,
  Settings,
  Eye,
  ThumbsUp,
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface UserStats {
  reportsSubmitted: number;
  communityPoints: number;
  trustScore: number;
  memberSince: Date;
  verificationLevel: string;
  contributions: number;
  helpfulVotes: number;
  responseRate: number;
  postsCreated: number;
  commentsPosted: number;
  likesReceived: number;
  reportsResolved: number;
  streakDays: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  earned: boolean;
  date?: Date;
  progress?: number;
  category: "reporting" | "community" | "engagement" | "special";
}

interface Activity {
  id: string;
  type: "report" | "comment" | "like" | "achievement" | "badge";
  title: string;
  description: string;
  timestamp: Date;
  status: "completed" | "under_review" | "pending";
  metadata?: any;
}

interface ProfileData {
  user_id: string;
  full_name?: string;
  bio?: string;
  location?: any;
  profile_picture_url?: string;
  occupation?: string;
  phone_number?: string;
  date_of_birth?: string;
  language_preference?: string;
  reputation_score: number;
  total_posts: number;
  total_comments: number;
  total_likes_received: number;
  email_notifications: boolean;
  profile_completed: boolean;
}

const EnhancedProfileOverview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [userStats, setUserStats] = useState<UserStats>({
    reportsSubmitted: 0,
    communityPoints: 0,
    trustScore: 0,
    memberSince: new Date(),
    verificationLevel: "Basic",
    contributions: 0,
    helpfulVotes: 0,
    responseRate: 0,
    postsCreated: 0,
    commentsPosted: 0,
    likesReceived: 0,
    reportsResolved: 0,
    streakDays: 0,
  });

  const [editForm, setEditForm] = useState({
    full_name: "",
    bio: "",
    occupation: "",
    location: "",
    phone_number: "",
  });

  // Load profile data on component mount
  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  const loadProfileData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load profile data
      const profileResponse = await userProfilesService.getProfile(user.id);
      if (profileResponse.success && profileResponse.data) {
        setProfileData(profileResponse.data);
        setEditForm({
          full_name: profileResponse.data.user?.full_name || "",
          bio: profileResponse.data.bio || "",
          occupation: profileResponse.data.occupation || "",
          location: profileResponse.data.location?.city || "",
          phone_number: profileResponse.data.user?.phone_number || "",
        });
      }

      // Load user statistics
      const statsResponse = await userProfilesService.getUserStats(user.id);
      if (statsResponse.success && statsResponse.data) {
        setUserStats((prev) => ({
          ...prev,
          reportsSubmitted: statsResponse.data.reports_count,
          postsCreated: statsResponse.data.posts_count,
          commentsPosted: statsResponse.data.comments_count,
          likesReceived: statsResponse.data.likes_received,
          trustScore: Math.min(statsResponse.data.reputation_score, 100),
          communityPoints: statsResponse.data.reputation_score * 10,
        }));
      }
    } catch (error) {
      console.error("Error loading profile data:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    try {
      const updateData = {
        full_name: editForm.full_name,
        bio: editForm.bio,
        occupation: editForm.occupation,
        location: { city: editForm.location },
        phone_number: editForm.phone_number,
        profile_completed: true,
      };

      const response = await userProfilesService.updateProfile(
        user.id,
        updateData,
      );

      if (response.success) {
        setIsEditingProfile(false);
        await loadProfileData(); // Reload data
        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });
      } else {
        throw new Error(response.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAvatarUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file && user) {
        try {
          // In a real app, you would upload the file to storage
          // For now, we'll simulate the upload
          const avatarUrl = URL.createObjectURL(file);

          await userProfilesService.updateProfile(user.id, {
            profile_picture_url: avatarUrl,
          });

          await loadProfileData();
          toast({
            title: "Avatar Updated",
            description: "Your profile picture has been updated successfully.",
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to upload avatar. Please try again.",
            variant: "destructive",
          });
        }
      }
    };
    input.click();
  };

  const handleRefreshData = async () => {
    setRefreshing(true);
    await loadProfileData();
    setRefreshing(false);
    toast({
      title: "Data Refreshed",
      description: "Your profile data has been updated.",
    });
  };

  const achievements: Achievement[] = [
    {
      id: "1",
      title: "First Report",
      description: "Submitted your first fraud report",
      icon: FileText,
      earned: userStats.reportsSubmitted > 0,
      date: userStats.reportsSubmitted > 0 ? userStats.memberSince : undefined,
      category: "reporting",
    },
    {
      id: "2",
      title: "Community Helper",
      description: "Helped 10+ community members",
      icon: Heart,
      earned: userStats.helpfulVotes >= 10,
      progress: Math.min((userStats.helpfulVotes / 10) * 100, 100),
      category: "community",
    },
    {
      id: "3",
      title: "Fraud Fighter",
      description: "Reported 10+ fraud cases",
      icon: Shield,
      earned: userStats.reportsSubmitted >= 10,
      progress: Math.min((userStats.reportsSubmitted / 10) * 100, 100),
      category: "reporting",
    },
    {
      id: "4",
      title: "Top Contributor",
      description: "Among top 10% contributors this month",
      icon: Trophy,
      earned: userStats.communityPoints >= 1000,
      progress: Math.min((userStats.communityPoints / 1000) * 100, 100),
      category: "special",
    },
    {
      id: "5",
      title: "Social Butterfly",
      description: "Created 25+ community posts",
      icon: MessageSquare,
      earned: userStats.postsCreated >= 25,
      progress: Math.min((userStats.postsCreated / 25) * 100, 100),
      category: "engagement",
    },
    {
      id: "6",
      title: "Trusted Voice",
      description: "Received 100+ likes on posts",
      icon: ThumbsUp,
      earned: userStats.likesReceived >= 100,
      progress: Math.min((userStats.likesReceived / 100) * 100, 100),
      category: "engagement",
    },
  ];

  const recentActivity: Activity[] = [
    {
      id: "1",
      type: "report",
      title: "Submitted UPI fraud report",
      description: "Report #FR-2024-001234",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: "under_review",
    },
    {
      id: "2",
      type: "comment",
      title: "Helped community member",
      description: "Provided advice on suspicious SMS",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
      status: "completed",
    },
    {
      id: "3",
      type: "achievement",
      title: "Earned Fraud Fighter badge",
      description: "Reached 10 fraud reports milestone",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "completed",
    },
    {
      id: "4",
      type: "like",
      title: "Post received likes",
      description: "Your scam warning post was helpful to 5 users",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: "completed",
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "report":
        return <FileText className="h-4 w-4" />;
      case "comment":
        return <MessageSquare className="h-4 w-4" />;
      case "like":
        return <ThumbsUp className="h-4 w-4" />;
      case "achievement":
        return <Award className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

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
      case "Trusted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getAchievementCategoryColor = (category: string) => {
    switch (category) {
      case "reporting":
        return "bg-red-100 text-red-700 border-red-200";
      case "community":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "engagement":
        return "bg-green-100 text-green-700 border-green-200";
      case "special":
        return "bg-purple-100 text-purple-700 border-purple-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-lg mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header - Responsive */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
            {/* Avatar Section */}
            <div className="relative mx-auto lg:mx-0">
              <Avatar className="h-20 w-20 lg:h-24 lg:w-24">
                <AvatarImage
                  src={
                    profileData?.profile_picture_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`
                  }
                  alt="Profile"
                />
                <AvatarFallback className="text-lg">
                  {profileData?.full_name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("") ||
                    user?.email?.charAt(0).toUpperCase() ||
                    "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={handleAvatarUpload}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {/* Profile Info */}
            <div className="flex-1 space-y-4 text-center lg:text-left">
              <div>
                <div className="flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-3 mb-2">
                  <h2 className="text-xl lg:text-2xl font-bold text-gray-900">
                    {profileData?.full_name ||
                      user?.user_metadata?.full_name ||
                      "User"}
                  </h2>
                  <Badge
                    className={getVerificationColor(
                      userStats.verificationLevel,
                    )}
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {userStats.verificationLevel}
                  </Badge>
                </div>

                {profileData?.bio && (
                  <p className="text-gray-600 mb-3 max-w-2xl">
                    {profileData.bio}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 text-sm text-gray-600">
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                  <div className="flex items-center justify-center lg:justify-start gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0" />
                    <span>
                      Member since {format(userStats.memberSince, "MMM yyyy")}
                    </span>
                  </div>
                  {profileData?.location && (
                    <div className="flex items-center justify-center lg:justify-start gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {profileData.location.city}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats - Responsive grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <div className="text-center">
                  <div className="text-lg lg:text-2xl font-bold text-indigo-600">
                    {userStats.reportsSubmitted}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600">
                    Reports
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg lg:text-2xl font-bold text-indigo-600">
                    {userStats.communityPoints}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600">Points</div>
                </div>
                <div className="text-center">
                  <div className="text-lg lg:text-2xl font-bold text-indigo-600">
                    {userStats.trustScore}%
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600">
                    Trust Score
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg lg:text-2xl font-bold text-indigo-600">
                    {userStats.helpfulVotes}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600">
                    Helpful Votes
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
                <Dialog
                  open={isEditingProfile}
                  onOpenChange={setIsEditingProfile}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1 sm:flex-none">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={editForm.full_name}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              full_name: e.target.value,
                            }))
                          }
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={editForm.bio}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              bio: e.target.value,
                            }))
                          }
                          placeholder="Tell us about yourself..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="occupation">Occupation</Label>
                        <Input
                          id="occupation"
                          value={editForm.occupation}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              occupation: e.target.value,
                            }))
                          }
                          placeholder="Your occupation"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={editForm.location}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              location: e.target.value,
                            }))
                          }
                          placeholder="Your city"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleProfileUpdate}
                          className="flex-1"
                        >
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="outline"
                  onClick={handleRefreshData}
                  disabled={refreshing}
                  className="flex-1 sm:flex-none"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                  />
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs - Mobile friendly */}
      <Tabs defaultValue="achievements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements" className="text-xs sm:text-sm">
            <Trophy className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Achievements</span>
            <span className="sm:hidden">Awards</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="text-xs sm:text-sm">
            <Activity className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Activity</span>
            <span className="sm:hidden">Activity</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Statistics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {achievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <div
                      key={achievement.id}
                      className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-all ${
                        achievement.earned
                          ? `${getAchievementCategoryColor(achievement.category)} shadow-sm`
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-full ${
                          achievement.earned
                            ? "bg-white shadow-sm"
                            : "bg-gray-200"
                        }`}
                      >
                        <IconComponent
                          className={`h-5 w-5 ${
                            achievement.earned
                              ? "text-gray-700"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm lg:text-base">
                          {achievement.title}
                        </h4>
                        <p className="text-xs lg:text-sm text-gray-600 mt-1">
                          {achievement.description}
                        </p>
                        {achievement.earned && achievement.date && (
                          <p className="text-xs text-gray-500 mt-2">
                            Earned on {format(achievement.date, "MMM d, yyyy")}
                          </p>
                        )}
                        {!achievement.earned &&
                          achievement.progress !== undefined && (
                            <div className="mt-3">
                              <Progress
                                value={achievement.progress}
                                className="h-2"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                {Math.round(achievement.progress)}% complete
                              </p>
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:shadow-sm transition-shadow"
                  >
                    <div className="mt-1">{getStatusIcon(activity.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getActivityIcon(activity.type)}
                        <h4 className="font-medium text-sm lg:text-base">
                          {activity.title}
                        </h4>
                      </div>
                      <p className="text-xs lg:text-sm text-gray-600">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {format(activity.timestamp, "MMM d, h:mm a")}
                      </p>
                    </div>
                  </div>
                ))}

                <Button variant="outline" className="w-full mt-4">
                  View All Activity
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <div className="space-y-6">
            {/* Trust Score Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Trust Score Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        Report Accuracy
                      </span>
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

            {/* Detailed Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  Detailed Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <FileText className="h-8 w-8 text-red-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-red-600">
                      {userStats.reportsSubmitted}
                    </div>
                    <div className="text-sm text-red-700">
                      Reports Submitted
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <MessageSquare className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {userStats.postsCreated}
                    </div>
                    <div className="text-sm text-blue-700">Posts Created</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <ThumbsUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {userStats.likesReceived}
                    </div>
                    <div className="text-sm text-green-700">Likes Received</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      {userStats.helpfulVotes}
                    </div>
                    <div className="text-sm text-purple-700">People Helped</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedProfileOverview;
