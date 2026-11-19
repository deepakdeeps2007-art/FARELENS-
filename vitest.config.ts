import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@/core': path.resolve(__dirname, './packages/core/src'),
      '@/providers': path.resolve(__dirname, './packages/providers/src'),
      '@/db': path.resolve(__dirname, './packages/db/src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
});
