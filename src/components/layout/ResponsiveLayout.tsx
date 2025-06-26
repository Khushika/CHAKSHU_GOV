import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  spacing?: "sm" | "md" | "lg" | "xl";
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  className,
  maxWidth = "xl",
  padding = "md",
  spacing = "md",
}) => {
  const maxWidthClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    "2xl": "max-w-8xl",
    full: "max-w-none",
  };

  const paddingClasses = {
    none: "",
    sm: "px-4 sm:px-6",
    md: "px-4 sm:px-6 lg:px-8",
    lg: "px-4 sm:px-6 lg:px-8 xl:px-12",
    xl: "px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16",
  };

  const spacingClasses = {
    sm: "space-y-4 sm:space-y-6",
    md: "space-y-6 sm:space-y-8 lg:space-y-12",
    lg: "space-y-8 sm:space-y-12 lg:space-y-16",
    xl: "space-y-12 sm:space-y-16 lg:space-y-20",
  };

  return (
    <div
      className={cn(
        "container mx-auto",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        spacingClasses[spacing],
        "scroll-smooth",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default ResponsiveLayout;
