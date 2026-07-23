import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // <movable-el> is a native custom element from lit-movable, not a Vue component.
          isCustomElement: (tag) => tag === 'movable-el',
        },
      },
    }),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'VMovable',
      fileName: 'v-movable',
    },
    rollupOptions: {
      // Consumers bring their own Vue and lit-movable (peer / direct deps).
      external: ['vue', 'lit-movable', /^lit(\/|$)/],
      output: {
        exports: 'named',
        globals: {
          vue: 'Vue',
        },
      },
    },
  },
});
