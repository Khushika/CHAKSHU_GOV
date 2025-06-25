import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { User, LogOut, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import EnhancedNotificationCenter from "@/components/notifications/EnhancedNotificationCenter";
import AuthModal from "@/components/auth/AuthModal";
import LanguageSelector from "@/components/language/LanguageSelector";
import ThemeToggle from "@/components/theme/ThemeToggle";
import AccessibilityUtils from "@/components/accessibility/AccessibilityUtils";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const Header = () => {
  const { user, signOut, loading } = useAuth();
  const { t, isRTL } = useLanguage();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleOpenLogin = () => {
    setAuthMode("login");
    setIsAuthModalOpen(true);
  };

  const handleOpenSignup = () => {
    setAuthMode("signup");
    setIsAuthModalOpen(true);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getUserInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const navigationItems = [
    { to: "/", label: t.header.home },
    { to: "/dashboard", label: t.header.trackStatus },
    { to: "/citizen-services", label: t.header.citizenServices },
    { to: "/reports-management", label: t.header.myReports },
    { to: "/search", label: t.header.search },
    { to: "/community", label: t.header.community },
    { to: "/education", label: t.header.education },
    { to: "/mobile-app", label: t.header.mobileApp },
    { to: "/ai-features", label: t.header.aiFeatures },
    { to: "/guidelines", label: t.header.guidelines },
    { to: "/help", label: t.header.help },
  ];

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="skip-to-content focus-visible-ring"
        aria-label={t.accessibility.skipToContent}
      >
        {t.accessibility.skipToContent}
      </a>

      <header
        className="bg-white dark:bg-gray-800 shadow-lg border-b-4 border-india-saffron transition-colors duration-300"
        role="banner"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 nav-no-overflow">
          <div
            className={`flex justify-between items-center py-3 lg:py-4 min-h-[60px] ${isRTL ? "flex-row-reverse" : ""}`}
          >
            {/* Logo and Title */}
            <Link
              to="/"
              className={`flex items-center space-x-3 lg:space-x-4 flex-shrink-0 ${isRTL ? "space-x-reverse" : ""}`}
            >
              <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-india-saffron to-saffron-600 rounded-full flex items-center justify-center">
                <span
                  className="text-white font-bold text-lg lg:text-xl"
                  aria-hidden="true"
                >
                  च
                </span>
              </div>
              <div className={isRTL ? "text-right" : ""}>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                  {t.header.title}
                </h1>
                <p className="text-xs lg:text-sm text-gray-600 dark:text-light-yellow hidden sm:block">
                  {t.header.subtitle}
                </p>
              </div>
            </Link>

            {/* Desktop Navigation - Responsive visibility with proper spacing */}
            <nav
              className={`hidden lg:flex nav-responsive items-center ${isRTL ? "space-x-reverse" : ""} max-w-4xl`}
              role="navigation"
              aria-label={t.accessibility.mainNavigation}
            >
              {navigationItems.slice(0, 8).map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className="text-gray-700 dark:text-white hover:text-india-saffron dark:hover:text-light-yellow font-medium text-xs xl:text-sm 2xl:text-base px-1 xl:px-2 py-1 transition-colors"
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </Link>
              ))}

              {/* More dropdown for remaining items */}
              {navigationItems.length > 8 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-700 dark:text-white hover:text-india-saffron dark:hover:text-light-yellow font-medium text-xs xl:text-sm 2xl:text-base px-1 xl:px-2 py-1"
                    >
                      More
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {navigationItems.slice(8).map((item, index) => (
                      <DropdownMenuItem key={index} asChild>
                        <Link to={item.to} className="w-full">
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </nav>

            {/* Mobile Menu Button - Show only on screens smaller than lg - MOVED TO LEFT */}
            <div className="lg:hidden order-first">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 lg:h-10 lg:w-10 p-0 focus-visible-ring"
                    aria-label="Toggle mobile menu"
                  >
                    <Menu className="h-5 w-5 lg:h-6 lg:w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 sm:w-96">
                  <SheetHeader>
                    <SheetTitle
                      className={`text-lg font-bold text-gray-900 dark:text-white ${isRTL ? "text-right" : "text-left"}`}
                    >
                      {t.header.title}
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col space-y-6 mt-6">
                    {/* Mobile Controls Section */}
                    <div className="lg:hidden">
                      <h3
                        className={`text-sm font-semibold text-gray-500 dark:text-light-yellow mb-3 uppercase tracking-wide ${isRTL ? "text-right" : ""}`}
                      >
                        {t.accessibility.accessibility || "Settings"}
                      </h3>
                      <div
                        className={`flex flex-wrap gap-3 ${isRTL ? "justify-end" : ""}`}
                      >
                        <AccessibilityUtils />
                        <LanguageSelector />
                      </div>
                    </div>

                    <Separator />

                    {/* Navigation Links */}
                    <nav
                      className="flex flex-col space-y-1"
                      role="navigation"
                      aria-label="Mobile navigation"
                    >
                      <h3
                        className={`text-sm font-semibold text-gray-500 dark:text-light-yellow mb-3 uppercase tracking-wide ${isRTL ? "text-right" : ""}`}
                      >
                        Navigation
                      </h3>
                      {navigationItems.map((item, index) => (
                        <Link
                          key={index}
                          to={item.to}
                          onClick={closeMobileMenu}
                          className={`flex items-center py-3 px-3 rounded-lg text-gray-700 dark:text-white hover:bg-india-saffron hover:text-white transition-colors focus-visible-ring ${isRTL ? "text-right" : ""}`}
                        >
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ))}
                    </nav>

                    {/* Mobile Authentication Section */}
                    {!user && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h3
                            className={`text-sm font-semibold text-gray-500 dark:text-light-yellow uppercase tracking-wide ${isRTL ? "text-right" : ""}`}
                          >
                            Account
                          </h3>
                          <div className="space-y-2">
                            <Button
                              onClick={() => {
                                handleOpenLogin();
                                closeMobileMenu();
                              }}
                              className="w-full bg-india-saffron hover:bg-saffron-600 text-white focus-visible-ring"
                              disabled={loading}
                            >
                              {t.header.login}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                handleOpenSignup();
                                closeMobileMenu();
                              }}
                              className="w-full border-india-saffron text-india-saffron hover:bg-india-saffron hover:text-white dark:border-india-saffron dark:text-india-saffron focus-visible-ring"
                              disabled={loading}
                            >
                              {t.header.signup}
                            </Button>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Mobile User Info */}
                    {user && (
                      <>
                        <Separator />
                        <div className="space-y-3">
                          <h3
                            className={`text-sm font-semibold text-gray-500 dark:text-light-yellow uppercase tracking-wide ${isRTL ? "text-right" : ""}`}
                          >
                            Account
                          </h3>
                          <div
                            className={`flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg ${isRTL ? "space-x-reverse" : ""}`}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-india-saffron text-white">
                                {getUserInitials(user.user_metadata?.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div
                              className={`flex-1 min-w-0 ${isRTL ? "text-right" : ""}`}
                            >
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {user.user_metadata?.full_name ||
                                  t.header.profile}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-light-yellow truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Link
                              to="/profile"
                              onClick={closeMobileMenu}
                              className={`flex items-center py-2 px-3 rounded-lg text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-visible-ring ${isRTL ? "flex-row-reverse" : ""}`}
                            >
                              <User
                                className={`h-4 w-4 ${isRTL ? "ml-3" : "mr-3"}`}
                                aria-hidden="true"
                              />
                              <span>Profile</span>
                            </Link>
                            <Link
                              to="/dashboard"
                              onClick={closeMobileMenu}
                              className={`flex items-center py-2 px-3 rounded-lg text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-visible-ring ${isRTL ? "flex-row-reverse" : ""}`}
                            >
                              <User
                                className={`h-4 w-4 ${isRTL ? "ml-3" : "mr-3"}`}
                                aria-hidden="true"
                              />
                              <span>{t.header.trackStatus}</span>
                            </Link>
                            <Link
                              to="/reports-management"
                              onClick={closeMobileMenu}
                              className={`flex items-center py-2 px-3 rounded-lg text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus-visible-ring ${isRTL ? "flex-row-reverse" : ""}`}
                            >
                              <User
                                className={`h-4 w-4 ${isRTL ? "ml-3" : "mr-3"}`}
                                aria-hidden="true"
                              />
                              <span>{t.header.myReports}</span>
                            </Link>
                            <button
                              onClick={() => {
                                handleSignOut();
                                closeMobileMenu();
                              }}
                              className={`flex items-center w-full py-2 px-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus-visible-ring ${isRTL ? "flex-row-reverse" : ""}`}
                            >
                              <LogOut
                                className={`h-4 w-4 ${isRTL ? "ml-3" : "mr-3"}`}
                                aria-hidden="true"
                              />
                              <span>{t.header.logout}</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Controls Section - Moved to right side */}
            <div
              className={`flex items-center space-x-2 lg:space-x-4 ${isRTL ? "space-x-reverse" : ""}`}
            >
              {/* Mobile Controls - Show limited controls on small screens */}
              <div className="flex items-center space-x-2 lg:hidden">
                <EnhancedNotificationCenter />
                <ThemeToggle />
              </div>

              {/* Desktop Controls - Hidden on mobile */}
              <div
                className={`hidden lg:flex items-center space-x-3 ${isRTL ? "space-x-reverse" : ""}`}
              >
                <EnhancedNotificationCenter />
                <AccessibilityUtils />
                <LanguageSelector />
                <ThemeToggle />
              </div>

              {/* User Authentication */}
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-8 w-8 lg:h-10 lg:w-10 rounded-full focus-visible-ring"
                      aria-label={t.accessibility.userMenu}
                    >
                      <Avatar className="h-8 w-8 lg:h-10 lg:w-10">
                        <AvatarFallback className="bg-india-saffron text-white text-sm lg:text-base">
                          {getUserInitials(user.user_metadata?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-56"
                    align={isRTL ? "start" : "end"}
                    role="menu"
                    aria-label={t.accessibility.userMenu}
                  >
                    <div
                      className={`flex flex-col space-y-1 p-2 ${isRTL ? "text-right" : ""}`}
                    >
                      <p className="text-sm font-medium leading-none">
                        {user.user_metadata?.full_name || t.header.profile}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        to="/profile"
                        className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}
                        role="menuitem"
                      >
                        <User
                          className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`}
                          aria-hidden="true"
                        />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/dashboard"
                        className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}
                        role="menuitem"
                      >
                        <User
                          className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`}
                          aria-hidden="true"
                        />
                        <span>{t.header.trackStatus}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        to="/reports-management"
                        className={`flex items-center ${isRTL ? "flex-row-reverse" : ""}`}
                        role="menuitem"
                      >
                        <User
                          className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`}
                          aria-hidden="true"
                        />
                        <span>{t.header.myReports}</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleSignOut}
                      className={`flex items-center text-red-600 focus:text-red-600 ${isRTL ? "flex-row-reverse" : ""}`}
                      role="menuitem"
                    >
                      <LogOut
                        className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`}
                        aria-hidden="true"
                      />
                      <span>{t.header.logout}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div
                  className={`flex items-center space-x-2 ${isRTL ? "space-x-reverse" : ""}`}
                >
                  <Button
                    variant="outline"
                    onClick={handleOpenSignup}
                    size="sm"
                    className="border-india-saffron text-india-saffron hover:bg-india-saffron hover:text-white dark:border-india-saffron dark:text-india-saffron focus-visible-ring text-xs lg:text-sm hidden sm:inline-flex"
                    disabled={loading}
                  >
                    {t.header.signup}
                  </Button>
                  <Button
                    onClick={handleOpenLogin}
                    size="sm"
                    className="bg-india-saffron hover:bg-saffron-600 text-white focus-visible-ring text-xs lg:text-sm"
                    disabled={loading}
                  >
                    {t.header.login}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
};

export default Header;
