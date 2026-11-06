import assert from 'node:assert/strict';
import console from 'node:console';
import {URL} from 'node:url';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const manifest = require('kdbxweb/package.json');

assert.equal(manifest.version, '2.1.1', 'Review the KDBX source/compression boundary before changing its version');

for (const filename of ['index.js', 'index.cjs']) {
   const url = new URL('../packages/jsbrains/dist/' + filename, import.meta.url);
   const bundle = await readFile(url, 'utf8');
   const map = JSON.parse(await readFile(new URL(url.href + '.map'), 'utf8'));
   const sources = map.sources.map(source => source.replaceAll('\\', '/'));

   assert.ok(sources.some(source => source.endsWith('/kdbxweb/lib/format/kdbx-format.ts')), filename + ': pinned KDBX format source missing');
   assert.ok(sources.some(source => source.endsWith('/keepassCompression.ts')), filename + ': native gzip adapter missing');
   assert.ok(!sources.some(source => /(?:fflate|kdbxweb\/dist)\//.test(source)), filename + ': prebuilt compression source included');
   assert.doesNotMatch(bundle, /\b(?:unzipSync|z64e)\b|(?:require\(|from\s+)["'](?:fflate|kdbxweb)["']/, filename + ': stale ZIP implementation or external KDBX runtime');
   assert.match(bundle, /["'](?:node:)?zlib["']/, filename + ': native zlib import missing');
}

console.log('Pinned KDBX source and native compression verified in ESM/CommonJS bundles.');
