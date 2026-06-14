import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeOpenRouter } from "./lib/openrouter";

// Initialize AI service with multiple API keys for fallback
const apiKeys = [
  import.meta.env.VITE_OPENROUTER_API_KEY_1,
  import.meta.env.VITE_OPENROUTER_API_KEY_2,
  import.meta.env.VITE_OPENROUTER_API_KEY_3,
].filter(Boolean);

if (apiKeys.length > 0) {
  initializeOpenRouter(apiKeys);
  console.log(`✅ AI initialized with ${apiKeys.length} API key(s)`);
} else {
  console.warn('⚠️ No OpenRouter API keys found. AI features will be limited.');
}

createRoot(document.getElementById("root")!).render(<App />);
