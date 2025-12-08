import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/app/App";
import "@/styles/global.css";
import "@/shared/config/i18n/i18n";
import { ColorModeProvider } from "./shared/theme/ColorModeContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ColorModeProvider>
      <App />
    </ColorModeProvider>
  </React.StrictMode>
);
