# Preview, review and apply

Read operations and previews do not change settings. Apply is a separate explicit operation with revision, application/lock checks and recovery backups.

## Run a preview safely

Install `@jalsoedesign/jsbrains-portline`, follow [language setup](/guide/examples) and save the [synthetic settings](/guide/fixtures). This program plans a new profile in those files but deliberately does not apply the plan. Source and destination profile paths identify saved records, not server directories.

::: code-group

```ts [TypeScript]
// preview-profile.ts
import {JetBrainsProfileSource, createJetBrainsWriter} from '@jalsoedesign/jsbrains-portline';

const source = await JetBrainsProfileSource.open({configPath: process.argv[2] ?? './PhpStorm2026.2'});
const selected = source.get('global/deployments/demo');

if (!selected) {
    throw new Error('The demo profile is missing');
}

// Plan a new saved profile in the same synthetic settings; do not apply it.
const targetPath = 'global/deployments/imported';
const writer = createJetBrainsWriter(source.source, {mode: 'create'});
const preview = await writer.plan([{
    ...selected,
    path: targetPath,
    name: 'Imported',
}]);

console.log('Source profile: ' + selected.path);
console.log('Destination profile: ' + targetPath);
console.log('Planned operations: ' + preview.changes.map(change => change.operation).join(', '));
console.log('Native settings written: no');
```

```js [JavaScript]
// preview-profile.js
import {JetBrainsProfileSource, createJetBrainsWriter} from '@jalsoedesign/jsbrains-portline';

const source = await JetBrainsProfileSource.open({configPath: process.argv[2] ?? './PhpStorm2026.2'});
const selected = source.get('global/deployments/demo');

if (!selected) {
    throw new Error('The demo profile is missing');
}

// Plan a new saved profile in the same synthetic settings; do not apply it.
const targetPath = 'global/deployments/imported';
const writer = createJetBrainsWriter(source.source, {mode: 'create'});
const preview = await writer.plan([{
    ...selected,
    path: targetPath,
    name: 'Imported',
}]);

console.log('Source profile: ' + selected.path);
console.log('Destination profile: ' + targetPath);
console.log('Planned operations: ' + preview.changes.map(change => change.operation).join(', '));
console.log('Native settings written: no');
```

```js [MJS]
// preview-profile.mjs
import {JetBrainsProfileSource, createJetBrainsWriter} from '@jalsoedesign/jsbrains-portline';

const source = await JetBrainsProfileSource.open({configPath: process.argv[2] ?? './PhpStorm2026.2'});
const selected = source.get('global/deployments/demo');

if (!selected) {
    throw new Error('The demo profile is missing');
}

// Plan a new saved profile in the same synthetic settings; do not apply it.
const targetPath = 'global/deployments/imported';
const writer = createJetBrainsWriter(source.source, {mode: 'create'});
const preview = await writer.plan([{
    ...selected,
    path: targetPath,
    name: 'Imported',
}]);

console.log('Source profile: ' + selected.path);
console.log('Destination profile: ' + targetPath);
console.log('Planned operations: ' + preview.changes.map(change => change.operation).join(', '));
console.log('Native settings written: no');
```

```js [CommonJS]
// preview-profile.cjs
async function main() {
    const {JetBrainsProfileSource, createJetBrainsWriter} = await import('@jalsoedesign/jsbrains-portline');

    const source = await JetBrainsProfileSource.open({configPath: process.argv[2] ?? './PhpStorm2026.2'});
    const selected = source.get('global/deployments/demo');

    if (!selected) {
        throw new Error('The demo profile is missing');
    }

    // Plan a new saved profile in the same synthetic settings; do not apply it.
    const targetPath = 'global/deployments/imported';
    const writer = createJetBrainsWriter(source.source, {mode: 'create'});
    const preview = await writer.plan([{
        ...selected,
        path: targetPath,
        name: 'Imported',
    }]);

    console.log('Source profile: ' + selected.path);
    console.log('Destination profile: ' + targetPath);
    console.log('Planned operations: ' + preview.changes.map(change => change.operation).join(', '));
    console.log('Native settings written: no');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
```

:::

### Run it

::: code-group

```sh [TypeScript]
npx tsx preview-profile.ts
```

```sh [JavaScript]
node preview-profile.js
```

```sh [MJS]
node preview-profile.mjs
```

```sh [CommonJS]
node preview-profile.cjs
```

:::

### Output

```text
Source profile: global/deployments/demo
Destination profile: global/deployments/imported
Planned operations: create
Native settings written: no
```

Download: <a href="/examples/preview-profile.ts" download="preview-profile.ts">TypeScript</a> · <a href="/examples/preview-profile.js" download="preview-profile.js">JavaScript</a> · <a href="/examples/preview-profile.mjs" download="preview-profile.mjs">MJS</a> · <a href="/examples/preview-profile.cjs" download="preview-profile.cjs">CommonJS</a>

The printed operations are stable; detailed inspection and diagnostics can vary with platform and application availability. Preview output contains sanitized intent rather than stored credentials or native settings bytes.

## Apply only after review

The following recipe continues the program above. Review the full preview first, close the application and other settings writers, and keep the same destination and policies. Applying changes is Windows-only with the built-in backend; this step is not part of the runnable preview test.

::: code-group

```ts [TypeScript]
await writer.apply(preview);

console.log(writer.backupPaths);
```

```js [JavaScript]
await writer.apply(preview);

console.log(writer.backupPaths);
```

```js [MJS]
await writer.apply(preview);

console.log(writer.backupPaths);
```

```js [CommonJS]
await writer.apply(preview);

console.log(writer.backupPaths);
```

:::

The default mode is `create`. Existing paths are refused; updates/upserts require an explicit mode used consistently for preview and apply. Changed settings or edited serialized previews require replanning. See [CLI write commands](/cli/writing) for saved preview files and [writer contracts](/reference/api) for importing a serialized plan.

## One-way sync

Use `jsbrains-profiles sync` with an explicitly selected source adapter and destination scope. Install the source adapter alongside the destination CLI. Multiple connections require explicit selection, and required SSH hops stay attached. Sync does not prune unrelated profiles or copy credentials.

Built-in apply is Windows-only. It refuses busy/unknown IDE and lock state, stale revisions and edited plans. Read [native writing and recovery](https://h2ooooooo.github.io/portline/integration/native-writing) before applying.
