import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import { enableStrict, requestMutation } from "@/lib/modules/fastdom";
import { STRICTERDOM_ENABLED } from "@/lib/config/dev";

import "@/styles/global.scss";
import "@/styles/index.css";
import initI18n from "./providers/i18n-provider";
import initAnimationsStore from "@/store/animations/initAnimationsStore";
import initViewOptimizer from "./lib/utils/initViewOptimizer";

// if (STRICTERDOM_ENABLED) {
//   enableStrict();
// }

async function initApplication() {
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
  });
}

initViewOptimizer();
initAnimationsStore();
initI18n();
initApplication();
