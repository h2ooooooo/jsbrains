import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

export default defineConfig({
   resolve: {alias: {
      '@': fileURLToPath(new URL('./packages/jsbrains/src', import.meta.url)),
      '@cli': fileURLToPath(new URL('./packages/jsbrains-cli/src', import.meta.url)),
      '@jalsoedesign/jsbrains': fileURLToPath(new URL('./packages/jsbrains/src/index.ts', import.meta.url))
   }},
   test: {include: ['packages/*/tests/**/*.test.ts'], testTimeout: 30000}
});
