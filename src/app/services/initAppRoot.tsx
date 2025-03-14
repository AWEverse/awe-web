import { DEBUG } from "@/lib/config/dev";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "../App";

export default function () {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  if (DEBUG) {
    console.log(">>> APPLICATION INIT COMPLETE");
  }
}
