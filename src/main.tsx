import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Contributions from "./contributions/Contributions.tsx";

// Two pages, no router needed: vercel.json rewrites every path to index.html.
const path = window.location.pathname.replace(/\/+$/, "");
const Page = path === "/contributions" ? Contributions : App;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
