# @jalsoedesign/jsbrains-cli

The `jsbrains` command for inspecting JetBrains installations, projects, settings, deployments, and saved credential status. Human-readable output uses Chalk; every command supports `--json`.

Requires Node.js 20+. This CLI reads through `@jalsoedesign/jsbrains`. It does not connect to deployment servers or modify configuration.

## Installation

After publication:

```sh
npm install -g @jalsoedesign/jsbrains-cli
jsbrains --help
```

For an unpublished local checkout, run `npm install` and `npm run build` at the monorepo root, then `npm exec --no -- jsbrains --help`. `npm run cli -- ...` runs source directly. Use `npm run --silent cli -- ... --json` to suppress npm's script headings when piping JSON.

## Commands

```sh
jsbrains                         # Overview
jsbrains --json                  # Overview as JSON
jsbrains installations
jsbrains projects --product PhpStorm
jsbrains project --project "<project-directory>"
jsbrains deployments --product PhpStorm --project "<project-directory>"
jsbrains deployments "Production" --scope project --json
jsbrains deployments --global --product PhpStorm
jsbrains credentials "Production" --scope project
jsbrains credentials --id server-id --json
jsbrains credentials --all --scope project --json
jsbrains deployments --credentials --json
jsbrains password-safe --product PhpStorm --json
jsbrains settings
jsbrains settings deployment.xml --json
jsbrains settings security.xml --global --product PhpStorm --json
jsbrains --version
```

When inside a project subfolder, the CLI walks upward to `.idea`. Pass `--project PATH` to inspect another project. Outside a project, deployments default to global IDE deployments when an installation is available. `--scope project` requires a project. `inspect` reports project deployments only and never resolves credentials.

## Selection

- `--product PhpStorm`: newest detected configuration for that product.
- `--ide-version 2026.2`: a specific IDE version.
- `--config PATH`: one exact configuration directory; replaces product/version selectors.
- `--scope all|project|global`: deployment scope; default is all.
- `--global`: global deployment scope, or IDE settings with `settings`.
- Positional deployment name, `--name NAME`, or `--id ID`: exact selection.

If only one IDE product is detected, its newest configuration is selected automatically. Multiple products require `--product` or `--config` for commands that need installation context. `project`, project `settings`, and metadata-only `deployments --scope project` can continue without an IDE when multiple products are detected. Explicit selectors remain strict, and credentials and global scopes require an unambiguous installation. Without IDE context, project deployments cannot resolve global SSH references. `installations` and `inspect` list every matching configuration.

Project/global duplicates remain in listings. Single-name/ID commands reject ambiguous matches before decrypting anything; narrow with `--scope` or an unambiguous ID. `credentials --all` explicitly checks all selected deployments. Empty listings succeed; a missing requested deployment is an error.

## Credential testing and export

```sh
jsbrains credentials "Production" --product PhpStorm --scope project
jsbrains credentials "Production" --product PhpStorm --scope project --json
```

Default results expose status, authentication type, username, `passwordStored`, `passphraseStored`, and `secretRetrieved`. A retrieved password/passphrase, including a stored empty string, produces `secretRetrieved: true`. The value is omitted. OpenSSH availability produces `secretRetrieved: false` and does not test the agent or remote login.

To explicitly export a retrieved secret:

```sh
jsbrains credentials "Production" --scope project --show-secrets --json
```

`--show-secrets` is accepted only with `credentials` or `deployments --credentials`. This is intentional output of sensitive data. Normal tests, listings, errors, and diagnostics do not include the secret.

Automatic Windows recovery uses the same local user as the IDE. For master-password fallback, in PowerShell with the password already held in a variable:

```powershell
$env:JSBRAINS_MASTER_PASSWORD = $masterPassword
jsbrains credentials 'Production' --master-password-env JSBRAINS_MASTER_PASSWORD --json
Remove-Item Env:JSBRAINS_MASTER_PASSWORD

# Or pipe a password line; exactly one trailing CRLF/LF is removed:
$masterPassword | jsbrains credentials 'Production' --master-password-stdin --json
```

There are no interactive prompts. Stdin is consumed only if automatic recovery fails; `--master-password-stdin` requires piped input. One input is reused for a batch. Environment variables and pipelines should still be handled as sensitive by the calling application.

`password-safe` shows provider, database location, existence, and main-key path without unlocking it. Statuses are inherited from the library: `available`, `not-stored`, `master-password-required`, `pgp-required`, `locked`, `unsupported`, `unavailable`, and `no-installation-context`. The credential command requires IDE context. Automatic deployment identifiers currently support the researched SFTP convention; other protocols or proprietary plugin variants may be unsupported or not found. Native macOS/Linux credential stores are not implemented.

## JSON interface

`--json` writes one JSON document to stdout without colors or progress text:

```json
{
   "schemaVersion": 1,
   "command": "credentials",
   "data": {
      "installation": {},
      "project": "D:\\git\\example",
      "summary": {"total": 1, "available": 1, "unavailable": 0, "secretsRetrieved": 1},
      "results": [{
         "id": "server-id",
         "name": "Production",
         "source": {},
         "status": "available",
         "secretRetrieved": true,
         "credentials": {
            "type": "password",
            "username": "deploy",
            "passwordStored": true,
            "passphraseStored": false
         }
      }]
   }
}
```

The empty installation/source objects abbreviate full library metadata. Dates serialize as ISO strings.

| Command | `data` |
|---|---|
| `inspect` | `installations`, nullable `project`, `projectDeployments` |
| `installations` | Array of installation metadata |
| `projects` | `installation`, `projects` with current `exists` checks |
| `project` | Nullable `installation`, `project`, deployment `state` |
| `deployments` | Nullable `installation`, nullable project path, `deployments` array |
| `credentials` | `installation`, nullable project path, `summary`, `results` array |
| `password-safe` | `installation`, `passwordSafe` metadata |
| `settings` | Directory and file metadata list, or selected file with `parsed` XML / `text` |
| `help` | Commands, options, examples and exit-code descriptions |
| `version` | Package `name` and `version` |

Use `.data.deployments` to consume deployments. `deployments --credentials` adds a resolution object to each deployment; unavailable secrets do not prevent a successful metadata listing.

Errors write one JSON document to stderr and leave stdout empty:

```json
{"schemaVersion":1,"error":{"code":"DEPLOYMENT_NOT_FOUND","message":"No matching deployments found. List them with jsbrains deployments first."}}
```

Error codes include `INVALID_ARGUMENTS`, `UNKNOWN_COMMAND`, `INSTALLATION_NOT_FOUND`, `AMBIGUOUS_INSTALLATION`, `PROJECT_NOT_FOUND`, `DEPLOYMENT_NOT_FOUND`, `AMBIGUOUS_DEPLOYMENT`, `SETTINGS_NOT_FOUND`, `MASTER_PASSWORD_INPUT`, and `READ_FAILED`.

| Exit code | Meaning |
|---|---|
| 0 | Success, including empty metadata listings |
| 1 | Read/parse or unexpected failure |
| 2 | Invalid arguments, missing selection, or ambiguity |
| 3 | Credential test completed, but at least one credential was unavailable |

For exit `3`, the credential result remains on stdout; stderr is empty. Read that payload even when the exit status is nonzero.

## Colors and settings contents

Chalk colors are enabled for interactive output. `--color` forces them; `--no-color` disables them. `NO_COLOR` and `FORCE_COLOR` are supported. JSON never includes color codes. Terminal control sequences in metadata are removed from human-readable output.

`settings` without a filename lists metadata only without opening file contents, so unrelated malformed XML does not prevent a listing. An explicit XML read redacts recognized password, passphrase, token, and secret fields and omits duplicate raw XML. Arbitrary plugin settings may still contain sensitive information. Non-XML reads expose their text as requested. The library's settings API remains available for exact source access.

MIT licensed. This project is independent of JetBrains and is not endorsed by JetBrains s.r.o.
