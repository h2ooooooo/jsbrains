**[Read the documentation](https://h2ooooooo.github.io/jsbrains/)**

# jsbrains

Read JetBrains IDE projects, settings, deployments, and saved credentials without an IDE plugin.

This npm-workspaces monorepo contains four MIT-licensed packages:

| Package | Purpose |
|---|---|
| [@jalsoedesign/jsbrains](packages/jsbrains) | Node.js/TypeScript library, ESM and CommonJS |
| [@jalsoedesign/jsbrains-cli](packages/jsbrains-cli) | The `jsbrains` command, with Chalk formatting and a versioned JSON interface |
| [@jalsoedesign/jsbrains-portline](packages/jsbrains-portline) | Normalized profiles and a guarded native settings writer factory |
| [@jalsoedesign/jsbrains-portline-cli](packages/jsbrains-portline-cli) | The `jsbrains-profiles` query, discovery and preview/sync/apply command |

The original library and CLI require Node.js 20 or newer. Both are read-only: they do not upload files, log in to servers, or change IDE settings.

## Run locally

Use Node 22.22.2 or newer when installing/building all four workspaces. Node 20 support applies to the original library and CLI packages.

From this repository:

```sh
npm install
npm run build
npm run cli -- --help
npm run cli -- installations
npm run cli -- deployments --product PhpStorm
npm run cli -- deployments --product PhpStorm --json
```

Use `npm run dev -- deployments --product PhpStorm` for a watcher that reruns as source changes. After building, the installed workspace binary also works:

```sh
npm exec --no -- jsbrains --help
npm exec --no -- jsbrains deployments --product PhpStorm --json
```

For clean JSON in scripts, use the binary, `node packages/jsbrains-cli/dist/bin.js ... --json`, or `npm run --silent cli -- ... --json`. Ordinary `npm run` adds npm's own script headings before the command output.

## Test deployments and password retrieval

First find the IDE and deployment name:

```sh
npm run cli -- installations
npm run cli -- deployments --product PhpStorm --project "<project-directory>"
```

Then request a credential test:

```sh
npm run cli -- credentials "Production" --product PhpStorm --project "<project-directory>" --scope project
npm run --silent cli -- credentials "Production" --product PhpStorm --project "<project-directory>" --scope project --json
```

`available` with `secretRetrieved: true` confirms a password or key passphrase was actually read from local storage. The value is hidden by default. OpenSSH can be available with `secretRetrieved: false`, because authentication is delegated to an agent/configuration. This does not test remote login.

Use `credentials --all` to test every selected deployment, or `deployments --credentials` for statuses alongside deployment metadata. Use `--config "C:/path/to/PhpStorm2026.2"` to choose an exact IDE configuration directory, including when testing an older database.

```sh
npm run --silent cli -- credentials --all --product PhpStorm --project "<project-directory>" --json
```

The credential command exits with code `3` when any selected credential is unavailable. Its JSON still appears on stdout and explains each status. `not-stored` can indicate a missing credential or an unverified plugin identifier variant. `master-password-required` and `locked` indicate that the store needs another unlocking method. Other protocol credential identifiers and native macOS/Linux stores remain unsupported.

Explicitly exporting a secret requires `--show-secrets`:

```sh
npm run --silent cli -- credentials "Production" --product PhpStorm --project "<project-directory>" --scope project --show-secrets --json
```

This deliberately writes the secret to command output. Master-password fallback supports `--master-password-stdin` or `--master-password-env VARIABLE_NAME`; the password itself is never a CLI argument. See the [CLI guide](packages/jsbrains-cli/README.md) for examples and the JSON contract.

## Library

```ts
import {JetBrains} from '@jalsoedesign/jsbrains';

const jetBrains = await JetBrains.detect();
const installation = await jetBrains.getInstallation({product: 'PhpStorm', latest: true});

if (installation) {
   const project = await installation.getProject(process.cwd());
   const deployments = await project.deployments.getAll();
}
```

See the [library guide](packages/jsbrains/README.md) and [compatibility research](packages/jsbrains/docs/COMPATIBILITY.md). Chalk and argument parsing belong to the CLI package; library consumers do not install Chalk.

## Build, test and package

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run check
npm run test:package
npm run pack:all
```

Builds run in dependency order. `test:package` installs the original SDK/CLI pair into an isolated temporary consumer and checks library ESM/CommonJS imports, the CLI, JSON, credential redaction, and explicit export using fake secrets. Tests use generated KeePass fixtures, including a Windows DPAPI fixture, and never use a user's actual password database.

`npm run pack:all` creates tarballs for all four workspaces. The following command installs only the original SDK/CLI pair; use check:consumer with the explicit shared artifacts to verify the optional Portline packages:

```sh
npm install -g <library-tarball> <cli-tarball>
jsbrains deployments --product PhpStorm --json
```

The repository root is private.

Local metadata integration checks retain the `JSBRAINS_TEST_REAL_INSTALLATION=1` opt-in. Actual credential access through that test script additionally requires `JSBRAINS_TEST_CREDENTIALS=1`. The CLI's `credentials` command or `--credentials` flag is itself an explicit retrieval request and does not require those test-only variables.

## License and trademarks

MIT. See [LICENSE](LICENSE). jsbrains is independent and is not affiliated with, endorsed by, or sponsored by JetBrains s.r.o. JetBrains and its product names are trademarks of their respective owner.

Related libraries: [Portline ecosystem directory](https://h2ooooooo.github.io/portline/ecosystem).

## Portline integration

The optional @jalsoedesign/jsbrains-portline adapter and @jalsoedesign/jsbrains-portline-cli executable (jsbrains-profiles) require Node 22.22.2. They add normalized profiles and explicit guarded settings previews/apply. The original jsbrains API and executable remain read-only. Built-in apply is Windows-only; close the IDE before applying. Stored Password Safe values are not copied by sync.

The optional bridge uses the same independent build and test commands.

[Documentation](https://h2ooooooo.github.io/jsbrains/) · [Quick start](https://h2ooooooo.github.io/jsbrains/guide/quick-start) · [API reference](https://h2ooooooo.github.io/jsbrains/reference/api)

## Runnable examples

[Run a local demo](docs/guide/local-demo.md) for one-command examples and captured output. Profile demos use synthetic settings and make no remote connections.
