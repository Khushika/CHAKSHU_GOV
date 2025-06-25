import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface AccessibleDialogContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogContent> {
  title?: string;
  hideTitle?: boolean;
}

/**
 * AccessibleDialogContent automatically ensures DialogTitle is present
 * to prevent accessibility violations
 */
export const AccessibleDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogContent>,
  AccessibleDialogContentProps
>(({ children, title = "Dialog", hideTitle = false, ...props }, ref) => {
  // Check if children already contains a DialogTitle or DialogHeader
  const hasDialogTitle = React.Children.toArray(children).some((child) => {
    if (!React.isValidElement(child)) return false;

    // Check if it's a DialogTitle
    if (child.type === DialogTitle) return true;

    // Check if it's a DialogHeader containing DialogTitle
    if (child.props?.children) {
      const headerChildren = React.Children.toArray(child.props.children);
      return headerChildren.some(
        (headerChild) =>
          React.isValidElement(headerChild) && headerChild.type === DialogTitle,
      );
    }

    return false;
  });

  return (
    <DialogContent ref={ref} {...props}>
      {!hasDialogTitle && (
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden>
      )}
      {children}
    </DialogContent>
  );
});

AccessibleDialogContent.displayName = "AccessibleDialogContent";

export default AccessibleDialogContent;
