# jsbrains

A Node.js and TypeScript library for reading JetBrains IDE configuration installations, projects, settings, deployments, and saved credentials without an IDE plugin.

`jsbrains` is a read-only library. It does not upload files, connect to deployment servers, or modify IDE settings. An installation represents one product configuration/version, not an IDE executable.

## Installation

Requires Node.js 20 or newer. This package lives in an npm-workspaces monorepo alongside `@jalsoedesign/jsbrains-cli`. Run repository commands below from the monorepo root. Publication is separate from local development.

```sh
npm install
npm run check
npm pack --workspace @jalsoedesign/jsbrains
# In a consuming project, use the tarball filename printed above:
npm install "/path/to/package.tgz"
```

After publication, the intended installation command is `npm install @jalsoedesign/jsbrains`.

## Quick start

```ts
import {JetBrains} from '@jalsoedesign/jsbrains';

const jetBrains = await JetBrains.detect();
const phpStorm = await jetBrains.getInstallation({
   product: 'PhpStorm',
   latest: true
});

if (phpStorm) {
   const project = await phpStorm.getProject(process.cwd());
   const deployments = await project.deployments.getAll();

   for (const deployment of deployments) {
      console.log(deployment.name, deployment.host, deployment.mappings);
   }
}
```

CommonJS consumers can use `const {JetBrains} = require('@jalsoedesign/jsbrains');`.

## IDE discovery

```ts
const installations = await jetBrains.getInstallations();
const custom = await JetBrains.fromConfigPath('C:/custom/PhpStorm');
```

Detection inspects the normal Windows AppData, macOS Library, and Linux XDG configuration locations. It requires an `options` directory and preserves unknown product names. Versions are sorted numerically, so `2026.10` follows `2026.2`. Cache-only directories are excluded.

For custom `idea.config.path` locations, provide `configPaths` to `detect()` or use `fromConfigPath()`. The library does not search IDE executables, parse arbitrary launch arguments, or discover every custom `idea.properties` file. `systemPath` is the matching standard cache directory when present.

`detect({platform, homePath, env})` can override discovery inputs for tests and imported configurations. OS-specific credential operations still require the actual owning OS/user.

## Projects and settings

```ts
import {JetBrains, JetBrainsProject} from '@jalsoedesign/jsbrains';

const current = await JetBrains.findProject({from: process.cwd()});
const standalone = new JetBrainsProject({path: '<project-directory>'});
const recent = await phpStorm.getRecentProjects();

const entries = await standalone.settings.listFiles(); // Names and paths without reading contents
const files = await standalone.settings.getFiles(); // Contents and parsed XML
const workspace = await standalone.settings.read('workspace.xml');
const xml = await standalone.settings.readXml('deployment.xml');
const servers = await phpStorm.settings.read('webServers.xml');
```

`findProject()` walks upward until it finds `.idea` or reaches the filesystem root. Missing recent projects remain in the results. A recent project's metadata is available as `project.recent`, including its recorded name, `exists` snapshot, and optional `lastOpened`. `await project.exists()` checks the current filesystem.

Settings filenames are single filenames, relative to `.idea` or the installation's `options` folder. Traversal and symlinks escaping those folders are rejected. Missing files return `null`. `listFiles()` returns sorted `filename`, absolute `path`, and `exists` metadata without reading or parsing file contents; subdirectories and symlinks are excluded. `exists` reflects the directory listing snapshot. `getFiles()` returns file contents and parses XML, so a malformed XML file is reported rather than silently omitted.

Settings results contain `filename`, absolute `path`, `exists`, `raw`, and, for XML, `parsed`. XML attributes use the `@_` prefix; values remain strings, repeated elements become arrays. DTD/entity declarations are rejected. Errors include the file and parser location without copying XML content into the message.

## Deployments

```ts
const project = await phpStorm.getProject('<project-directory>');
const deployments = await project.deployments.getAll();
const production = await project.deployments.get('Production');
const byId = await project.deployments.getById('server-id');
const global = await phpStorm.getGlobalDeployments();
const state = await project.deployments.getProjectState();
```

Project and global deployments are included by default when installation context exists. Use `{includeProject: false}` or `{includeGlobal: false}` to filter. Duplicate names and IDs across scopes remain separate results; `get()` and `getById()` return the first match, with project entries first.

Each deployment exposes protocol, host, numeric port, username, root path, web URL, authentication metadata, mappings, visibility, source paths, and diagnostics. `getRaw()` explicitly returns original parsed server, mapping, and SSH configuration nodes, including unknown fields. Advanced transfer options and exclusions remain available there.

Project mappings are associated by server ID when present, otherwise by exact name. All matching mapping entries are preserved. `$PROJECT_DIR$`, `$USER_HOME$`, and `$APPLICATION_CONFIG_DIR$` are expanded where their context is available, in both mappings and private-key paths. Installation-bound deployments use the installation configuration path and the supplied `homePath` (or the current user home when omitted). Unresolved mapping macros remain intact and are reported on the mapping.

Shared SSH references are resolved by exact ID. Project references prefer project SSH settings, then global settings. Global servers use global SSH settings. Missing references produce diagnostics. OpenSSH config usage alone does not imply agent authentication. The library does not read private-key contents or execute OpenSSH configuration commands.

Default deployment names/IDs are exposed when present. Unverified auto-upload values remain `autoUpload: 'unknown'` with `rawAutoUpload`; the library does not guess their meaning.

## Credentials

Credential retrieval is lazy. Listing deployments never opens the KeePass database.

```ts
const production = await project.deployments.get('Production');

if (production) {
   const result = await production.credentials.resolve();

   if (result.status === 'available') {
      // Pass result.credentials directly to your deployment client.
      // Do not log credentials or persist them without an explicit user decision.
   }
}
```

`await production.getCredentials()` is a convenience returning credentials or `null`. The richer resolver distinguishes `available`, `not-stored`, `master-password-required`, `pgp-required`, `locked`, `unsupported`, `unavailable`, and `no-installation-context`.

Password, private-key passphrase, and OpenSSH authentication have separate credential shapes. OpenSSH results delegate authentication to the consuming application; the library does not extract an agent's keys.

When automatic recovery is unavailable, the caller can supply a password callback:

```ts
const jetBrains = await JetBrains.detect({
   passwordSafe: {
      masterPassword: async context => {
         return myApplication.askForMasterPassword(context.databasePath);
      }
   }
});
```

Return `null` to cancel. There are no built-in terminal prompts. Advanced integrations may provide a `PasswordSafeProvider` or `KeePassMasterKeyResolver`. `installation.passwordSafe.getCredential({serviceName, username})` supports an explicit exact identifier for integrations that know their own JetBrains subsystem.

Use `installation.passwordSafe.getCredentials(requests)` for exact-identifier batches, or `installation.passwordSafe.resolveDeployments(deployments)` for deployment batches. Results preserve input order, including missing or unsupported credentials. A batch unlocks KeePass once, prompts at most once, and disposes of its database state before returning. Empty batches and deployments that need no stored secret do not unlock Password Safe. Custom providers may implement the optional `getCredentials` method; otherwise the library calls `getCredential` serially. The CLI uses the scoped batch API for multiple deployments.

A custom `KeePassMasterKeyResolver` retains ownership of the `Uint8Array` it returns. The library copies these bytes before use and clears its own mutable copies, leaving caller-owned buffers unchanged. Integrations remain responsible for clearing their own key buffers when they are no longer needed.

## Password Safe limitations

Automatic recovery supports the researched JetBrains `c.pwd` format with `CRYPT_32` (Windows DPAPI plus the JetBrains AES wrapper) and `BUILT_IN` encryption, plus legacy `pdb.pwd`. PGP-protected bootstrap keys require an explicit master password callback. The master-key file remains in the installation's configuration directory even if `c.kdbx` lives elsewhere.

KDBX3 and KDBX4 are read using `kdbxweb`. Argon2d and Argon2id version 1.3 are supported with bounded resource settings. Unknown formats or unsupported KDF parameters return a status. The library does not cache unlocked databases between single lookups or batches. Within one batch, the unlocked database is shared only until its results have been resolved.

Automatic deployment credential identity generation currently implements the public `RemoteCredentialsHolder` SFTP password/passphrase convention. FTP, FTPS, WebDAV, and unverified proprietary credential-key variants return `unsupported`; metadata remains readable. A shared SSH configuration may use a different credential identity in an IDE/plugin version, in which case the exact lookup can return `not-stored`. No fuzzy search is performed.

See [compatibility research](docs/COMPATIBILITY.md) for source revisions, fixture provenance, and test coverage. Credential tests use synthetic databases and bootstrap fixtures; they do not establish compatibility with every real IDE/plugin credential identity.

## Platform support of the original library

| Feature | Windows | macOS | Linux |
|---|---|---|---|
| Discover standard IDE configs | Tested locally and with fixtures | Layout fixtures on Windows | Layout fixtures on Windows |
| Read settings, recent projects, deployments | Fixture tested | Portable implementation, native run pending | Portable implementation, native run pending |
| KeePass with supplied master password | Generated KDBX3/4 tests | Portable implementation, native run pending | Portable implementation, native run pending |
| Automatic Windows DPAPI recovery | Generated DPAPI + AES + KDBX test | N/A | N/A |
| Built-in bootstrap recovery | Generated fixtures | Native run pending | Native run pending |
| Native Keychain / Secret Service | N/A | Not implemented | Not implemented |
| Write settings or credentials through this package | Not implemented | Not implemented | Not implemented |

The separate jsbrains-portline package supports selected guarded settings writes on Windows. It does not write Password Safe entries. Its runtime and safeguards differ from this original read-only library; see the [Portline guide](https://h2ooooooo.github.io/jsbrains/guide/portline).

## Security

`jsbrains` can access saved deployment credentials when executed as the same local user who owns them. This is intentional functionality. Applications must treat returned credentials as sensitive. Password Safe may require OS/user access equivalent to the IDE user; custom master passwords may require caller interaction.

KeePass reads reject AES-KDF work above 10,000,000 rounds in KDBX3 and KDBX4, and headers above 1 MiB, before decryption. These resource limits return `unsupported`; malformed headers return `locked`. Argon2 reads retain their separate memory and iteration limits.

The library does not log secrets, persist extracted credentials, write configuration, or modify the database. Ordinary installation/project/deployment serialization excludes internal password-store state and raw source data. Returned password/passphrase objects also redact those fields during JSON serialization and Node object inspection. Explicit field access still returns the secret; copying or spreading these objects does not preserve the redaction hooks. Generic settings and `getRaw()` are deliberate access to source configuration and may contain sensitive values, so do not log them indiscriminately.

Mutable bootstrap buffers are cleared where practical. JavaScript strings and dependency-managed memory cannot be reliably erased; no secure-memory guarantee is made.

## Development

Run these commands from the monorepo root. `dev` and `inspect` now use the companion CLI; library examples remain available through `tsx`.

```sh
npm run dev          # Watch and run the sanitized local inspector
npm run inspect      # Run the inspector once
npm test             # Fixture tests, including generated fake KeePass files
npm run test:watch
npm run lint
npm run typecheck
npm run build        # ESM, CommonJS, declarations, and source maps
npm run check        # All required checks
npm run test:package # Install a tarball in isolation and test ESM/CommonJS credential reads
```

Examples live in `packages/jsbrains/examples/` and can be run using `npx tsx packages/jsbrains/examples/list-installations.ts`.

Local integration checks require explicit environment opt-in. They report counts and statuses only. In PowerShell:

```powershell
$env:JSBRAINS_TEST_REAL_INSTALLATION = '1'
npm run test:local
# Separately opt in before reading actual saved credentials:
$env:JSBRAINS_TEST_CREDENTIALS = '1'
npm run test:local
```

Ordinary tests use temporary directories and fake secrets. They never copy or open a user's live `c.kdbx`. On Windows, one test protects a generated fake main key with the current user's DPAPI and reads it back.

## License and trademarks

MIT. See [LICENSE](LICENSE).

jsbrains is an independent project and is not affiliated with, endorsed by, or sponsored by JetBrains s.r.o. JetBrains and JetBrains product names are trademarks of their respective owner.

## Optional connection execution

For an explicit remote operation, use the native `@jalsoedesign/jsbrains-portline` adapter with the separate shared `@jalsoedesign/portline-dockline` integration. The original SDK stays read-only and supports Node 20; the normalized adapter and execution integration require Node 22.22.2 or newer. See [complete source selection, trust and session examples](https://h2ooooooo.github.io/jsbrains/api/integration). Install the protocol client for the requested capability; reader/CLI metadata use remains free of transport dependencies.
