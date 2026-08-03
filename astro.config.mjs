// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE_URL } from './src/config/site.mjs';

// Static output — no adapter and no serverless runtime. This keeps the site
// fully static, fast, and SEO-friendly, which is exactly what Pinterest-driven
// mobile traffic needs.
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      // Only include indexable, canonical pages. Exclude working/preview
      // surfaces and the noindex utility pages so the sitemap never disagrees
      // with a page's robots meta.
      filter: (page) => {
        const noindex = ['/preview/', '/pins/', '/search/'];
        if (noindex.some((p) => page.includes(p))) return false;
        // Drop the bare redirect root (keep the real feature pages).
        if (new URL(page).pathname === '/') return false;
        return !page.includes('/_');
      },
    }),
  ],
});
