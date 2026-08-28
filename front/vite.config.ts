import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [
    react({
      // The React Compiler memoises components automatically, which is why
      // there is no useMemo or useCallback anywhere in this codebase.
      compiler: true,
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    // Lets the app call the API as a same-origin `/api` request in development,
    // so there is no CORS round trip and no environment-specific base URL.
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "build",
    sourcemap: true,
    rollupOptions: {
      output: {
        /**
         * three.js and MUI are large and change rarely; splitting them keeps
         * them cached across releases of the app itself.
         *
         * Written as a function rather than an object because Vite 8's Rolldown
         * bundler types `manualChunks` as a callback only.
         */
        manualChunks(id: string) {
          if (id.includes("node_modules")) {
            if (/[\\/](three|@react-three)[\\/]/.test(id)) return "three";
            if (id.includes("@mui")) return "mui";
          }
          return undefined;
        },
      },
    },
  },
});
