import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { registerServiceWorker, requestPersistentStorage } from "./lib/registerSW";

// Register service worker for PWA functionality
if (import.meta.env.PROD) {
  registerServiceWorker();
  requestPersistentStorage();
}

createRoot(document.getElementById("root")!).render(<App />);
