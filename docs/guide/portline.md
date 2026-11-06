# Normalized profiles and writing

The optional Portline bridge projects global/project deployments and standalone SSH configurations into shared profile records. The original [jsbrains SDK quick start](/api/quick-start) remains the starting point for IDE-specific reads.

## Install and read profiles

```sh
npm install @jalsoedesign/jsbrains-portline
```

The bridge requires Node.js 22.22.2 or newer. Save the [synthetic configuration files](/guide/fixtures) and follow [language setup](/guide/examples). The configuration directory is on the host.

::: code-group

```ts [TypeScript]
// read-profiles.ts
import {JetBrainsProfileSource} from '@jalsoedesign/jsbrains-portline';

const source = await JetBrainsProfileSource.open({configPath: process.argv[2] ?? './PhpStorm2026.2'});

const profiles = source.list();
const selected = source.get('global/deployments/demo');

if (!selected) {
    throw new Error('The demo profile is missing');
}

console.log('Profiles: ' + profiles.length);
console.log('Selected: ' + selected.path);

for (const connection of selected.connections) {
    console.log(connection.id + ': ' + connection.protocol + ' ' + connection.endpoint.host + ':' + connection.endpoint.port);
}

console.log('Host matches: ' + source.search('127.0.0.1', {fields: 'all'}).length);
console.log('Metadata only: no server connection.');
```

```js [JavaScript]
// read-profiles.js
import {JetBrainsProfileSource} from '@jalsoedesign/jsbrains-portline';

const source = await JetBrainsProfileSource.open({configPath: process.argv[2] ?? './PhpStorm2026.2'});

const profiles = source.list();
const selected = source.get('global/deployments/demo');

if (!selected) {
    throw new Error('The demo profile is missing');
}

console.log('Profiles: ' + profiles.length);
console.log('Selected: ' + selected.path);

for (const connection of selected.connections) {
    console.log(connection.id + ': ' + connection.protocol + ' ' + connection.endpoint.host + ':' + connection.endpoint.port);
}

console.log('Host matches: ' + source.search('127.0.0.1', {fields: 'all'}).length);
console.log('Metadata only: no server connection.');
```

```js [MJS]
// read-profiles.mjs
import {JetBrainsProfileSource} from '@jalsoedesign/jsbrains-portline';

const source = await JetBrainsProfileSource.open({configPath: process.argv[2] ?? './PhpStorm2026.2'});

const profiles = source.list();
const selected = source.get('global/deployments/demo');

if (!selected) {
    throw new Error('The demo profile is missing');
}

console.log('Profiles: ' + profiles.length);
console.log('Selected: ' + selected.path);

for (const connection of selected.connections) {
    console.log(connection.id + ': ' + connection.protocol + ' ' + connection.endpoint.host + ':' + connection.endpoint.port);
}

console.log('Host matches: ' + source.search('127.0.0.1', {fields: 'all'}).length);
console.log('Metadata only: no server connection.');
```

```js [CommonJS]
// read-profiles.cjs
async function main() {
    const {JetBrainsProfileSource} = await import('@jalsoedesign/jsbrains-portline');

    const source = await JetBrainsProfileSource.open({configPath: process.argv[2] ?? './PhpStorm2026.2'});

    const profiles = source.list();
    const selected = source.get('global/deployments/demo');

    if (!selected) {
        throw new Error('The demo profile is missing');
    }

    console.log('Profiles: ' + profiles.length);
    console.log('Selected: ' + selected.path);

    for (const connection of selected.connections) {
        console.log(connection.id + ': ' + connection.protocol + ' ' + connection.endpoint.host + ':' + connection.endpoint.port);
    }

    console.log('Host matches: ' + source.search('127.0.0.1', {fields: 'all'}).length);
    console.log('Metadata only: no server connection.');
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
npx tsx read-profiles.ts
```

```sh [JavaScript]
node read-profiles.js
```

```sh [MJS]
node read-profiles.mjs
```

```sh [CommonJS]
node read-profiles.cjs
```

:::

### Output

```text
Profiles: 2
Selected: global/deployments/demo
connection: sftp 127.0.0.1:22
Host matches: 2
Metadata only: no server connection.
```

Download: <a href="/examples/read-profiles.ts" download="read-profiles.ts">TypeScript</a> · <a href="/examples/read-profiles.js" download="read-profiles.js">JavaScript</a> · <a href="/examples/read-profiles.mjs" download="read-profiles.mjs">MJS</a> · <a href="/examples/read-profiles.cjs" download="read-profiles.cjs">CommonJS</a>

Canonical paths distinguish scope and record type: `global/deployments/demo` identifies a deployment, while `global/ssh/demo-ssh` identifies a standalone SSH configuration. They are not filesystem paths.

## Preview and apply

Use the separate [writer preview example](/guide/writing). The `jsbrains-profiles` command owns normalized query and guarded writing commands; the original `jsbrains` command remains read-only.

`createJetBrainsWriter` supports explicit global/project destination policies. Previewing never writes settings; apply rechecks source revision, IDE process state and locks. Project writes require explicit scope and project path. No writer creates/deletes Password Safe entries or copies stored passwords, key contents or host trust policy. Deployment mappings require separate native handling.

## Snapshots and execution

Reopen the source to refresh settings. Normalized profiles do not establish an SSH/SFTP session or automatically execute hop relationships. Native recovery backups can contain sensitive original settings even though sync does not copy credential values.

See [write safeguards and recovery](https://h2ooooooo.github.io/portline/integration/native-writing) and [connecting a selected profile](/api/integration).
