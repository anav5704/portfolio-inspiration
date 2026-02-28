import { defineConfig } from "astro/config";

import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://portfolios.anav.dev",
  output: "static",
  integrations: [sitemap()],
});
