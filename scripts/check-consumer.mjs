import process from 'node:process';
import console from 'node:console';
import assert from 'node:assert/strict';
import {copyFile, mkdir, mkdtemp, readFile, writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {argument, artifactPackages} from './package-artifacts.mjs';

const repository = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const directory = await mkdtemp(path.join(tmpdir(), 'profile consumer '));
const artifacts = path.join(directory, 'artifacts');
const consumer = path.join(directory, 'consumer');
const npmCli = process.env.npm_execpath;

assert.ok(npmCli, 'Run through npm run check:consumer');
await mkdir(artifacts);
await mkdir(consumer);

function run(args, cwd) {
    const result = spawnSync(process.execPath, args, {cwd, encoding: 'utf8', windowsHide: true});

    assert.equal(result.status, 0, result.stderr || result.stdout);

    return result.stdout;
}

const output = JSON.parse(run([
    npmCli,
    'pack',
    '--workspaces',
    '--ignore-scripts',
    '--json',
    '--pack-destination',
    artifacts,
], repository));
const own = Array.isArray(output) ? output : Object.values(output);
const packages = [...own];

if (process.argv.includes('--artifacts')) {
    for (const item of await artifactPackages(argument('--artifacts'))) {
        if (own.some(candidate => candidate.name === item.name)) {
            continue;
        }

        await copyFile(item.file, path.join(artifacts, item.filename));
        packages.push(item);
    }
}

await writeFile(path.join(consumer, 'package.json'), JSON.stringify({
    private: true,
    type: 'module',
    dependencies: Object.fromEntries(packages.map(item => [item.name,
        'file:' + path.join(artifacts, item.filename).split(path.sep).join('/')])),
    devDependencies: {typescript: '6.0.3', '@types/node': '22.20.2'},
}, null, 4));
run([npmCli, 'install', '--ignore-scripts', '--no-audit', '--no-fund'], consumer);

const lock = JSON.parse(await readFile(path.join(consumer, 'package-lock.json'), 'utf8'));

assert.ok(!Object.values(lock.packages).some(item => item.link), 'Consumer must not use repository symlinks');

const declarations = [];

for (const [index, item] of own.entries()) {
    const folder = path.join(consumer, 'node_modules', item.name);
    const manifest = JSON.parse(await readFile(path.join(folder, 'package.json'), 'utf8'));

    if (manifest.exports?.['.']) {
        run(['--input-type=module', '-e', 'await import(' + JSON.stringify(item.name) + ')'], consumer);
        declarations.push('import type * as Package' + index + ' from ' + JSON.stringify(item.name) + ';',
            'declare const package' + index + ': typeof Package' + index + ';', 'void package' + index + ';');
    }

    for (const binary of Object.keys(manifest.bin ?? {})) {
        run([npmCli, 'exec', '--offline', '--no', '--', binary, '--help'], consumer);
    }
}

await writeFile(path.join(consumer, 'types.mts'), declarations.join('\n'));
run([
    'node_modules/typescript/bin/tsc',
    '--noEmit',
    '--strict',
    '--module',
    'NodeNext',
    '--moduleResolution',
    'NodeNext',
    '--target',
    'ES2022',
    '--types',
   'node',
   'types.mts',
], consumer);
console.log('Isolated packed imports, declarations and executables passed. Evidence: ' + directory);
