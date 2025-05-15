import "@/styles/global.scss";
import "@/styles/index.css";

import initAppServices from "./services/initAppServices";
import initAppRoot from "./services/initAppRoot";
import initApplicationRequirements from "./services/initApplicationRequirements ";

/**
 * Loads error fallback module and displays error
 */
async function loadErrorModule(error: unknown) {
  try {
    const { default: displayErrorFallback } = await import(
      "./services/displayErrorFallback"
    );
    displayErrorFallback(error, {
      showErrorDetails: true,
      supportEmail: "awe.supports@gmail.com",
      supportUrl: "https://awe.support.com",
      applicationName: "Application initialization",
      allowRestart: true,
    });
  } catch (importError) {
    console.error("Failed to load error fallback:", importError);
  }
}

/**
 * Initializes the application
 */
async function initializeApp() {
  try {
    await initAppServices();

    initApplicationRequirements();
    initAppRoot();
  } catch (error) {
    await loadErrorModule(error);
  }
}

initializeApp();
