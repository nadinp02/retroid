import { defineConfig } from "vitest/config";
import { fileURLToPath } from "url";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  // @vitejs/plugin-react (basado en Babel) choca con las deps de shadcn
  // (Babel 7 vs 8-rc). La variante SWC no depende de Babel — y Next.js ya usa
  // SWC internamente, así que es consistente con el resto del proyecto.
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
});
