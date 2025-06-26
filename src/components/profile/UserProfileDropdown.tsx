import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "react-router-dom";
import {
  User,
  Settings,
  Shield,
  Bell,
  Activity,
  LogOut,
  BarChart3,
  FileText,
  ChevronRight,
  Lock,
} from "lucide-react";
import ProfileOverview from "./ProfileOverview";
import AccountSettings from "./AccountSettings";
import SecuritySettings from "./SecuritySettings";
import PrivacySettings from "./PrivacySettings";
import ActivityHistory from "./ActivityHistory";
import NotificationPreferences from "./NotificationPreferences";
import ProfileStats from "./ProfileStats";
import ProfileQuickActions from "./ProfileQuickActions";

interface UserProfileDropdownProps {
  className?: string;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  className,
}) => {
  const { user, signOut, loading } = useAuth();
  const { t, isRTL } = useLanguage();
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [isSigningOut, setIsSigningOut] = useState(false);

  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  if (!user) {
    return null;
  }

  // Get the actual username from user metadata or email
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.user_metadata?.username ||
    user.email?.split("@")[0] ||
    "User";

  // Calculate profile completion percentage
  const getProfileCompletion = () => {
    let completion = 0;
    const checks = [
      user.email, // Email (required)
      user.user_metadata?.full_name, // Name
      user.user_metadata?.phone, // Phone
      user.user_metadata?.avatar_url, // Avatar
      user.user_metadata?.bio, // Bio
    ];

    checks.forEach((check) => {
      if (check) completion += 20;
    });

    return Math.min(completion, 100);
  };

  const profileCompletion = getProfileCompletion();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={`relative h-8 w-8 lg:h-10 lg:w-10 rounded-full focus-visible-ring ${className}`}
          aria-label={t.accessibility?.userMenu || "User menu"}
        >
          <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
            <AvatarFallback className="bg-india-saffron text-white text-sm lg:text-base">
              {getUserInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          {/* Status indicator for new notifications or updates */}
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 border-2 border-white rounded-full"></span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-72"
        align={isRTL ? "start" : "end"}
        role="menu"
        aria-label={t.accessibility?.userMenu || "User menu"}
        sideOffset={5}
      >
        {/* User Info Header */}
        <div
          className={`flex flex-col space-y-1 p-3 ${isRTL ? "text-right" : ""}`}
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="bg-india-saffron text-white">
                {getUserInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium leading-none truncate">
                {displayName}
              </p>
              <p className="text-xs leading-none text-muted-foreground mt-1 truncate">
                {user.email}
              </p>
              <div className="flex items-center justify-between mt-2">
                {user.user_metadata?.verified && (
                  <p className="text-xs text-green-600">✓ Verified Account</p>
                )}
                <p className="text-xs text-gray-500">
                  Profile: {profileCompletion}% complete
                </p>
              </div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Profile Section */}
        <div className="p-2">
          <Dialog
            open={isProfileDialogOpen}
            onOpenChange={setIsProfileDialogOpen}
          >
            <DialogTrigger asChild>
              <DropdownMenuItem
                className={`flex items-center justify-between cursor-pointer ${isRTL ? "flex-row-reverse" : ""}`}
                onSelect={(e) => e.preventDefault()}
              >
                <div
                  className={`flex items-center ${isRTL ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <User className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
                  <span>View Profile</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </DropdownMenuItem>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
              <DialogHeader className="p-6 pb-4 flex-shrink-0 border-b">
                <DialogTitle className="text-2xl font-bold">
                  User Profile
                </DialogTitle>
                <DialogDescription>
                  Manage your account settings, security preferences, and view
                  your activity
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full px-6 py-4 modal-scroll">
                  <div className="space-y-6">
                    {/* Profile Stats Overview */}
                    <div>
                      <ProfileStats />
                    </div>

                    {/* Quick Actions */}
                    <div>
                      <ProfileQuickActions />
                    </div>

                    {/* Main Profile Content */}
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full"
                    >
                      <div className="sticky top-0 bg-white z-10 pb-4 border-b mb-4">
                        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1">
                          <TabsTrigger
                            value="overview"
                            className="flex items-center gap-1 text-xs sm:text-sm p-2"
                          >
                            <User className="h-4 w-4" />
                            <span className="hidden sm:inline">Overview</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="account"
                            className="flex items-center gap-1 text-xs sm:text-sm p-2"
                          >
                            <Settings className="h-4 w-4" />
                            <span className="hidden sm:inline">Account</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="security"
                            className="flex items-center gap-1 text-xs sm:text-sm p-2"
                          >
                            <Shield className="h-4 w-4" />
                            <span className="hidden sm:inline">Security</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="privacy"
                            className="flex items-center gap-1 text-xs sm:text-sm p-2"
                          >
                            <Lock className="h-4 w-4" />
                            <span className="hidden sm:inline">Privacy</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="notifications"
                            className="flex items-center gap-1 text-xs sm:text-sm p-2"
                          >
                            <Bell className="h-4 w-4" />
                            <span className="hidden sm:inline">Notify</span>
                          </TabsTrigger>
                          <TabsTrigger
                            value="activity"
                            className="flex items-center gap-1 text-xs sm:text-sm p-2"
                          >
                            <Activity className="h-4 w-4" />
                            <span className="hidden sm:inline">Activity</span>
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <div className="space-y-6">
                        <TabsContent value="overview" className="mt-0">
                          <ProfileOverview />
                        </TabsContent>
                        <TabsContent value="account" className="mt-0">
                          <AccountSettings />
                        </TabsContent>
                        <TabsContent value="security" className="mt-0">
                          <SecuritySettings />
                        </TabsContent>
                        <TabsContent value="privacy" className="mt-0">
                          <PrivacySettings />
                        </TabsContent>
                        <TabsContent value="notifications" className="mt-0">
                          <NotificationPreferences />
                        </TabsContent>
                        <TabsContent value="activity" className="mt-0">
                          <ActivityHistory />
                        </TabsContent>
                      </div>
                    </Tabs>
                  </div>
                </ScrollArea>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <DropdownMenuSeparator />

        {/* Quick Links */}
        <DropdownMenuItem asChild>
          <Link
            to="/profile"
            className={`flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
            role="menuitem"
          >
            <div
              className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <User className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
              <span>Full Profile Page</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to="/dashboard"
            className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}
            role="menuitem"
          >
            <BarChart3 className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
            <span>{t.header?.trackStatus || "Track Status"}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link
            to="/reports-management"
            className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}
            role="menuitem"
          >
            <FileText className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
            <span>{t.header?.myReports || "My Reports"}</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        {/* Sign Out */}
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={isSigningOut}
          className={`flex items-center text-red-600 focus:text-red-600 ${isRTL ? "flex-row-reverse" : ""}`}
          role="menuitem"
        >
          <LogOut
            className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"} ${isSigningOut ? "animate-spin" : ""}`}
          />
          <span>
            {isSigningOut ? "Signing out..." : t.header?.logout || "Sign Out"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
