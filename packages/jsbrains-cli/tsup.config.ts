import {defineConfig} from 'tsup';

export default defineConfig({
   entry: ['src/bin.ts'],
   format: ['esm'],
   sourcemap: true,
   clean: true,
   target: 'node20',
   platform: 'node',
   external: ['@jalsoedesign/jsbrains', 'chalk']
});
