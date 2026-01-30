import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@ckeditor/ckeditor5-core": path.resolve(
        "./node_modules/@ckeditor/ckeditor5-core",
      ),
    },
  },
  preview: {
    allowedHosts: ["*"], // <-- add your host here
  },
});
