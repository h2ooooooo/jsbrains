# Implemented behavior

This specification describes the current packages. Exact exported signatures are in the [TypeScript reference](/reference/types); command inputs and outputs are in the [CLI references](/reference/cli).

## Packages and runtime

| Package | Responsibility | Runtime |
| --- | --- | --- |
| `@jalsoedesign/jsbrains` | Read installations, projects, settings, deployments and explicitly requested credentials; ESM and CommonJS builds | Node 20 or newer |
| `@jalsoedesign/jsbrains-cli` | Read-only `jsbrains` executable with terminal and versioned JSON output | Node 20 or newer |
| `@jalsoedesign/jsbrains-portline` | Normalize deployment/SSH metadata and expose the guarded native writer factory | Node 22.22.2 or newer |
| `@jalsoedesign/jsbrains-portline-cli` | `jsbrains-profiles` executable with queries, discovery and preview/sync/apply/status | Node 22.22.2 or newer |

The original library and command do not change IDE settings. The separate Portline integration supports selected native settings writes. No package deploys files, opens SSH/database sessions or runs IDE/plugin code. Dockline provides separate transport operations; profile-to-transport mapping remains the caller's responsibility.

## Discovery and project scope

Standard Windows AppData, macOS Library and Linux XDG configuration layouts are recognized. Custom configuration locations are explicit. An installation represents a product configuration/version, not an IDE executable or proof that the IDE is running.

Project APIs read `.idea` metadata and can be bound to a selected IDE installation. Recent-project records preserve source paths and optional recorded metadata; filesystem existence is checked separately. Project and global deployments retain their scope and provenance. The Portline bridge refuses ambiguous installation selection rather than guessing a running IDE.

See [discovery](/guide/discovery) for supported selectors and explicit configuration paths.

## Settings and deployments

Generic settings access reads files from the selected options or `.idea` directory. File names are confined to the selected directory; traversal and escaping symlinks are refused. XML parsing rejects DTD/entity declarations. Raw settings access remains explicit and can contain secrets.

Deployment readers expose protocol, host, port, username, authentication metadata, root/web paths, mappings, source and diagnostics. Project entries precede global entries. SDK exact-name/ID lookup returns its first match; CLI single-deployment selection refuses ambiguity and requires narrower scope or identity.

Shared SSH references use exact IDs. Unknown attributes and protocol/authentication values remain native data or diagnostics; they are not promises of supported transport execution. Reading an OpenSSH delegation flag does not execute `ssh` or read private-key contents.

See [settings and deployments](/guide/deployments) for mapping and macro rules.

## Credentials

Metadata discovery and deployment listing do not unlock Password Safe. Credential resolution is an explicit action with states including available, not-stored, master-password-required, pgp-required, locked, unsupported, unavailable and no-installation-context. A local result does not test remote authentication.

Supported KeePass/bootstrap handling includes KDBX3/4, supplied master passwords, the implemented `JetBrains` built-in wrapper and Windows DPAPI in the owning user's context. Supported Argon2/AES work is bounded. Native macOS Keychain and Linux Secret Service resolution is not implemented.

Automatic deployment identity generation covers the researched SFTP password/passphrase convention. Other protocols and unverified proprietary identities can remain unsupported or not-stored. OpenSSH delegation is metadata for a consumer; it does not extract SSH-agent keys. Password Safe databases and entries are never written.

Credential objects redact values during their documented serialization/inspection paths. Explicit field access, raw settings, copied objects and unrecognized secret fields can expose data. CLI credential values require `--show-secrets`; the settings command's XML redaction is name-based and plain-text settings are returned as text.

See [credentials](/guide/credentials) and [compatibility evidence](/COMPATIBILITY) for exact format and platform boundaries.

## Guarded writing and sync

Only the Portline packages expose writing. `write` and `sync` produce previews; `apply` is a separate explicit operation. Native targets include supported global/project deployment and SSH configuration records. Deployment mapping edits and Password Safe changes are outside this writer.

The built-in commit backend requires Windows. It rechecks target identity/revision, relevant IDE processes and known lock markers, and uses exclusive file access, protected backups and rollback. Busy, unknown, stale or modified plans are refused. There is no force or lock bypass. These checks do not guarantee that another process can never start or race a multi-file update; crash recovery can require the retained backups.

Sync copies supported normalized metadata, not stored credentials, private-key contents or trust approvals. Native recovery backups can contain sensitive original settings. Existing unrelated XML data is preserved where supported; formatting can change during serialization.

See [Portline writing](/guide/portline) and the [shared recovery contract](https://h2ooooooo.github.io/portline/integration/native-writing).

## CLI contracts

The original `jsbrains` command supports inspect, installations, projects, project, deployments, credentials, password-safe and settings. Success JSON is a versioned stdout document; errors use stderr. Credential export is explicit. `--json` disables terminal colors.

`jsbrains-profiles` uses the Portline query/write contract and `--show-password`. Its output schema and exit behavior differ from the original command, which uses `--show-secrets` for credential requests. The exact command help, examples and exit codes are documented separately.

## Validation scope

Tests use synthetic settings, generated credential databases and disposable cryptographic fixtures. Portable layout tests do not establish native macOS/Linux credential-store support. Runtime floors describe package requirements; the supported formats and tests do not promise compatibility with every IDE/plugin version.

[Run a local demo](/guide/local-demo) to execute the built commands against temporary synthetic settings without reading installed IDE settings or contacting a deployment server.
