import tailwind from "@tailwindcss/postcss";
import react from "@vitejs/plugin-react";
import autoprefixer from "autoprefixer";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwind(), autoprefixer()],
    },
  },
});
