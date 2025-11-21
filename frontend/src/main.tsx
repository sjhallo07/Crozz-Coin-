import "@mysten/dapp-kit/dist/index.css";
import "@radix-ui/themes/styles.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SuiProviders } from "./providers/SuiProviders";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element #root not found");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <SuiProviders>
      <App />
    </SuiProviders>
  </React.StrictMode>
);
