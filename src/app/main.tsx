import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import { enableStrict, requestMutation } from "@/lib/modules/fastdom";
import { DEBUG, STRICTERDOM_ENABLED } from "@/lib/config/dev";

import "@/styles/global.scss";
import "@/styles/index.css";
import initI18n from "./providers/i18n-provider";
import initAnimationsStore from "@/store/animations/initAnimationsStore";
import initViewOptimizer from "./lib/utils/initViewOptimizer";

// Enable strict mode if configured
// if (STRICTERDOM_ENABLED) {
//   enableStrict();
// }

/**
 * Initializes the React application by rendering it into the DOM.
 * @returns {Promise<void>}
 */
async function initApplication(): Promise<void> {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error("Root element not found");
    return;
  }

  requestMutation(() => {
    const root = createRoot(rootElement);

    root.render(
      <StrictMode>
        <App />
      </StrictMode>,
    );

    if (DEBUG) {
      console.log(">>> APPLICATION INIT COMPLETE");
    }
  });
}

(async () => {
  try {
    // Run independent initialization steps in parallel

    await initApplication();
    await Promise.all([
      initViewOptimizer(),
      initAnimationsStore(),
      initI18n(),
    ]).then((none) => {
      if (none) {
        console.log("ACTIVATED ");
      }
    });
  } catch (error) {
    console.error("Application initialization failed:", error);
    // Consider displaying an error message to the user
  }
})();
