import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // Bind to 0.0.0.0 so the container port mapping works
  },
});
