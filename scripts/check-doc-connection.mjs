import assert from 'node:assert/strict';
import console from 'node:console';
import process from 'node:process';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath, URL} from 'node:url';
import ts from 'typescript';

const repository = fileURLToPath(new URL('../', import.meta.url));
const directory = path.join(repository, 'docs/public/examples');
const page = (await readFile(path.join(repository, 'docs/api/integration.md'), 'utf8')).replaceAll('\r\n', '\n');
const blocks = [...page.matchAll(/```(?:ts|js) \[(TypeScript|JavaScript|MJS|CommonJS)\]\n([\s\S]*?)```/g)];
const labels = ['TypeScript', 'JavaScript', 'MJS', 'CommonJS'];
const extensions = ['ts', 'js', 'mjs', 'cjs'];
const typescriptFile = path.join(directory, 'connect-profile.ts');

assert.deepEqual(blocks.map(block => block[1]), labels, 'Connection guide must provide all four source variants');

const compilerOptions = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true,
    skipLibCheck: false,
    noEmit: true,
    types: ['node'],
    typeRoots: [path.join(repository, 'node_modules/@types')],
};
const bridge = ts.resolveModuleName('@jalsoedesign/portline-dockline', typescriptFile, compilerOptions, ts.sys);

if (bridge.resolvedModule) {
    const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram([typescriptFile], compilerOptions));

    assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: file => file,
        getCurrentDirectory: () => repository,
        getNewLine: () => '\n',
    }));
    console.log('Shared connection program: strict TypeScript against installed bridge PASS.');
} else {
    console.log('Optional shared bridge is not installed; connection-program type check requires the documented integration packages.');
}

for (const [index, extension] of extensions.entries()) {
    const filename = path.join(directory, 'connect-profile.' + extension);
    const source = (await readFile(filename, 'utf8')).replaceAll('\r\n', '\n');
    const parsed = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true,
        extension === 'ts' ? ts.ScriptKind.TS : ts.ScriptKind.JS);

    assert.equal(parsed.parseDiagnostics.length, 0, 'Connection source syntax: ' + extension);
    assert.equal(source.trim(), blocks[index][2].trim(), 'Downloadable connection source differs: ' + extension);

    const result = spawnSync(process.execPath, [
        ...(extension === 'ts' ? ['--experimental-strip-types'] : []),
        filename,
    ], {
        cwd: repository,
        encoding: 'utf8',
        windowsHide: true,
        timeout: 30000,
        env: {...process.env, NATIVE_SETTINGS: '', JETBRAINS_CONFIG: '', PROFILE_PATH: '', SSH_HOST_KEY_SHA256: ''},
    });

    assert.equal(result.status, 1, 'Missing explicit connection input must fail before source reads or network access');
    assert.equal(result.stdout, '');
    assert.match(result.stderr, source.includes("required('JETBRAINS_CONFIG')") ? /Set JETBRAINS_CONFIG/ : /Set NATIVE_SETTINGS/);
}

console.log('Four connection-program downloads, syntax and explicit-input runtime guards PASS; no network connection attempted.');
