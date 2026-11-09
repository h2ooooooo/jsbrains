# Connect a selected profile

jsbrains reads native settings. The optional shared `@jalsoedesign/portline-dockline` package turns a supported selected definition into a scoped Dockline connection. The reader stays transport-free; listing or searching never opens a socket or resolves secret values.

## Install the execution packages

Use Node.js 22.22.2 or newer for the normalized adapter and shared bridge. Install the reader, the shared bridge and the client needed for this example:

```sh
npm install @jalsoedesign/jsbrains-portline @jalsoedesign/portline-dockline @jalsoedesign/dockline-sftp-client
```

| Requested operation | Optional client |
| --- | --- |
| FTP, explicit FTPS or implicit FTPS file operations | `@jalsoedesign/dockline-ftp-client` |
| SFTP file operations on an SSH endpoint | `@jalsoedesign/dockline-sftp-client` |
| SSH command sessions | `@jalsoedesign/dockline-ssh-client` |

The native IDE adapter supplies FTP/FTPS/SFTP deployment definitions and standalone SSH definitions; choose a supported saved endpoint and explicitly request the corresponding shared operation.

The shared bridge does not automatically install clients. A missing client produces `ProfileExecutionError` with code `MISSING_HANDLER` and an installation command. Reader imports and metadata queries need none of these protocol clients.

## Open the native source and connect

`JETBRAINS_CONFIG` selects the exact IDE configuration directory; `JETBRAINS_PROJECT` optionally selects a project. `PROFILE_PATH` is an exact normalized path such as global/deployments/site-id or global/ssh/ssh-id. Scope/type paths identify saved records, not host filesystem paths.

Set `SSH_HOST_KEY_SHA256` to an independently verified canonical fingerprint for SSH/SFTP: `SHA256:` followed by 43 base64 characters, with no padding. A malformed pin is rejected before connecting. FTPS uses TLS certificate verification rather than an SSH host-key pin; plain FTP has no TLS verification. The saved FTP TLS mode is preserved. Install the FTP client only when selecting a supported FTP definition.

The program lists directory entries through `withFiles` and writes no remote files. Source creation, profile selection and connection cleanup are included:

::: code-group

```ts [TypeScript]
// connect-profile.ts
function required(name: string): string {
    const value = process.env[name];

    if (!value) {
        throw new Error('Set ' + name);
    }

    return value;
}

async function main(): Promise<void> {
    const nativeSettings = required('JETBRAINS_CONFIG');
    const profilePath = required('PROFILE_PATH');

    const {JetBrainsProfileSource} = await import('@jalsoedesign/jsbrains-portline');
    const {createDocklineBridge} = await import('@jalsoedesign/portline-dockline');
    const source = await JetBrainsProfileSource.open({configPath: nativeSettings, projectPath: process.env.JETBRAINS_PROJECT});
    const bridge = createDocklineBridge({source});
    const tls = process.env.FTP_TLS_MODE;

    if (tls && !['none', 'explicit', 'implicit'].includes(tls)) {
        throw new Error('FTP_TLS_MODE must be none, explicit or implicit');
    }

    await bridge.withFiles(profilePath, async remote => {
        for await (const entry of remote.list('.')) {
            console.log(entry.path);
        }
    }, {
        connectionId: 'connection',
        hostFingerprint: process.env.SSH_HOST_KEY_SHA256,
        password: process.env.REMOTE_PASSWORD,
        passphrase: process.env.KEY_PASSPHRASE,
        privateKeyPath: process.env.PRIVATE_KEY_PATH,
        agent: process.env.SSH_AGENT,
        timeoutMs: 30000,
        ...(tls ? {tls: tls as 'none' | 'explicit' | 'implicit'} : {}),
    });
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : 'Connection failed');
    process.exitCode = 1;
});
```

```js [JavaScript]
// connect-profile.ts
function required(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error('Set ' + name);
    }

    return value;
}

async function main() {
    const nativeSettings = required('JETBRAINS_CONFIG');
    const profilePath = required('PROFILE_PATH');

    const {JetBrainsProfileSource} = await import('@jalsoedesign/jsbrains-portline');
    const {createDocklineBridge} = await import('@jalsoedesign/portline-dockline');
    const source = await JetBrainsProfileSource.open({configPath: nativeSettings, projectPath: process.env.JETBRAINS_PROJECT});
    const bridge = createDocklineBridge({source});
    const tls = process.env.FTP_TLS_MODE;

    if (tls && !['none', 'explicit', 'implicit'].includes(tls)) {
        throw new Error('FTP_TLS_MODE must be none, explicit or implicit');
    }

    await bridge.withFiles(profilePath, async remote => {
        for await (const entry of remote.list('.')) {
            console.log(entry.path);
        }
    }, {
        connectionId: 'connection',
        hostFingerprint: process.env.SSH_HOST_KEY_SHA256,
        password: process.env.REMOTE_PASSWORD,
        passphrase: process.env.KEY_PASSPHRASE,
        privateKeyPath: process.env.PRIVATE_KEY_PATH,
        agent: process.env.SSH_AGENT,
        timeoutMs: 30000,
        ...(tls ? {tls: tls } : {}),
    });
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : 'Connection failed');
    process.exitCode = 1;
});
```

```js [MJS]
// connect-profile.ts
function required(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error('Set ' + name);
    }

    return value;
}

async function main() {
    const nativeSettings = required('JETBRAINS_CONFIG');
    const profilePath = required('PROFILE_PATH');

    const {JetBrainsProfileSource} = await import('@jalsoedesign/jsbrains-portline');
    const {createDocklineBridge} = await import('@jalsoedesign/portline-dockline');
    const source = await JetBrainsProfileSource.open({configPath: nativeSettings, projectPath: process.env.JETBRAINS_PROJECT});
    const bridge = createDocklineBridge({source});
    const tls = process.env.FTP_TLS_MODE;

    if (tls && !['none', 'explicit', 'implicit'].includes(tls)) {
        throw new Error('FTP_TLS_MODE must be none, explicit or implicit');
    }

    await bridge.withFiles(profilePath, async remote => {
        for await (const entry of remote.list('.')) {
            console.log(entry.path);
        }
    }, {
        connectionId: 'connection',
        hostFingerprint: process.env.SSH_HOST_KEY_SHA256,
        password: process.env.REMOTE_PASSWORD,
        passphrase: process.env.KEY_PASSPHRASE,
        privateKeyPath: process.env.PRIVATE_KEY_PATH,
        agent: process.env.SSH_AGENT,
        timeoutMs: 30000,
        ...(tls ? {tls: tls } : {}),
    });
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : 'Connection failed');
    process.exitCode = 1;
});
```

```js [CommonJS]
function required(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error('Set ' + name);
    }

    return value;
}

async function main() {
    const nativeSettings = required('JETBRAINS_CONFIG');
    const profilePath = required('PROFILE_PATH');

    const {JetBrainsProfileSource} = await import('@jalsoedesign/jsbrains-portline');
    const {createDocklineBridge} = await import('@jalsoedesign/portline-dockline');
    const source = await JetBrainsProfileSource.open({configPath: nativeSettings, projectPath: process.env.JETBRAINS_PROJECT});
    const bridge = createDocklineBridge({source});
    const tls = process.env.FTP_TLS_MODE;

    if (tls && !['none', 'explicit', 'implicit'].includes(tls)) {
        throw new Error('FTP_TLS_MODE must be none, explicit or implicit');
    }

    await bridge.withFiles(profilePath, async remote => {
        for await (const entry of remote.list('.')) {
            console.log(entry.path);
        }
    }, {
        connectionId: 'connection',
        hostFingerprint: process.env.SSH_HOST_KEY_SHA256,
        password: process.env.REMOTE_PASSWORD,
        passphrase: process.env.KEY_PASSPHRASE,
        privateKeyPath: process.env.PRIVATE_KEY_PATH,
        agent: process.env.SSH_AGENT,
        timeoutMs: 30000,
        ...(tls ? {tls: tls } : {}),
    });
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : 'Connection failed');
    process.exitCode = 1;
});
```

:::

Download <a href="/examples/connect-profile.ts" download="connect-profile.ts"><code>connect-profile.ts</code></a>, <a href="/examples/connect-profile.js" download="connect-profile.js"><code>connect-profile.js</code></a>, <a href="/examples/connect-profile.mjs" download="connect-profile.mjs"><code>connect-profile.mjs</code></a> or <a href="/examples/connect-profile.cjs" download="connect-profile.cjs"><code>connect-profile.cjs</code></a>. Save the corresponding file, configure the required environment values, and run it using the matching command below:

```sh
npx tsx connect-profile.ts
node connect-profile.js
node connect-profile.mjs
node connect-profile.cjs
```

For TypeScript, install `tsx`, `typescript` and `@types/node` as development dependencies. The JavaScript/MJS/CommonJS variants use dynamic imports inside an asynchronous entry point and run directly on the required Node version.

These commands deliberately connect to the selected saved endpoint. Output depends on that server; directory entries and command output are not fixed fixture transcripts. Streams and iterators must be consumed inside the callback. The scope disconnects after completion or failure. Configuration objects from `toConfig` or `toSshConfig` may contain secrets; do not print them.

## Environment inputs

| Variable | Meaning |
| --- | --- |
| `JETBRAINS_CONFIG`, `JETBRAINS_PROJECT` | Required exact IDE configuration directory and optional project directory. |
| `PROFILE_PATH` | Required exact returned profile path. |
| `SSH_HOST_KEY_SHA256` | Independently verified canonical host-key fingerprint for SSH/SFTP. |
| `REMOTE_PASSWORD`, `KEY_PASSPHRASE` | Optional runtime authentication overrides; otherwise use supported selected source lookup. |
| `PRIVATE_KEY_PATH`, `SSH_AGENT` | Optional explicit private-key path or SSH agent identifier/socket. |
| `FTP_TLS_MODE` | Optional `none`, `explicit` or `implicit` choice; required for ambiguous saved FTP TLS, and cannot change a required native TLS mode. |


## Shared API and runtime options

| API | Behavior |
| --- | --- |
| `createDocklineBridge({source})` | Use the source for exact-path lookup and selected credential resolution. |
| `withFiles(profileOrPath, callback, options?)` | Open FTP/FTPS or explicitly request SFTP on a saved SSH/SFTP endpoint; close the session after the callback. |
| `withSsh(profileOrPath, callback, options?)` | Explicitly request SSH commands on a saved SSH/SFTP endpoint; close the session after the callback. |
| `toConfig(profileOrPath, options?)` | Resolve transfer configuration without opening a socket. |
| `toSshConfig(profileOrPath, options?)` | Resolve SSH configuration without opening a socket. |
| `createFileAdapter(profileOrPath, options?)` | Return a disconnected Dockline transfer adapter; the caller owns its lifecycle. |

Use an exact profile path returned by `source.list()` or `source.search()`. Pass `connectionId` when several compatible definitions exist; selecting the wrong capability is refused. An SFTP endpoint may permit SSH commands, and an SSH endpoint may permit SFTP, but the server decides what is available. An FTP or database definition never supplies an inferred SSH endpoint.

| Runtime option | Purpose |
| --- | --- |
| `password`, `passphrase`, `privateKeyPath`, `agent` | Explicit selected authentication overrides; absent values allow supported source credential lookup. |
| `promptPassword` | Caller-provided asynchronous password/passphrase input for prompt-based saved authentication. |
| `keyboardInteractive` | Explicit SSH keyboard-interactive response string or handler; distinct from a password prompt. |
| `hostFingerprint` | Canonical SHA256 pin for this selected endpoint. |
| `trust(challenge)` | Alternative explicit host-verification callback, supplied per operation or at bridge construction. |
| `tls` | Intentional `none`, `explicit` or `implicit` choice when a saved FTP TLS mode is ambiguous. |
| `secureOptions`, `filenameEncoding` | Supported TLS certificate and filename-encoding configuration. |
| `timeoutMs`, `readyTimeout`, `abortSignal` | Client deadlines, SSH readiness and cancellation; choose the per-command timeout in SSH `exec` options. |

Stored password/key-passphrase references are resolved only for the selected execution or configuration request. A custom `credentials` provider can be supplied to `createDocklineBridge`. Missing or locked secrets remain explicit outcomes; the bridge does not unlock native stores or invent passwords. In-memory private-key overrides are supported for SFTP; SSH command sessions currently require a key path.

Supported saved fingerprint arrays can supply pins. If a runtime pin and saved pins are both present, both requirements apply. A trust callback must return a positive decision; the bridge never persists approvals or imports a native host-key cache automatically. A relative saved key path without a documented base can be replaced with an explicit runtime `privateKeyPath`. A native macro or policy listed in `unsupportedOptions` must instead be corrected or resolved in the source definition; runtime options cannot bypass that blocker.

## Native limits and errors

`@jalsoedesign/jsbrains-portline` is the native IDE profile adapter; `@jalsoedesign/portline-dockline` is the shared execution integration. SFTP and standalone SSH definitions reuse resolved native SSH references and supported Password Safe lookup. Saved useOpenSSHConfig dependencies, unknown authentication, unresolved private-key macros and unimplemented advanced options are refused through `unsupportedOptions`. The current FTPS projection does not establish explicit versus implicit TLS; supply an intentional runtime `tls` choice. Required TLS is never silently downgraded.

The bridge refuses nonempty `unsupportedOptions`, error diagnostics, unsupported authentication and unimplemented `via` routes before opening a connection. Passing a runtime trust callback does not bypass a native execution blocker. Required FTP TLS cannot be changed to another mode or downgraded. No shared API runs saved native command strings or arbitrary ProxyCommand programs.

`ProfileExecutionError.code` distinguishes `PROFILE_NOT_FOUND`, `CONNECTION_SELECTION_REQUIRED`, `UNSUPPORTED_PROFILE`, `MISSING_CREDENTIAL`, `MISSING_TRUST`, `MISSING_HANDLER` and `INVALID_PROFILE`. Transport failures remain Dockline errors. See the [shared execution reference](https://h2ooooooo.github.io/portline/integration/execution) and [Dockline operations](https://h2ooooooo.github.io/dockline/api/) for the shared contracts and protocol behavior.

## Check mapping without a server

From the built repository with the shared integration installed, run:

```sh
npm run demo:execution
```

The [synthetic configuration smoke example](https://github.com/h2ooooooo/jsbrains/blob/main/examples/test-execution.mjs) constructs native settings, prepares them through the real shared mapper and verifies unsupported-option refusal. It opens no sockets, reads no installed application settings and prints no resolved credentials. The separate [metadata fixture demo](/guide/local-demo) still exercises reader/CLI queries without connecting.

## Default interactive host approval

When neither a fingerprint nor a trust callback is configured, the shared bridge asks for SSH/SFTP host approval if both standard input and standard error are interactive terminals. It displays the endpoint and server fingerprint; only an explicit `yes` accepts a new host. Matching approvals are reused for that bridge instance. A changed approved key requires the distinct response `replace`. Approval is session-only and is never written to disk. Explicit pins and configured providers retain priority, and a pin mismatch never falls back to a prompt.

Redirected input, pipelines and unattended jobs do not prompt: configure a fingerprint or trust provider. Browser/server applications supply their own approval callback. The downloadable programs use explicit pins to remain reproducible in unattended checks; interactive callers may omit them.
