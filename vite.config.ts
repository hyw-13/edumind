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
    react(),
    tsconfigPaths(),
    {
      name: 'inline-assets-for-file',
      transformIndexHtml: {
        order: 'post',
        handler(html, ctx) {
          if (!ctx.bundle) return html;
          // 内联 CSS 到 <head>
          const cssRe = /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g;
          html = html.replace(cssRe, (match, href) => {
            const fileName = href.replace(/^\.\//, '');
            const chunk = Object.values(ctx.bundle).find((c: any) => c.fileName === fileName);
            if (chunk && 'source' in chunk) {
              return `<style>\n${chunk.source}\n</style>`;
            }
            return match;
          });
          // 内联 JS，放到 </body> 前（不 defer，inline defer 非标准且 file:// 下行为不稳定）
          const scriptRe = /<script[^>]*src="([^"]+)"[^>]*><\/script>/g;
          let inlineScript = '';
          html = html.replace(scriptRe, (match, src) => {
            const fileName = src.replace(/^\.\//, '');
            const chunk = Object.values(ctx.bundle).find((c: any) => c.fileName === fileName);
            if (chunk && 'code' in chunk) {
              // 将内联脚本中可能破坏 HTML 解析的结束标签进行转义
              const safeCode = chunk.code
                .replace(/<\/script>/gi, '<\\/script>')
                .replace(/<\/body>/gi, '<\\/body>');
              inlineScript = `<script>\n${safeCode}\n</script>`;
              return '';
            }
            return match;
          });
          if (inlineScript) {
            // 使用替换函数，避免 inlineScript 中的 $&/$`/$'/$n 被当作特殊替换模式解析
            html = html.replace(/<\/body>/, () => `${inlineScript}\n</body>`);
          }
          // 若仍有外部资源引用，构建失败以便及时发现
          const remaining = [
            ...html.matchAll(/<script[^>]*src="([^"]+)"[^>]*>/g),
            ...html.matchAll(/<link[^>]*href="(\.\/assets\/[^"]+)"[^>]*>/g),
          ];
          if (remaining.length > 0) {
            const refs = remaining.map(m => m[1]).join(', ');
            throw new Error(`[inline-assets-for-file] 仍有未内联的外部资源引用：${refs}`);
          }
          return html;
        },
      },
    },
  ],
})
