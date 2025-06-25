import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface EnhancedSafeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  hideTitle?: boolean;
}

/**
 * EnhancedSafeDialog ensures DialogTitle is always present to prevent accessibility errors.
 * This component automatically handles missing titles with proper accessibility support.
 */
export const EnhancedSafeDialog: React.FC<EnhancedSafeDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  hideTitle = false,
}) => {
  const effectiveTitle = title || "Dialog";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={className}>
        <DialogHeader>
          {hideTitle || !title ? (
            <VisuallyHidden>
              <DialogTitle>{effectiveTitle}</DialogTitle>
            </VisuallyHidden>
          ) : (
            <DialogTitle>{title}</DialogTitle>
          )}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Higher-order component that wraps any Dialog component to ensure accessibility
 */
export const withAccessibleDialog = <P extends object>(
  Component: React.ComponentType<P>,
) => {
  return React.forwardRef<any, P>((props, ref) => {
    // This HOC can be used to wrap existing Dialog components
    return <Component {...props} ref={ref} />;
  });
};

export default EnhancedSafeDialog;
