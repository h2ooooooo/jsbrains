import assert from 'node:assert/strict';
import console from 'node:console';
import {createRequire} from 'node:module';
import {fileURLToPath, URL} from 'node:url';
import {build} from 'esbuild';

const require = createRequire(import.meta.url);
const manifest = require('kdbxweb/package.json');

assert.equal(manifest.version, '2.1.1', 'Review the KDBX source/compression boundary before changing its version');

const result = await build({
   absWorkingDir: fileURLToPath(new URL('../', import.meta.url)),
   entryPoints: [require.resolve('kdbxweb/lib/index.ts')],
   outfile: fileURLToPath(new URL('../packages/jsbrains/src/password-safe/kdbx-source.generated.cjs', import.meta.url)),
   bundle: true,
   format: 'cjs',
   platform: 'node',
   target: 'node20',
   packages: 'external',
   sourcemap: true,
   metafile: true,
   alias: {
      fflate: fileURLToPath(new URL('../packages/jsbrains/src/password-safe/keepassCompression.ts', import.meta.url))
   },
   logLevel: 'silent'
});

const inputs = Object.keys(result.metafile.inputs).map(filename => filename.replaceAll('\\', '/'));

assert.ok(inputs.some(filename => filename.endsWith('/kdbxweb/lib/index.ts')), 'Pinned KDBX source entry missing');
assert.ok(inputs.some(filename => filename.endsWith('/keepassCompression.ts')), 'Native compression adapter missing');
assert.ok(!inputs.some(filename => /(?:fflate|kdbxweb\/dist)\//.test(filename)), 'Prebuilt ZIP source included');

console.log('Generated the pinned KDBX source runtime using native gzip/gunzip.');
