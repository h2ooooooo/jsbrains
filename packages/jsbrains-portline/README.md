# jsbrains-portline

JetBrains profiles and guarded settings integration for Portline. Requires Node 22.22.2 or newer; the original jsbrains library and CLI retain Node 20 support.

The adapter reads deployments, SSH configurations and credential references. The jsbrains-profiles executable provides sources, source, search, list, get, write, sync, apply and write-status. Use --config for a selected IDE configuration and --project for project settings. Discovery does not guess among ambiguous installations.

Read operations do not change settings. Write/sync create redacted previews; apply is explicit and rechecks revisions, IDE processes and lock markers. Keep the IDE closed throughout apply. Built-in apply requires Windows and retains protected backups. Password Safe entries, stored secrets, key contents and host trust policies are not copied.

[Writing safeguards](https://github.com/h2ooooooo/portline/blob/main/docs/profile-writing.md) · [Development](https://github.com/h2ooooooo/portline/blob/main/docs/development.md) · [Ecosystem directory](https://h2ooooooo.github.io/portline/ecosystem).

## Shared connection execution

JetBrains supplies native settings and normalized Portline connection definitions. Install the optional
`@jalsoedesign/portline-dockline` integration and the Dockline client for the operation you need:
`dockline-ftp-client` for FTP/FTPS, `dockline-sftp-client` for file transfers over SSH, or
`dockline-ssh-client` for SSH commands. The reader itself has no transport dependency.

Use the same shared bridge with any Portline source. Resolve only the selected connection's credentials;
configure host verification explicitly at runtime, or supply supported saved fingerprint metadata.
Listing profiles does not resolve credentials or connect. Saved tunnels remain explicit connection references;
the bridge refuses routes it cannot execute rather than bypassing them.

Native connection options that cannot be faithfully represented are exposed in `unsupportedOptions`.
The shared bridge refuses those definitions before connecting. Native settings remain available through the
reader; a metadata projection is not permission to ignore saved proxy, authentication or trust requirements.

After building the reader, run `npm run demo:execution` with the shared bridge installed to check a synthetic
native profile through the real configuration mapper. This smoke example opens no network connections and
checks that unsupported native settings are refused. It never prints resolved credentials.

For a real scoped session, select your saved profile and provide its password (when needed) and an independently
verified SSH host-key fingerprint through the environment. Install the matching Dockline client first.

```js
import {JetBrainsProfileSource} from '@jalsoedesign/jsbrains-portline';
import {createDocklineBridge} from '@jalsoedesign/portline-dockline';

const source = await JetBrainsProfileSource.open({configPath: '/path/to/PhpStorm2026.2'});
const bridge = createDocklineBridge({source});

await bridge.withFiles('global/deployments/site-id', async remote => {
    for await (const entry of remote.list('.')) {
        console.log(entry.path);
    }
}, {password: process.env.REMOTE_PASSWORD, hostFingerprint: process.env.SSH_HOST_KEY_SHA256});
```

The scope closes the connection after the callback, including on failure.

Relative private-key paths without a documented base directory require an explicit runtime `privateKeyPath`.
Unresolved native path macros are refused; the bridge never guesses a key path from the process working directory.

For complete source selection, language variants, runtime options and native-only refusal rules, use the
[connection execution guide](https://h2ooooooo.github.io/jsbrains/api/integration). SSH fingerprints must use
canonical SHA256 base64; trust callbacks never persist approval. The reader CLI gains no network commands.
