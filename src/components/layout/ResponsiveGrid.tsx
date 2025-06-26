import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg" | "xl";
  breakpoints?: {
    sm?: 1 | 2 | 3 | 4;
    md?: 1 | 2 | 3 | 4 | 5;
    lg?: 1 | 2 | 3 | 4 | 5 | 6;
    xl?: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = 3,
  gap = "md",
  breakpoints,
}) => {
  const baseColClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 lg:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 xl:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
    5: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
    6: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6",
  };

  const gapClasses = {
    sm: "gap-3 sm:gap-4",
    md: "gap-4 sm:gap-6 lg:gap-8",
    lg: "gap-6 sm:gap-8 lg:gap-10",
    xl: "gap-8 sm:gap-10 lg:gap-12",
  };

  let gridClasses = baseColClasses[cols];

  // Custom breakpoint overrides
  if (breakpoints) {
    gridClasses = "grid-cols-1";
    if (breakpoints.sm) {
      gridClasses += ` sm:grid-cols-${breakpoints.sm}`;
    }
    if (breakpoints.md) {
      gridClasses += ` md:grid-cols-${breakpoints.md}`;
    }
    if (breakpoints.lg) {
      gridClasses += ` lg:grid-cols-${breakpoints.lg}`;
    }
    if (breakpoints.xl) {
      gridClasses += ` xl:grid-cols-${breakpoints.xl}`;
    }
  }

  return (
    <div className={cn("grid", gridClasses, gapClasses[gap], className)}>
      {children}
    </div>
  );
};

export default ResponsiveGrid;
