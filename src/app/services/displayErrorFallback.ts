import { version } from "../../../package.json";

/**
 * Enhanced error fallback handler for application initialization failures
 * Provides responsive, user-friendly error information and recovery options
 *
 * @param error - The error that occurred during initialization
 * @param options - Optional configuration settings
 */
export default function displayErrorFallback(
  error: unknown,
  options: {
    showErrorDetails?: boolean;
    supportEmail?: string;
    supportUrl?: string;
    applicationName?: string;
    allowRestart?: boolean;
    theme?: "light" | "dark" | "auto";
  } = {}
) {
  // Default configuration options
  const {
    showErrorDetails = process.env.NODE_ENV !== "production",
    supportEmail = "support@example.com",
    supportUrl = "/support",
    applicationName = "Application",
    allowRestart = true,
    theme = "auto"
  } = options;

  // Log the error to console for debugging
  console.error(`${applicationName} initialization failed:`, error);

  // Determine error message to display
  let errorMessage = "An unexpected error occurred.";
  let errorCode = "UNKNOWN_ERROR";

  if (error instanceof Error) {
    errorMessage = error.message;
    errorCode = error.name;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  // Collect system information for troubleshooting
  const systemInfo = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    appVersion: version || "unknown",
    url: window.location.href,
    viewportSize: `${window.innerWidth}x${window.innerHeight}`,
    connectionType: (navigator as any).connection?.effectiveType || "unknown",
    browserLanguage: navigator.language || "unknown"
  };

  // Create error information for support
  const supportInfo = JSON.stringify({
    errorCode,
    errorMessage,
    systemInfo
  }, null, 2);

  // Function to detect user's preferred color scheme
  const detectColorScheme = () => {
    if (theme === "light") return "light";
    if (theme === "dark") return "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  };

  // Set initial color scheme
  const initialColorScheme = detectColorScheme();

  // Define theme-specific color variables
  const colors = {
    light: {
      background: "#ffffff",
      text: "#333333",
      secondaryText: "#555555",
      tertiaryText: "#7f8c8d",
      errorBackground: "#f8f9fa",
      errorBorder: "#e74c3c",
      primaryButton: "#2980b9",
      primaryButtonText: "#ffffff",
      secondaryButton: "#ecf0f1",
      secondaryButtonText: "#2c3e50",
      secondaryButtonBorder: "#bdc3c7",
      link: "#2980b9",
      icon: "#e74c3c"
    },
    dark: {
      background: "#1a1a1a",
      text: "#f0f0f0",
      secondaryText: "#cccccc",
      tertiaryText: "#999999",
      errorBackground: "#2c3e50",
      errorBorder: "#e74c3c",
      primaryButton: "#3498db",
      primaryButtonText: "#ffffff",
      secondaryButton: "#34495e",
      secondaryButtonText: "#ecf0f1",
      secondaryButtonBorder: "#4a6278",
      link: "#3498db",
      icon: "#e74c3c"
    }
  };

  // Function to attempt application restart
  const attemptRestart = () => {
    localStorage.setItem("app_restart_attempt", Date.now().toString());
    window.location.reload();
  };

  // Function to copy error details to clipboard
  const copyErrorDetails = () => {
    navigator.clipboard.writeText(supportInfo)
      .then(() => {
        const copyButton = document.getElementById("copy-error-btn");
        if (copyButton) {
          const originalText = copyButton.textContent;
          copyButton.textContent = "Copied!";
          copyButton.setAttribute("aria-label", "Error details copied to clipboard");
          setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.setAttribute("aria-label", "Copy error details to clipboard");
          }, 2000);
        }
      })
      .catch(err => console.error("Failed to copy error details:", err));
  };

  // Function to toggle color scheme
  const toggleColorScheme = () => {
    const errorContainer = document.getElementById("error-container");
    if (!errorContainer) return;

    const currentScheme = errorContainer.getAttribute("data-theme");
    const newScheme = currentScheme === "light" ? "dark" : "light";
    errorContainer.setAttribute("data-theme", newScheme);

    applyColorScheme(newScheme);
  };

  // Function to apply color scheme
  const applyColorScheme = (scheme) => {
    const elements = {
      container: document.getElementById("error-container"),
      title: document.getElementById("error-title"),
      subtitle: document.getElementById("error-subtitle"),
      errorBlock: document.getElementById("error-details"),
      errorText: document.getElementById("error-text"),
      errorCode: document.getElementById("error-code"),
      restartButton: document.getElementById("restart-btn"),
      copyButton: document.getElementById("copy-error-btn"),
      footer: document.getElementById("error-footer"),
      icon: document.getElementById("error-icon"),
      links: document.querySelectorAll("#error-container a"),
      themeToggle: document.getElementById("theme-toggle")
    };

    const themeColors = colors[scheme];

    if (elements.container) {
      elements.container.style.backgroundColor = themeColors.background;
      elements.container.style.color = themeColors.text;
    }

    if (elements.subtitle) {
      elements.subtitle.style.color = themeColors.secondaryText;
    }

    if (elements.errorBlock) {
      elements.errorBlock.style.backgroundColor = themeColors.errorBackground;
      elements.errorBlock.style.borderLeftColor = themeColors.errorBorder;
    }

    if (elements.restartButton) {
      elements.restartButton.style.backgroundColor = themeColors.primaryButton;
      elements.restartButton.style.color = themeColors.primaryButtonText;
    }

    if (elements.copyButton) {
      elements.copyButton.style.backgroundColor = themeColors.secondaryButton;
      elements.copyButton.style.color = themeColors.secondaryButtonText;
      elements.copyButton.style.borderColor = themeColors.secondaryButtonBorder;
    }

    if (elements.footer) {
      elements.footer.style.color = themeColors.tertiaryText;
    }

    if (elements.icon) {
      elements.icon.style.color = themeColors.icon;
    }

    elements.links.forEach(link => {
      link.style.color = themeColors.link;
    });

    if (elements.themeToggle) {
      elements.themeToggle.innerHTML = scheme === "light"
        ? '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
        : '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>';
    }
  };

  // Determine if the error is a network error
  const isNetworkError = errorMessage.toLowerCase().includes("network") ||
    errorMessage.toLowerCase().includes("connection") ||
    errorCode === "NetworkError";

  // Create a unique error ID
  const errorId = Math.random().toString(36).substring(2, 15);

  // Create error page HTML
  document.body.innerHTML = `
    <div id="error-container" data-theme="${initialColorScheme}" style="
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      max-width: 650px;
      margin: 0 auto;
      padding: 1rem;
      text-align: center;
      line-height: 1.5;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      box-sizing: border-box;
    ">
      <header style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
          <button id="theme-toggle" aria-label="Toggle dark mode" style="
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            width: 32px;
            height: 32px;
          ">
            ${initialColorScheme === "light"
      ? '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'
      : '<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
    }
          </button>
        </div>
        <svg id="error-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto;">
          ${isNetworkError
      ? '<line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line>'
      : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
    }
        </svg>
        <h1 id="error-title" style="margin-top: 1.5rem; font-size: 1.75rem; font-weight: 600;">
          ${applicationName} Error
        </h1>
        <p id="error-subtitle" style="margin: 1rem 0; font-size: 1.1rem;">
          ${isNetworkError
      ? "We're having trouble connecting to our servers."
      : "We encountered an issue while loading the application."}
        </p>
      </header>

      <main style="flex: 1;">
        ${showErrorDetails ? `
          <div id="error-details" style="
            border-radius: 8px;
            padding: 1rem;
            margin: 1.5rem 0;
            text-align: left;
            border-left: 4px solid;
            overflow-x: auto;
          ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <p id="error-code" style="margin: 0; font-weight: 600;">Error Code: ${errorCode}</p>
            </div>
            <p id="error-text" style="margin: 0; font-family: monospace; word-break: break-word;">${errorMessage}</p>
          </div>
        ` : ''}

        <div style="margin: 1.5rem 0;">
          <h2 style="font-size: 1.2rem; margin-bottom: 1rem;">What You Can Try:</h2>
          <div style="text-align: left; padding-left: 1.5rem;">
            <ul style="list-style-position: outside; padding-left: 0; margin: 0;">
              ${isNetworkError ? `
                <li style="margin-bottom: 0.5rem;">Check your internet connection</li>
                <li style="margin-bottom: 0.5rem;">Verify that you're not behind a firewall or proxy</li>
                <li style="margin-bottom: 0.5rem;">Try connecting to a different network</li>
              ` : `
                <li style="margin-bottom: 0.5rem;">Refresh the page and try again</li>
                <li style="margin-bottom: 0.5rem;">Clear your browser cache and cookies</li>
                <li style="margin-bottom: 0.5rem;">Try using a different browser</li>
                <li style="margin-bottom: 0.5rem;">Check your internet connection</li>
              `}
              ${allowRestart ? '<li style="margin-bottom: 0.5rem;">Click the "Restart Application" button below</li>' : ''}
            </ul>
</div>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; margin: 1.5rem 0;">
          ${allowRestart ? `
            <button id="restart-btn" style="
              padding: 0.75rem 1.25rem;
              border-radius: 4px;
              font-weight: 500;
              cursor: pointer;
              border: none;
              font-size: 1rem;
              transition: opacity 0.2s;
            ">Restart Application</button>
          ` : ''}

          <button id="copy-error-btn" style="
            padding: 0.75rem 1.25rem;
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
            border: 1px solid;
            font-size: 1rem;
            transition: opacity 0.2s;
          " aria-label="Copy error details to clipboard">Copy Error Details</button>
        </div>

        <div style="margin-top: 1.5rem;">
          <p style="margin-bottom: 0.5rem;">Need assistance? Contact support:</p>
          <div style="display: flex; justify-content: center; gap: 1.5rem;">
            <a href="mailto:${supportEmail}" style="text-decoration: none;">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="display: inline-block; vertical-align: middle; margin-right: 0.5rem;">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              Email Support
            </a>
            <a href="${supportUrl}" style="text-decoration: none;">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" style="display: inline-block; vertical-align: middle; margin-right: 0.5rem;">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Help Center
            </a>
          </div>
        </div>
      </main>

      <footer id="error-footer" style="margin-top: 2rem; font-size: 0.85rem;">
        <p style="margin: 0;">
          Error ID: ${errorId} | App Version: ${systemInfo.appVersion}
        </p>
      </footer>
    </div>
  `;

  // Apply initial color scheme
  applyColorScheme(initialColorScheme);

  // Add event listeners
  const restartButton = document.getElementById("restart-btn");
  if (restartButton && allowRestart) {
    restartButton.addEventListener("click", attemptRestart);
  }

  const copyButton = document.getElementById("copy-error-btn");
  if (copyButton) {
    copyButton.addEventListener("click", copyErrorDetails);
  }

  const themeToggleButton = document.getElementById("theme-toggle");
  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", toggleColorScheme);
  }

  // Track error for analytics if available
  if (typeof window.gtag === "function") {
    window.gtag("event", "app_error", {
      error_code: errorCode,
      error_message: errorMessage,
      app_version: systemInfo.appVersion,
      error_id: errorId
    });
  }

  // Return error information for potential further handling
  return {
    errorId,
    errorCode,
    errorMessage,
    systemInfo
  };
}
