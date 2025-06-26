import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MessageSquare,
  FileText,
  Settings,
  BarChart3,
  Bell,
} from "lucide-react";
import Header from "@/components/Header";
import NavigationButtons from "@/components/common/NavigationButtons";
import ChatbotInterface from "@/components/help/ChatbotInterface";
import FAQSection from "@/components/help/FAQSection";
import VideoLibrary from "@/components/help/VideoLibrary";
import LiveChat from "@/components/help/LiveChat";
import SupportTickets from "@/components/help/SupportTickets";
import CommunityForum from "@/components/help/CommunityForum";
import FeedbackForm from "@/components/help/FeedbackForm";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import AuthGuard from "@/components/auth/AuthGuard";

const HelpCenter = () => {
  const [activeTab, setActiveTab] = useState("chatbot");
  const location = useLocation();

  // Handle anchor links from footer
  useEffect(() => {
    if (location.hash) {
      const anchor = location.hash.slice(1); // Remove the '#'
      if (anchor === "faq") {
        setActiveTab("faq");
      } else if (anchor === "contact") {
        setActiveTab("support");
      }

      // Smooth scroll to the element after a brief delay
      setTimeout(() => {
        const element = document.getElementById(anchor);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
  }, [location.hash]);

  return (
    <AuthGuard message="Sign in to access personalized help, support tickets, analytics, and all help center features.">
      <div className="min-h-screen bg-gray-50">
        <Header />

        <div className="container mx-auto px-4 py-8">
          {/* Navigation Buttons */}
          <NavigationButtons />

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Help Center
            </h1>
            <p className="text-gray-600">
              Get the help you need with our comprehensive support system
            </p>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-10">
              <TabsTrigger value="chatbot" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Chat</span>
              </TabsTrigger>
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">FAQ</span>
              </TabsTrigger>
              <TabsTrigger value="videos" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Videos</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Support</span>
              </TabsTrigger>
              <TabsTrigger value="forum" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Forum</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chatbot" className="mt-6">
              <ChatbotInterface />
            </TabsContent>

            <TabsContent value="faq" className="mt-6" id="faq">
              <FAQSection />
            </TabsContent>

            <TabsContent value="videos" className="mt-6">
              <VideoLibrary />
            </TabsContent>

            <TabsContent value="support" className="mt-6" id="contact">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LiveChat />
                <SupportTickets />
              </div>
            </TabsContent>

            <TabsContent value="forum" className="mt-6">
              <div className="grid grid-cols-1 gap-6">
                <CommunityForum />
                <FeedbackForm />
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <AnalyticsDashboard />
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <div className="max-w-4xl">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Management</CardTitle>
                    <CardDescription>
                      Manage your notification preferences and view notification
                      history
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <NotificationCenter />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthGuard>
  );
};

export default HelpCenter;
