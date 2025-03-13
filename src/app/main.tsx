import "@/styles/global.scss";
import "@/styles/index.css";

import initViewOptimizer from "./lib/utils/initViewOptimizer";
import initAppServices from "./services/initAppServices";
import initAppRoot from "./services/initAppRoot";
import initApplicationRequirements from "./services/initApplicationRequirements ";

/**
 * Main application initialization sequence
 * Organizes initialization steps to optimize loading performance
 */
(async () => {
  try {
    initApplicationRequirements();

    await initAppServices();

    initViewOptimizer();
    initAppRoot();
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
