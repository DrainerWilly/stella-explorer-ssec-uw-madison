import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { orbitApiPlugin } from "./server/localOrbitApi.js";

// Site root — this project is served from "/" locally and is Vercel-ready.
// (It is intentionally NOT configured for a GitHub Pages sub-path.)
export default defineConfig({
  base: "/",
  plugins: [
    react(),
    // Serves GET /api/orbits during `npm run dev` / `vite preview` using the
    // same shared orbit service the Vercel function uses. No separate backend.
    orbitApiPlugin(),
  ],
});
