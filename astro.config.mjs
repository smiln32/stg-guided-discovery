// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { SITE_URL, BASE_PATH } from './src/config/site.mjs';

// Static output — no adapter and no serverless runtime. This keeps the site
// fully static, fast, and SEO-friendly.
export default defineConfig({
  site: SITE_URL,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      // Only include indexable, canonical pages. Exclude the noindex utility
      // pages so the sitemap never disagrees with a page's robots meta.
      filter: (page) => {
        const noindex = ['/search/'];
        if (noindex.some((p) => page.includes(p))) return false;
        const pathname = new URL(page).pathname;
        // Drop the bare redirect root (keep the real feature pages).
        if (pathname === '/') return false;
        // Guided discovery: the entry point is a real landing page, but the
        // steps inside it are noindex — they recombine content whose canonical
        // home is the permanent entry page. Keep the sitemap in agreement.
        const help = `${BASE_PATH}/help/`;
        if (pathname.startsWith(help) && pathname !== help) return false;
        return !page.includes('/_');
      },
    }),
  ],
});
