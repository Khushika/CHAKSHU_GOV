import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Lock, Eye, FileText, AlertTriangle } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Your privacy and data protection are our top priorities
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: January 2025
            </p>
          </div>

          <div className="space-y-8">
            {/* Information Collection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  We collect information to provide better services to our users
                  and protect against fraud:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    Personal information you provide when reporting fraud (phone
                    numbers, incident details)
                  </li>
                  <li>
                    Account information for registered users (email, name,
                    authentication details)
                  </li>
                  <li>
                    Technical information (IP address, browser type, device
                    information)
                  </li>
                  <li>
                    Usage data to improve our services and fraud detection
                    capabilities
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Usage */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Your information is used for legitimate purposes in the fight
                  against fraud:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Processing and investigating fraud reports</li>
                  <li>
                    Coordinating with telecom operators and law enforcement
                  </li>
                  <li>Providing you with updates on your reports</li>
                  <li>Improving fraud detection and prevention systems</li>
                  <li>
                    Generating anonymized statistics to combat fraud trends
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Protection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Data Protection & Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  We implement robust security measures to protect your data:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>End-to-end encryption for sensitive communications</li>
                  <li>Secure data storage in government-approved facilities</li>
                  <li>Regular security audits and vulnerability assessments</li>
                  <li>
                    Access controls limiting data access to authorized personnel
                    only
                  </li>
                  <li>Compliance with Indian data protection regulations</li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-red-600" />
                  Data Sharing & Disclosure
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  We share information only when necessary for fraud prevention:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>With telecom operators to block fraudulent numbers</li>
                  <li>
                    With law enforcement agencies for investigation purposes
                  </li>
                  <li>With government agencies as required by law</li>
                  <li>
                    We never sell or rent your personal information to third
                    parties
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Your Rights & Choices
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  You have the following rights regarding your personal data:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Access your personal information we hold</li>
                  <li>Request correction of inaccurate information</li>
                  <li>
                    Request deletion of your data (subject to legal
                    requirements)
                  </li>
                  <li>Opt-out of non-essential communications</li>
                  <li>File complaints with the Data Protection Authority</li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4">Contact Us</h3>
                <p className="text-gray-700 mb-4">
                  If you have any questions about this Privacy Policy, please
                  contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> privacy@chakshu.gov.in
                  </p>
                  <p>
                    <strong>Phone:</strong> 1930 (Toll-free)
                  </p>
                  <p>
                    <strong>Address:</strong> Department of Telecommunications,
                    Government of India
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
