/**
 * Safe Dialog Wrapper
 * Automatically ensures DialogTitle is present for accessibility
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface SafeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  hideTitle?: boolean;
}

/**
 * SafeDialog automatically ensures proper DialogTitle for accessibility
 * Use this instead of Dialog when you need guaranteed accessibility compliance
 */
export function SafeDialog({
  open,
  onOpenChange,
  children,
  title = "Dialog",
  description,
  className,
  hideTitle = false,
}: SafeDialogProps) {
  // Check if children already contain DialogTitle
  const childrenString = React.Children.toArray(children).join("");
  const hasDialogTitle = childrenString.includes("DialogTitle");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        {!hasDialogTitle && (
          <DialogHeader>
            {hideTitle ? (
              <VisuallyHidden>
                <DialogTitle>{title}</DialogTitle>
              </VisuallyHidden>
            ) : (
              <DialogTitle>{title}</DialogTitle>
            )}
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}

/**
 * Hook to check if a component tree contains DialogTitle
 */
export function useHasDialogTitle(children: React.ReactNode): boolean {
  return React.useMemo(() => {
    const checkForDialogTitle = (child: React.ReactNode): boolean => {
      if (React.isValidElement(child)) {
        // Check component type
        if (
          typeof child.type === "function" &&
          child.type.displayName === "DialogTitle"
        ) {
          return true;
        }
        if (typeof child.type === "string" && child.type === "DialogTitle") {
          return true;
        }
        // Check children recursively
        if (child.props && child.props.children) {
          return React.Children.toArray(child.props.children).some(
            checkForDialogTitle,
          );
        }
      }
      return false;
    };

    return React.Children.toArray(children).some(checkForDialogTitle);
  }, [children]);
}

export default SafeDialog;
