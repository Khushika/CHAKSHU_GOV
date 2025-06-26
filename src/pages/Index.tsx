import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import StatsCounter from "@/components/StatsCounter";
import FeatureCards from "@/components/FeatureCards";
import TrustBadges from "@/components/TrustBadges";
import Footer from "@/components/Footer";
import FraudReportingForm from "@/components/FraudReportingForm";
import NavigationButtons from "@/components/common/NavigationButtons";
import GuestFeatures from "@/components/common/GuestFeatures";
import DemoLogin from "@/components/common/DemoLogin";
import { Button } from "@/components/ui/button";
import { Plus, Shield, User, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthenticatedContentProps {
  onReportFraud: () => void;
}

const AuthenticatedContent: React.FC<AuthenticatedContentProps> = ({
  onReportFraud,
}) => {
  const { user } = useAuth();

  if (user) {
    // Authenticated user content
    return (
      <div className="text-center py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row lg:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-center max-w-4xl mx-auto">
            <Button
              onClick={onReportFraud}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation"
              size="lg"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Report New Fraud</span>
            </Button>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white dark:border-blue-600 dark:text-blue-600 dark:hover:bg-blue-600 dark:hover:text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center gap-2 touch-manipulation"
                size="lg"
              >
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>My Dashboard</span>
              </Button>
            </Link>
            <Link to="/reports-management" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white dark:border-purple-600 dark:text-purple-600 dark:hover:bg-purple-600 dark:hover:text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center gap-2 touch-manipulation"
                size="lg"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>My Reports</span>
              </Button>
            </Link>
          </div>
          <p className="text-sm sm:text-base text-gray-600 dark:text-white max-w-3xl mx-auto leading-relaxed">
            Welcome back! You're part of the community protecting India from
            fraud. Track your reports, explore insights, and stay protected.
          </p>
        </div>
      </div>
    );
  }

  // Non-authenticated user content
  return (
    <div className="text-center py-6 sm:py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-center max-w-3xl mx-auto">
          <Button
            onClick={onReportFraud}
            className="w-full sm:w-auto bg-india-saffron hover:bg-saffron-600 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 touch-manipulation"
            size="lg"
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>Report Fraud Now</span>
          </Button>
          <Link to="/education" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full border-india-green text-india-green hover:bg-india-green hover:text-white dark:border-india-green dark:text-india-green dark:hover:bg-india-green dark:hover:text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 flex items-center justify-center gap-2 touch-manipulation"
              size="lg"
            >
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Learn About Fraud</span>
            </Button>
          </Link>
        </div>
        <p className="text-sm sm:text-base text-gray-600 dark:text-white max-w-3xl mx-auto leading-relaxed">
          Join thousands of Indians in the fight against fraud. Report
          incidents, track trends, and help build a safer digital ecosystem for
          everyone.
        </p>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 sm:p-6 max-w-lg mx-auto">
          <p className="text-sm sm:text-base text-yellow-800 dark:text-yellow-200 leading-relaxed">
            <strong>Sign up</strong> to track your reports, access personalized
            insights, and join our community of fraud fighters.
          </p>
        </div>
      </div>
    </div>
  );
};

const Index = () => {
  const { user } = useAuth();
  const [showReportForm, setShowReportForm] = useState(false);
  const [searchParams] = useSearchParams();

  // Check if report parameter is present in URL
  useEffect(() => {
    if (searchParams.get("report") === "true") {
      setShowReportForm(true);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 scroll-smooth">
      <Header />

      {!showReportForm ? (
        <div className="space-y-6 sm:space-y-8 lg:space-y-12">
          <Hero />
          <AuthenticatedContent onReportFraud={() => setShowReportForm(true)} />
          <StatsCounter />
          <FeatureCards />
          {!user && (
            <>
              <GuestFeatures />
              <DemoLogin />
            </>
          )}
          <TrustBadges />
          <Footer />
        </div>
      ) : (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 bg-white dark:bg-gray-900 min-h-screen">
          <NavigationButtons showBack={false} showNext={false} />
          <div className="mb-6 sm:mb-8">
            <Button
              variant="outline"
              onClick={() => setShowReportForm(false)}
              className="mb-4 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 touch-manipulation"
            >
              ← Back to Home
            </Button>
          </div>
          <FraudReportingForm />
        </div>
      )}
    </div>
  );
};

export default Index;
