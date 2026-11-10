import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';

const path = (file: string) => fileURLToPath(new URL(file, import.meta.url));

// The embed build: `npm run build:embed` writes dist-embed/plate-embed.js and plate-embed.css,
// for a site that loads the player on demand with a dynamic import.
export default defineConfig({
  resolve: {
    alias: { '@': path('./src') },
  },
  build: {
    outDir: path('./dist-embed'),
    emptyOutDir: true,
    cssCodeSplit: false,
    lib: {
      entry: path('./src/embed.ts'),
      formats: ['es'],
      fileName: () => 'plate-embed.js',
      cssFileName: 'plate-embed',
    },
  },
});
