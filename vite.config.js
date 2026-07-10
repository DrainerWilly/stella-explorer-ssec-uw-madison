import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { orbitApiPlugin } from "./server/localOrbitApi.js";


export default defineConfig({
  base: "/",
  plugins: [
    react(),
    orbitApiPlugin(),
  ],
});
