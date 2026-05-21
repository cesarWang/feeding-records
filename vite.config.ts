import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import Inspector from 'unplugin-vue-dev-locator/vite';
import Components from 'unplugin-vue-components/vite';
import { VantResolver } from 'unplugin-vue-components/resolvers';

import { cloudflare } from "@cloudflare/vite-plugin";

// https://vite.dev/config/
export default defineConfig({
  build: {
    sourcemap: 'hidden',
  },
  plugins: [vue(), Components({
    resolvers: [VantResolver()],
  }), Inspector(), cloudflare()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ✅ 定义 @ = src
    },
  },
});