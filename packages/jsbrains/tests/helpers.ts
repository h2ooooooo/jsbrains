import {mkdtemp, mkdir, readFile, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {afterEach} from 'vitest';

const directories: string[] = [];

afterEach(async () => {
   for (const directory of directories.splice(0)) {
      await rm(directory, {recursive: true, force: true});
   }
});

export async function temporaryDirectory() {
   const directory = await mkdtemp(path.join(tmpdir(), 'jsbrains-test-'));
   directories.push(directory);
   return directory;
}

export async function write(directory: string, filename: string, contents: string | Uint8Array) {
   const target = path.join(directory, filename);
   await mkdir(path.dirname(target), {recursive: true});
   await writeFile(target, contents);
   return target;
}

export async function fixture(name: string) {
   return readFile(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');
}
