import React from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchInterface from "@/components/search/SearchInterface";
import PublicFraudAlerts from "@/components/community/PublicFraudAlerts";
import TrendingScamPatterns from "@/components/community/TrendingScamPatterns";
import CommunityLeaderboard from "@/components/community/CommunityLeaderboard";
import EducationalArticles from "@/components/community/EducationalArticles";
import UserTestimonials from "@/components/community/UserTestimonials";
import FraudQuiz from "@/components/community/FraudQuiz";
import DiscussionForum from "@/components/community/DiscussionForum";
import RegionalStats from "@/components/community/RegionalStats";
import SuccessStories from "@/components/community/SuccessStories";
import SocialShare from "@/components/community/SocialShare";
import EnhancedCommunityReports from "@/components/community/EnhancedCommunityReports";
import NavigationButtons from "@/components/common/NavigationButtons";
import { Button } from "@/components/ui/button";

const Community = () => {
  return (
    <div className="min-h-screen bg-gray-50 scroll-smooth">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-india-saffron to-saffron-600 text-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            Community Fraud Prevention
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed">
            Join thousands of citizens in the fight against fraud. Share
            experiences, learn from others, and help build a safer digital
            India.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 lg:gap-6 justify-center items-center">
            <Link to="/" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-white text-india-saffron hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold touch-manipulation"
              >
                Report Fraud
              </Button>
            </Link>
            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button
                variant="outline"
                className="w-full sm:w-auto bg-white text-india-saffron hover:bg-gray-100 px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-semibold touch-manipulation"
              >
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12 lg:space-y-16">
        {/* Navigation Buttons */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <NavigationButtons />
        </div>

        {/* Advanced Search Interface */}
        <section className="space-y-4 sm:space-y-6 lg:space-y-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 text-center leading-tight">
            Search Community Reports & Discussions
          </h2>
          <SearchInterface />
        </section>

        {/* Discussion Forum - Moved to top for better engagement */}
        <DiscussionForum />

        {/* Enhanced Community Reports */}
        <EnhancedCommunityReports />

        {/* Public Fraud Alerts */}
        <PublicFraudAlerts />

        {/* Trending Scam Patterns */}
        <TrendingScamPatterns />

        {/* Two Column Layout - Enhanced for mobile */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          <CommunityLeaderboard />
          <RegionalStats />
        </div>

        {/* Educational Articles */}
        <EducationalArticles />

        {/* User Testimonials */}
        <UserTestimonials />

        {/* Interactive Quiz */}
        <FraudQuiz />

        {/* Success Stories */}
        <SuccessStories />

        {/* Social Share */}
        <SocialShare />
      </div>

      <Footer />
    </div>
  );
};

export default Community;
