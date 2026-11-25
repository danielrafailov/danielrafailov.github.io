// GitHub Pages serves files as-is and can't rewrite every path to index.html
// the way vercel.json does. Give each client-side route a real file, and use
// the app as the 404 page so any other path still loads it.
import { copyFileSync, mkdirSync } from "node:fs";

const ROUTES = ["contributions"];

for (const route of ROUTES) {
  mkdirSync(`dist/${route}`, { recursive: true });
  copyFileSync("dist/index.html", `dist/${route}/index.html`);
}
copyFileSync("dist/index.html", "dist/404.html");
console.log(`spa-fallback: wrote ${ROUTES.map((r) => `${r}/index.html`).join(", ")} and 404.html`);
