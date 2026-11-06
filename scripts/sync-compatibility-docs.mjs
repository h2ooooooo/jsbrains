import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import process from 'node:process';
import console from 'node:console';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'packages/jsbrains/docs/COMPATIBILITY.md');
const target = path.join(root, 'docs/COMPATIBILITY.md');
const contents = await readFile(source, 'utf8');

if (process.argv.includes('--check')) {
   assert.equal(await readFile(target, 'utf8'), contents, 'Compatibility documentation drifted; run npm run docs:compatibility');
   console.log('Published and website compatibility documentation match.');
} else {
   await writeFile(target, contents);
   console.log('Updated website compatibility documentation from the package source.');
}
