import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ConversationsProvider } from "./contexts/ConversationsContext.tsx";

createRoot(document.getElementById("root")!).render(
  <ConversationsProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </ConversationsProvider>,
);
