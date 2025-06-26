import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Scale,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
} from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Terms of Service
            </h1>
            <p className="text-lg text-gray-600">
              Please read these terms carefully before using our services
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Last updated: January 2025
            </p>
          </div>

          <div className="space-y-8">
            {/* Acceptance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Acceptance of Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  By accessing and using the Chakshu portal, you accept and
                  agree to be bound by the terms and provision of this
                  agreement. These terms apply to all users of the service.
                </p>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Service Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  Chakshu is a government portal designed to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Enable citizens to report fraudulent calls and SMS</li>
                  <li>
                    Coordinate with telecom operators to block fraudulent
                    numbers
                  </li>
                  <li>Provide fraud awareness and prevention resources</li>
                  <li>
                    Facilitate communication between citizens and law
                    enforcement
                  </li>
                  <li>Generate insights to combat fraud trends</li>
                </ul>
              </CardContent>
            </Card>

            {/* User Responsibilities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5 text-purple-600" />
                  User Responsibilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  When using our services, you agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    Provide accurate and truthful information in fraud reports
                  </li>
                  <li>
                    Use the service only for legitimate fraud reporting purposes
                  </li>
                  <li>Not submit false or malicious reports</li>
                  <li>Respect the privacy and rights of others</li>
                  <li>Comply with all applicable laws and regulations</li>
                  <li>Not attempt to disrupt or compromise the service</li>
                </ul>
              </CardContent>
            </Card>

            {/* Prohibited Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Prohibited Activities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  The following activities are strictly prohibited:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Submitting false or misleading fraud reports</li>
                  <li>Using the service to harass or target individuals</li>
                  <li>Attempting to gain unauthorized access to the system</li>
                  <li>
                    Interfering with the proper functioning of the service
                  </li>
                  <li>Violating any applicable laws or regulations</li>
                  <li>Sharing your account credentials with others</li>
                </ul>
              </CardContent>
            </Card>

            {/* Government Authority */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-indigo-600" />
                  Government Authority
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  This service is operated by the Government of India. We
                  reserve the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    Investigate reported fraud cases and take appropriate action
                  </li>
                  <li>Coordinate with law enforcement and telecom operators</li>
                  <li>
                    Modify or discontinue the service with or without notice
                  </li>
                  <li>
                    Suspend or terminate accounts that violate these terms
                  </li>
                  <li>
                    Disclose information as required by law or for public safety
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Limitation of Liability
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700">
                  The Government of India provides this service "as is" and:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>
                    Makes no warranties regarding the accuracy or completeness
                    of information
                  </li>
                  <li>
                    Is not liable for any damages arising from use of the
                    service
                  </li>
                  <li>
                    Cannot guarantee the prevention of all fraudulent activities
                  </li>
                  <li>
                    Is not responsible for actions taken by telecom operators or
                    third parties
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card className="bg-yellow-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4">Changes to Terms</h3>
                <p className="text-gray-700 mb-4">
                  We may update these terms from time to time. Continued use of
                  the service after changes constitutes acceptance of the new
                  terms.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="bg-blue-50">
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-4">
                  Contact Information
                </h3>
                <p className="text-gray-700 mb-4">
                  For questions about these Terms of Service, contact us:
                </p>
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>Email:</strong> legal@chakshu.gov.in
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

export default TermsOfService;
