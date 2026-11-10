import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  base: process.env.BASE_PATH
    ? `${process.env.BASE_PATH.replace(/\/$/, "")}/`
    : "/",
  publicDir: false,
  build: { outDir: "dist", manifest: true },
});
