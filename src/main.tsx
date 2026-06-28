if (import.meta.env.DEV && import.meta.env.VITE_ENABLE_REACT_DEVTOOLS === "1") {
  void import("react-grab");
  void import("react-scan");
}

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ExperienceReferencePage, getExperienceReferenceConfig } from "./SkbpResponsivePage";
import "./styles.css";

const rootElement = document.getElementById("root");
const experienceReferenceConfig = getExperienceReferenceConfig(window.location.pathname, window.location.hash);

if (rootElement === null) {
  throw new Error("React root element was not found.");
}

createRoot(rootElement).render(
  <StrictMode>
    {experienceReferenceConfig === null ? <App /> : <ExperienceReferencePage config={experienceReferenceConfig} />}
  </StrictMode>,
);
