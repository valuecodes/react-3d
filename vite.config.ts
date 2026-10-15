import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

/**
 * Cloudflare Web Analytics, only in a build given `VITE_CF_BEACON_TOKEN` (a
 * Workers Builds build variable). The token is public, it ships in the page, but
 * keeping it out of the repository keeps forks, previews and local builds from
 * reporting into the production site. Without it the page has no beacon.
 */
const cloudflareBeacon = (): Plugin => {
  let token = "";
  return {
    name: "cloudflare-beacon",
    apply: "build",
    configResolved: (config) => {
      // `config.env` holds the `VITE_` variables from the environment and `.env` files.
      const value: unknown = config.env.VITE_CF_BEACON_TOKEN;
      token = typeof value === "string" ? value : "";
    },
    transformIndexHtml: () => {
      if (token === "") {
        return [];
      }
      if (!/^[0-9a-f]{32}$/.test(token)) {
        throw new Error("VITE_CF_BEACON_TOKEN must be 32 lowercase hex digits");
      }
      // A classic deferred script, as in Cloudflare's snippet: the beacon reads
      // `data-cf-beacon` from `document.currentScript`, which is null in a module.
      return [
        {
          tag: "script",
          attrs: {
            defer: true,
            src: "https://static.cloudflareinsights.com/beacon.min.js",
            "data-cf-beacon": JSON.stringify({ token }),
          },
          injectTo: "head",
        },
      ];
    },
  };
};

export default defineConfig({
  plugins: [react(), tailwindcss(), cloudflareBeacon()],
  server: { port: 3000 },
  preview: { port: 3000 },
  build: { outDir: "dist" },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
