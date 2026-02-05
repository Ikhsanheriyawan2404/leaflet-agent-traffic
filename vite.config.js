import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/main.js"),
      name: "AgentTraffic",
      fileName: (format) => `leaflet-agent-traffic.${format}.js`,
      formats: ["es", "umd"],
    },
    rollupOptions: {
      external: ["leaflet"],
      output: {
        exports: "default",
        globals: {
          leaflet: "L",
        },
      },
    },
  },
});
