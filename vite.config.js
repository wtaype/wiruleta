import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isGitHubPages = process.env.GITHUB_PAGES === 'true' || mode === 'github' || process.env.NODE_ENV === 'production';
  const base = isGitHubPages ? '/wiruleta/' : '/';
  return {
    base,
    build: {
      outDir: 'dist',
      minify: 'esbuild',
      sourcemap: false,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        }
      }
    },
    publicDir: 'public'
  };
});