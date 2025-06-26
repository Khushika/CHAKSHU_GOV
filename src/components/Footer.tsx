import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link
              to="/"
              className="flex items-center space-x-3 mb-4 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-india-saffron to-saffron-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">च</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">चक्षु</h3>
                <p className="text-sm text-gray-400 dark:text-light-yellow">
                  Chakshu Portal
                </p>
              </div>
            </Link>
            <p className="text-gray-400 dark:text-light-yellow text-sm">
              Protecting India from fraud calls and SMS through collective
              action and government intervention.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400 dark:text-light-yellow">
              <li>
                <Link
                  to="/?report=true"
                  className="hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Report Fraud
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Track Status
                </Link>
              </li>
              <li>
                <Link
                  to="/guidelines"
                  className="hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Guidelines
                </Link>
              </li>
              <li>
                <Link
                  to="/help#faq"
                  className="hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400 dark:text-light-yellow">
              <li>
                <Link
                  to="/help"
                  className="hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  to="/help#contact"
                  className="hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white dark:hover:text-gray-300 transition-colors"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact</h4>
            <div className="space-y-2 text-sm text-gray-400 dark:text-light-yellow">
              <p>
                Helpline:{" "}
                <a
                  href="tel:1930"
                  className="hover:text-white dark:hover:text-gray-300 transition-colors underline"
                >
                  1930
                </a>
              </p>
              <p>
                Email:{" "}
                <a
                  href="mailto:support@chakshu.gov.in"
                  className="hover:text-white dark:hover:text-gray-300 transition-colors underline"
                >
                  support@chakshu.gov.in
                </a>
              </p>
              <p>Available 24/7</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-sm text-gray-400 dark:text-light-yellow">
            © 2025 Government of India. All rights reserved.
          </p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <span className="text-sm text-gray-400 dark:text-light-yellow">
              Made with 🇮🇳 for India
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
