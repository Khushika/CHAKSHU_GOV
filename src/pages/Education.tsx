import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NavigationButtons from "@/components/common/NavigationButtons";
import EducationHero from "@/components/education/EducationHero";
import FraudIdentificationGuide from "@/components/education/FraudIdentificationGuide";
import VideoTutorials from "@/components/education/VideoTutorials";
import DownloadableResources from "@/components/education/DownloadableResources";
import SpecialProtectionTips from "@/components/education/SpecialProtectionTips";
import ChildrenSafetySection from "@/components/education/ChildrenSafetySection";
import BusinessFraudGuide from "@/components/education/BusinessFraudGuide";
import LatestFraudAlerts from "@/components/education/LatestFraudAlerts";
import GovernmentAdvisories from "@/components/education/GovernmentAdvisories";
import FAQSection from "@/components/education/FAQSection";
import { LanguageProvider } from "@/components/language/LanguageProvider";

const Education = () => {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-gray-50 scroll-smooth">
        <Header />

        <EducationHero />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-8 sm:space-y-12 lg:space-y-16">
          {/* Navigation Buttons */}
          <div className="mb-6 sm:mb-8 lg:mb-12">
            <NavigationButtons />
          </div>

          <FraudIdentificationGuide />

          <VideoTutorials />

          <DownloadableResources />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            <SpecialProtectionTips />
            <ChildrenSafetySection />
          </div>

          <BusinessFraudGuide />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
            <LatestFraudAlerts />
            <GovernmentAdvisories />
          </div>

          <FAQSection />
        </div>

        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Education;
