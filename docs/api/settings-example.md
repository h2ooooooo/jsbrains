# Read settings explicitly

Use the original SDK when a task needs IDE settings rather than normalized profiles. Native settings can contain sensitive data; this program prints file counts and availability only.

Install `@jalsoedesign/jsbrains`, save the [synthetic configuration](/guide/fixtures) and follow [language setup](/guide/examples).

::: code-group

```ts [TypeScript]
// inspect-settings.ts
import {JetBrains} from '@jalsoedesign/jsbrains';

const installation = await JetBrains.fromConfigPath(process.argv[2] ?? './PhpStorm2026.2');
const files = await installation.settings.listFiles();
const servers = await installation.settings.readXml('webServers.xml');

console.log('Settings files: ' + files.length);
console.log('Deployment XML found: ' + Boolean(servers));
console.log('Raw settings contents omitted from output.');
```

```js [JavaScript]
// inspect-settings.js
import {JetBrains} from '@jalsoedesign/jsbrains';

const installation = await JetBrains.fromConfigPath(process.argv[2] ?? './PhpStorm2026.2');
const files = await installation.settings.listFiles();
const servers = await installation.settings.readXml('webServers.xml');

console.log('Settings files: ' + files.length);
console.log('Deployment XML found: ' + Boolean(servers));
console.log('Raw settings contents omitted from output.');
```

```js [MJS]
// inspect-settings.mjs
import {JetBrains} from '@jalsoedesign/jsbrains';

const installation = await JetBrains.fromConfigPath(process.argv[2] ?? './PhpStorm2026.2');
const files = await installation.settings.listFiles();
const servers = await installation.settings.readXml('webServers.xml');

console.log('Settings files: ' + files.length);
console.log('Deployment XML found: ' + Boolean(servers));
console.log('Raw settings contents omitted from output.');
```

```js [CommonJS]
// inspect-settings.cjs
async function main() {
    const {JetBrains} = await import('@jalsoedesign/jsbrains');

    const installation = await JetBrains.fromConfigPath(process.argv[2] ?? './PhpStorm2026.2');
    const files = await installation.settings.listFiles();
    const servers = await installation.settings.readXml('webServers.xml');

    console.log('Settings files: ' + files.length);
    console.log('Deployment XML found: ' + Boolean(servers));
    console.log('Raw settings contents omitted from output.');
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
npx tsx inspect-settings.ts
```

```sh [JavaScript]
node inspect-settings.js
```

```sh [MJS]
node inspect-settings.mjs
```

```sh [CommonJS]
node inspect-settings.cjs
```

:::

### Output

```text
Settings files: 2
Deployment XML found: true
Raw settings contents omitted from output.
```

Download: <a href="/examples/inspect-settings.ts" download="inspect-settings.ts">TypeScript</a> · <a href="/examples/inspect-settings.js" download="inspect-settings.js">JavaScript</a> · <a href="/examples/inspect-settings.mjs" download="inspect-settings.mjs">MJS</a> · <a href="/examples/inspect-settings.cjs" download="inspect-settings.cjs">CommonJS</a>

Continue with [settings and deployments](/guide/deployments) for project scope, mappings, parsing and raw-data boundaries.
