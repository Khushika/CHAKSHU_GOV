/**
 * Dialog Accessibility Checker
 * Development tool to detect dialogs missing DialogTitle
 */

let isCheckerInitialized = false;

export function initializeDialogAccessibilityChecker() {
  if (process.env.NODE_ENV !== "development" || isCheckerInitialized) {
    return;
  }

  console.log("🔍 Dialog Accessibility Checker initialized");

  // Override console.warn to catch Radix UI warnings
  const originalWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args.join(" ");

    if (message.includes("DialogContent") && message.includes("DialogTitle")) {
      console.error("🚨 DIALOG ACCESSIBILITY ISSUE DETECTED 🚨");
      console.error("Message:", message);
      console.error("Stack trace:");
      console.trace();

      // Try to find the problematic dialog in the DOM
      setTimeout(() => {
        const dialogs = document.querySelectorAll('[role="dialog"]');
        dialogs.forEach((dialog, index) => {
          const hasTitle =
            dialog.querySelector('[role="heading"]') ||
            dialog.querySelector("h1, h2, h3, h4, h5, h6") ||
            dialog.querySelector("[data-radix-dialog-title]");

          if (!hasTitle) {
            console.error(`🎯 Found problematic dialog #${index + 1}:`, dialog);
            console.error(
              "Dialog HTML:",
              dialog.outerHTML.substring(0, 200) + "...",
            );
          }
        });
      }, 100);
    }

    // Call original warn
    originalWarn.apply(console, args);
  };

  // Monitor for new dialogs being added to the DOM
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;

          // Check if this is a dialog or contains dialogs
          const dialogs = element.matches('[role="dialog"]')
            ? [element]
            : Array.from(element.querySelectorAll('[role="dialog"]'));

          dialogs.forEach((dialog) => {
            setTimeout(() => {
              const hasTitle =
                dialog.querySelector('[role="heading"]') ||
                dialog.querySelector("h1, h2, h3, h4, h5, h6") ||
                dialog.querySelector("[data-radix-dialog-title]");

              if (!hasTitle) {
                console.error("🚨 New dialog added without title:", dialog);
                console.error(
                  "Dialog content preview:",
                  dialog.textContent?.substring(0, 100),
                );
              }
            }, 50);
          });
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  isCheckerInitialized = true;
}

export function findProblematicDialogs() {
  const dialogs = document.querySelectorAll('[role="dialog"]');
  const problematic: Element[] = [];

  dialogs.forEach((dialog) => {
    const hasTitle =
      dialog.querySelector('[role="heading"]') ||
      dialog.querySelector("h1, h2, h3, h4, h5, h6") ||
      dialog.querySelector("[data-radix-dialog-title]");

    if (!hasTitle) {
      problematic.push(dialog);
    }
  });

  return problematic;
}
