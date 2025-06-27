import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize dialog accessibility checker in development
if (process.env.NODE_ENV === "development") {
  import("./lib/dialog-accessibility-checker").then(
    ({ initializeDialogAccessibilityChecker }) => {
      initializeDialogAccessibilityChecker();
    },
  );
}

createRoot(document.getElementById("root")!).render(<App />);
