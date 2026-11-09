# API quick start

Read a saved deployment with the original jsbrains SDK. The optional normalized-profile bridge has its own [quick start](/guide/portline). This example uses synthetic settings on the host and does not connect to a server.

## Install

```sh
npm install @jalsoedesign/jsbrains@rc
```

Use Node.js 20 or newer for the original SDK. Follow [language setup](/guide/examples) for TypeScript tooling and JavaScript module configuration.

## Save the fixture

Save <a href="/examples/fixtures/PhpStorm2026.2/options/webServers.xml" download="webServers.xml"><code>PhpStorm2026.2/options/webServers.xml</code></a> at the shown path.

::: details Fixture contents

```xml
<application>
    <component name="WebServers">
        <option name="servers">
            <webServer id="demo" name="Demo">
                <fileTransfer accessType="SFTP" host="127.0.0.1" port="22" username="deploy" />
            </webServer>
        </option>
    </component>
</application>
```

:::

Save <a href="/examples/fixtures/PhpStorm2026.2/options/sshConfigs.xml" download="sshConfigs.xml"><code>PhpStorm2026.2/options/sshConfigs.xml</code></a> at the shown path.

::: details Fixture contents

```xml
<application>
    <component name="SshConfigs">
        <configs>
            <sshConfig id="demo-ssh" host="127.0.0.1" port="22" username="deploy" authType="OPEN_SSH" />
        </configs>
    </component>
</application>
```

:::

Create the `PhpStorm2026.2/options` directories first.

## Read the settings

Save the selected language tab as `read-deployments.ts` or its matching variant, beside the fixture directory.

::: code-group

```ts [TypeScript]
// read-deployments.ts
import {JetBrains} from '@jalsoedesign/jsbrains';

const installation = await JetBrains.fromConfigPath(process.argv[2] ?? './PhpStorm2026.2');
const deployments = await installation.getGlobalDeployments();

console.log('Deployments: ' + deployments.length);

for (const deployment of deployments) {
    console.log(deployment.name + ': ' + deployment.type + ' ' + deployment.host + ':' + deployment.port);
}

console.log('Metadata only: no server connection or Password Safe unlock.');
```

```js [JavaScript]
// read-deployments.js
import {JetBrains} from '@jalsoedesign/jsbrains';

const installation = await JetBrains.fromConfigPath(process.argv[2] ?? './PhpStorm2026.2');
const deployments = await installation.getGlobalDeployments();

console.log('Deployments: ' + deployments.length);

for (const deployment of deployments) {
    console.log(deployment.name + ': ' + deployment.type + ' ' + deployment.host + ':' + deployment.port);
}

console.log('Metadata only: no server connection or Password Safe unlock.');
```

```js [MJS]
// read-deployments.mjs
import {JetBrains} from '@jalsoedesign/jsbrains';

const installation = await JetBrains.fromConfigPath(process.argv[2] ?? './PhpStorm2026.2');
const deployments = await installation.getGlobalDeployments();

console.log('Deployments: ' + deployments.length);

for (const deployment of deployments) {
    console.log(deployment.name + ': ' + deployment.type + ' ' + deployment.host + ':' + deployment.port);
}

console.log('Metadata only: no server connection or Password Safe unlock.');
```

```js [CommonJS]
// read-deployments.cjs
async function main() {
    const {JetBrains} = await import('@jalsoedesign/jsbrains');

    const installation = await JetBrains.fromConfigPath(process.argv[2] ?? './PhpStorm2026.2');
    const deployments = await installation.getGlobalDeployments();

    console.log('Deployments: ' + deployments.length);

    for (const deployment of deployments) {
        console.log(deployment.name + ': ' + deployment.type + ' ' + deployment.host + ':' + deployment.port);
    }

    console.log('Metadata only: no server connection or Password Safe unlock.');
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
npx tsx read-deployments.ts
```

```sh [JavaScript]
node read-deployments.js
```

```sh [MJS]
node read-deployments.mjs
```

```sh [CommonJS]
node read-deployments.cjs
```

:::

### Output

```text
Deployments: 1
Demo: sftp 127.0.0.1:22
Metadata only: no server connection or Password Safe unlock.
```

Download: <a href="/examples/read-deployments.ts" download="read-deployments.ts">TypeScript</a> · <a href="/examples/read-deployments.js" download="read-deployments.js">JavaScript</a> · <a href="/examples/read-deployments.mjs" download="read-deployments.mjs">MJS</a> · <a href="/examples/read-deployments.cjs" download="read-deployments.cjs">CommonJS</a>

## Continue by task

Read [deployments and settings](/guide/deployments), explore [discovery](/guide/discovery), or use [normalized profiles and writing](/guide/portline). Validation, unsupported settings and source lifetimes are explained in the corresponding guides and [API reference](/reference/api).
