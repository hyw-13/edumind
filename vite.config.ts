import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from "vite-tsconfig-paths";
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react({
      babel: {
        plugins: [
          'react-dev-locator',
        ],
      },
    }),
    tsconfigPaths(),
    {
      name: 'inline-assets-for-file',
      transformIndexHtml: {
        order: 'post',
        handler(html, ctx) {
          if (!ctx.bundle) return html;
          // 内联 CSS 到 <head>
          const cssRe = /<link rel="stylesheet" crossorigin href="([^"]+)">/g;
          html = html.replace(cssRe, (match, href) => {
            const fileName = href.replace(/^\.\//, '');
            const chunk = Object.values(ctx.bundle).find((c: any) => c.fileName === fileName);
            if (chunk && 'source' in chunk) {
              return `<style>\n${chunk.source}\n</style>`;
            }
            return match;
          });
          // 内联 JS，但放到 </body> 前并加 defer，确保 DOM 就绪
          const scriptRe = /<script type="module" crossorigin src="([^"]+)"><\/script>/g;
          let inlineScript = '';
          html = html.replace(scriptRe, (match, src) => {
            const fileName = src.replace(/^\.\//, '');
            const chunk = Object.values(ctx.bundle).find((c: any) => c.fileName === fileName);
            if (chunk && 'code' in chunk) {
              inlineScript = `<script defer>\n${chunk.code}\n</script>`;
              return '';
            }
            return match;
          });
          if (inlineScript) {
            html = html.replace(/<\/body>/, `${inlineScript}\n</body>`);
          }
          return html;
        },
      },
    },
  ],
})
