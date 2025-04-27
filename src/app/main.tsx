import "@/styles/global.scss";
import "@/styles/index.css";

import initViewOptimizer from "./lib/utils/initViewOptimizer";
import initAppServices from "./services/initAppServices";
import initAppRoot from "./services/initAppRoot";
import initApplicationRequirements from "./services/initApplicationRequirements ";
import { setTaskErrorHandler } from "@/lib/modules/fastdom";
import { enableStrict } from "@/lib/modules/fastdom/stricterdom";
import { DEBUG } from "@/lib/config/dev";


if(DEBUG) {
  enableStrict();
  setTaskErrorHandler((error) => console.error("Scheduler Error:", error));
}

/**
 * Main application initialization sequence
 * Organizes initialization steps to optimize loading performance
 */
(async () => {
  try {
    initAppRoot();
    initViewOptimizer();
    initApplicationRequirements();

    await initAppServices();
  } catch (error) {
    try {
      await loadErrorModule(error);
    } catch (importError) {
      console.error("Failed to load error fallback:", importError);
    }
  }
})();

async function loadErrorModule(error: unknown) {
  const module = await import("./services/displayErrorFallback");
  const displayErrorFallback = module.default;

  displayErrorFallback(error, {
    showErrorDetails: true,
    supportEmail: "awe.supports@gmail.com",
    supportUrl: "https://awe.support.com",
    applicationName: "Application initialization",
    allowRestart: true,
  });
}
