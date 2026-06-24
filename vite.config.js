import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/stella-explorer-ssec-uw-madison/",
  plugins: [react()],
});