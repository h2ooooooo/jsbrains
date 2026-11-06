import {defineConfig} from 'tsup';

export default defineConfig({
   entry: ['src/index.ts'],
   format: ['esm', 'cjs'],
   dts: true,
   sourcemap: true,
   clean: true,
   target: 'node20',
   platform: 'node',
   esbuildOptions(options, context) {
      if (context.format === 'esm') {
         options.banner = {js: "import {createRequire} from 'node:module'; const require = createRequire(import.meta.url);"};
      }
   }
});
