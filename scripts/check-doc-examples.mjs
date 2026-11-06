import console from 'node:console';
import process from 'node:process';
import {setTimeout, clearTimeout} from 'node:timers';
import {stripVTControlCharacters} from 'node:util';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile, readdir, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL, URL} from 'node:url';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {javascript, commonJs, unformattedTechnicalText, terminalHtml} from './docs-example-utils.mjs';

const repository = fileURLToPath(new URL('../', import.meta.url));
const docs = path.join(repository, 'docs');
const manifest = JSON.parse(await readFile(path.join(docs, 'example-variants.json'), 'utf8'));
const require = createRequire(import.meta.url);
const tsx = pathToFileURL(require.resolve('tsx')).href;
const labels = ['TypeScript', 'JavaScript', 'MJS', 'CommonJS'];
const extensions = ['ts', 'js', 'mjs', 'cjs'];
const noFilename = code => code.replace(/^\/\/ [\w-]+\.(?:ts|js|mjs|cjs)\n/, '').trim();
const pages = [];
let groups = 0;
let programsFound = 0;

async function visit(directory) {
    for (const entry of await readdir(directory, {withFileTypes: true})) {
        if (entry.name.startsWith('.') || ['node_modules', 'public'].includes(entry.name)) {
            continue;
        }

        const filename = path.join(directory, entry.name);

        if (entry.isDirectory()) {
            await visit(filename);
        } else if (filename.endsWith('.md')) {
            pages.push(filename);
        }
    }
}

await visit(docs);

for (const filename of pages) {
    const relative = path.relative(docs, filename).replaceAll('\\', '/');
    const text = await readFile(filename, 'utf8');

    assert.deepEqual(unformattedTechnicalText(text), [], relative + ': unformatted technical text');

    assert.doesNotMatch(text, /your (?:own )?application|your computer/i, relative + ': terminology');
    assert.doesNotMatch(text, /--path\.|\.(?:mjs|cjs|js|ts)\.\//, relative + ': malformed command');
    assert.doesNotMatch(text, /Save this as `[^`]+\.mjs`/, relative + ': MJS-first setup');

    for (const match of text.matchAll(/::: code-group\n([\s\S]*?)\n:::/g)) {
        const blocks = [...match[1].matchAll(/```(\w+) \[([^\]]+)\]\n([\s\S]*?)```/g)];

        if (!blocks.some(block => labels.includes(block[2]))) {
            continue;
        }

        assert.deepEqual(blocks.map(block => block[2]), labels, relative + ': language order');
        groups++;

        if (blocks[0][1] === 'sh') {
            if (relative === 'guide/examples.md') {
                assert.ok(blocks[0][3].includes('npm pkg set type=module'), relative + ': TypeScript ESM setup');
            }

            continue;
        }

        const source = blocks[0][3].trim();
        const program = manifest.programs.find(item => item.page === relative && source.startsWith('// ' + item.name + '.ts\n'));
        const esm = javascript(source);
        const expected = [source, esm, esm, commonJs(noFilename(esm), Boolean(program))];

        for (const [index, block] of blocks.entries()) {
            const parsed = ts.createSourceFile('snippet.' + (index ? 'js' : 'ts'), block[3], ts.ScriptTarget.Latest, true);

            assert.equal(parsed.parseDiagnostics.length, 0, relative + ': syntax ' + block[2]);
            assert.equal(noFilename(block[3]), noFilename(expected[index]), relative + ': formatting ' + block[2]);

            if (!program) {
                continue;
            }

            const asset = program.name + '.' + extensions[index];

            assert.equal(noFilename(await readFile(path.join(docs, 'public/examples', asset), 'utf8')), noFilename(block[3]), asset + ': downloadable source differs');

            const command = (index ? 'node ' : 'npx tsx ') + asset + (program.args ? ' ' + program.args : '');

            assert.ok(text.includes(command), asset + ': matching run command');
        }

        if (program) {
            programsFound++;
        }
    }

    const outside = text.replace(/::: code-group\n[\s\S]*?\n:::/g, '');

    if (!['reference/types.md'].includes(relative)) {
        assert.doesNotMatch(outside, /```(?:ts|js|javascript)\n/, relative + ': executable snippet lacks language tabs');
    }
}

assert.equal(programsFound, manifest.programs.length);
console.log('Audited ' + pages.length + ' pages and ' + groups + ' synchronized language groups.');

const options = {
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    strict: true,
    skipLibCheck: false,
    noEmit: true,
    types: ['node'],
    typeRoots: [path.join(repository, 'node_modules/@types')],
};
const typeFiles = manifest.assets.filter(asset => asset.filename.endsWith('.ts')).map(asset => path.join(docs, 'public/examples', asset.filename));
const diagnostics = ts.getPreEmitDiagnostics(ts.createProgram(typeFiles, options));

assert.equal(diagnostics.length, 0, ts.formatDiagnosticsWithColorAndContext(diagnostics, {getCanonicalFileName: file => file, getCurrentDirectory: () => repository, getNewLine: () => '\n'}));
console.log(typeFiles.length + ' complete TypeScript programs: strict type checking PASS.');

async function run(filename, directory, args, environment, expectedCode = 0, expectedError = '') {
    const child = spawn(process.execPath, [...(filename.endsWith('.ts') ? ['--import', tsx] : []), filename, ...args], {
        cwd: directory,
        windowsHide: true,
        env: {...process.env, ...environment},
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    let errors = '';
    const timer = setTimeout(() => child.kill(), 30000);

    child.stdout.on('data', chunk => {
        output += chunk;
    });
    child.stderr.on('data', chunk => {
        errors += chunk;
    });

    try {
        const code = await new Promise((resolve, reject) => {
            child.on('error', reject);
            child.on('close', resolve);
        });

        assert.equal(code, expectedCode, filename + '\n' + output + errors);

        if (expectedError) {
            assert.equal(errors.replaceAll('\r\n', '\n').trim(), expectedError);
        }

        return output.replaceAll('\r\n', '\n').trim();
    } finally {
        clearTimeout(timer);
    }
}

const checkRoot = path.join(docs, '.local-dev/example-checks');

await mkdir(checkRoot, {recursive: true});
await writeFile(path.join(checkRoot, 'package.json'), JSON.stringify({private: true, type: 'module'}));

const hashes = new Map();

for (const fixture of manifest.fixtures) {
    const source = typeof fixture === 'string' ? fixture : fixture.source;
    const target = typeof fixture === 'string' ? fixture : fixture.target;
    const filename = path.join(checkRoot, target);
    const contents = await readFile(path.join(docs, 'public/examples/fixtures', source));

    await mkdir(path.dirname(filename), {recursive: true});
    await writeFile(filename, contents);
    hashes.set(filename, createHash('sha256').update(contents).digest('hex'));
}

for (const asset of manifest.assets) {
    const program = manifest.programs.find(item => item.name === asset.name);
    const filename = path.join(checkRoot, asset.filename);

    await writeFile(filename, await readFile(path.join(docs, 'public/examples', asset.filename)));

    const actual = await run(filename, checkRoot, program.args ? program.args.split(' ') : [], {FORCE_COLOR: '0'});

    assert.equal(actual, program.output.trim(), asset.filename + ': captured output differs');
    console.log(asset.filename + ': runtime/output PASS');
}

function normalize(value) {
    const result = value.replaceAll(JSON.stringify(checkRoot).slice(1, -1), '<fixture-directory>')
        .replaceAll(checkRoot, '<fixture-directory>')
        .replaceAll(checkRoot.replaceAll(path.sep, '/'), '<fixture-directory>');

    try {
        const parsed = JSON.parse(result);

        if (parsed.schemaVersion === 1 && parsed.command) {
            function visit(node) {
                if (!node || typeof node !== 'object') {
                    return;
                }

                for (const [key, value] of Object.entries(node)) {
                    if (key === 'platform' && typeof value === 'string') {
                        node[key] = '<platform>';
                    } else if (typeof value === 'string' && value.startsWith('<fixture-directory>')) {
                        node[key] = value.replaceAll(String.fromCharCode(92), '/');
                    } else {
                        visit(value);
                    }
                }
            }

            visit(parsed);

            return JSON.stringify(parsed, null, 2);
        }
    } catch {
        // Human output and scalar query results are compared without JSON projection.
    }

    return result.replace(/<fixture-directory>[^\n]*/g, part => part.replaceAll(String.fromCharCode(92), '/'));
}

const prose = (await Promise.all(pages.map(filename => readFile(filename, 'utf8')))).join('\n');

for (const test of manifest.cliCases) {
    // Capture streams separately so failing commands cannot pass as successful JSON output.
    const environment = {...process.env, FORCE_COLOR: test.colored ? '1' : '0'};

    delete environment.NO_COLOR;

    const child = spawn(process.execPath, [path.join(repository, test.bin), ...test.args], {
        cwd: checkRoot,
        windowsHide: true,
        env: environment,
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => child.kill(), 30000);

    child.stdout.on('data', chunk => {
 stdout += chunk;
});
    child.stderr.on('data', chunk => {
 stderr += chunk;
});

    try {
        const code = await new Promise((resolve, reject) => {
            child.on('error', reject);
            child.on('close', resolve);
        });

        assert.equal(code, test.code, test.heading + ': exit code');
        assert.equal(normalize(stdout.replaceAll('\r\n', '\n').trim()), test.stdout, test.heading + ': stdout');
        assert.equal(normalize(stderr.replaceAll('\r\n', '\n').trim()), test.stderr, test.heading + ': stderr');
        assert.ok(prose.includes(test.command + ' ' + test.args.join(' ')), test.heading + ': displayed command');

        if (test.colored) {
            assert.ok(test.stdout.includes(String.fromCharCode(27) + '['), test.heading + ': expected ANSI colours');
            assert.ok(prose.includes(terminalHtml(test.stdout)), test.heading + ': displayed colours/output');
            assert.ok(stripVTControlCharacters(test.stdout).length > 0);
        } else if (test.stdout) {
            assert.ok(prose.includes(test.stdout), test.heading + ': displayed stdout');
        }

        if (test.stderr) {
            assert.ok(prose.includes(test.stderr), test.heading + ': displayed stderr');
        }
    } finally {
        clearTimeout(timer);
    }
}

for (const [filename, hash] of hashes) {
    assert.equal(createHash('sha256').update(await readFile(filename)).digest('hex'), hash, 'Preview/query changed native fixture: ' + filename);
}

console.log(manifest.assets.length + ' program variants and ' + manifest.cliCases.length + ' CLI cases passed; native fixture bytes unchanged.');
