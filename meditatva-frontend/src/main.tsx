import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Ensure root element exists and has proper styling
const rootElement = document.getElementById("root");
if (rootElement) {
  // Add fallback background color immediately
  rootElement.style.minHeight = "100vh";
  rootElement.style.width = "100%";
  
  createRoot(rootElement).render(<App />);
} else {
  console.error("Root element not found");
}

