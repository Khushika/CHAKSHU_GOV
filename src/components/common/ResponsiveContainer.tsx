import React from "react";
import { cn } from "@/lib/utils";
import { containerClasses } from "@/lib/responsive-utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  size = "lg",
  padding = "md",
}) => {
  const sizeClasses = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-none",
  };

  const paddingClasses = {
    none: "",
    sm: "px-4",
    md: "px-4 sm:px-6 lg:px-8",
    lg: "px-6 sm:px-8 lg:px-12",
  };

  return (
    <div
      className={cn(
        "container mx-auto",
        sizeClasses[size],
        paddingClasses[padding],
        className,
      )}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;
