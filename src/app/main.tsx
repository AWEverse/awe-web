import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

import { enableStrict, requestMutation } from "@/lib/modules/fastdom";
import { optimizeView } from "./lib/utils/optimizeView";
import { STRICTERDOM_ENABLED } from "@/lib/config/dev";

import "@/styles/global.scss";
import "@/styles/index.css";
import initI18n from "./providers/i18n-provider";

// if (STRICTERDOM_ENABLED) {
//   enableStrict();
// }

async function init() {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    console.error("Root element not found");
    return;
  }

  requestMutation(() => {
    const root = createRoot(rootElement);
    root.render(<App />);

    optimizeView();
  });
}

init();
initI18n();
