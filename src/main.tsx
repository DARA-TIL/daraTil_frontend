import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/noto-sans/latin-400.css";
import "@fontsource/noto-sans/latin-500.css";
import "@fontsource/noto-sans/latin-600.css";
import "@fontsource/noto-sans/latin-700.css";
import "@fontsource/noto-sans/latin-800.css";
import "@fontsource/noto-sans/latin-900.css";
import "@fontsource/noto-sans/cyrillic-400.css";
import "@fontsource/noto-sans/cyrillic-500.css";
import "@fontsource/noto-sans/cyrillic-600.css";
import "@fontsource/noto-sans/cyrillic-700.css";
import "@fontsource/noto-sans/cyrillic-800.css";
import "@fontsource/noto-sans/cyrillic-900.css";
import "@fontsource/noto-sans/cyrillic-ext-400.css";
import "@fontsource/noto-sans/cyrillic-ext-500.css";
import "@fontsource/noto-sans/cyrillic-ext-600.css";
import "@fontsource/noto-sans/cyrillic-ext-700.css";
import "@fontsource/noto-sans/cyrillic-ext-800.css";
import "@fontsource/noto-sans/cyrillic-ext-900.css";
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
