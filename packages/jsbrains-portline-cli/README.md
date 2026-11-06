# jsbrains-portline-cli

JetBrains profiles and guarded settings integration for Portline. Requires Node 22.22.2 or newer; the original jsbrains library and CLI retain Node 20 support.

The adapter reads deployments, SSH configurations and credential references. The jsbrains-profiles executable provides sources, source, search, list, get, write, sync, apply and write-status. Use --config for a selected IDE configuration and --project for project settings. Discovery does not guess among ambiguous installations.

Read operations do not change settings. Write/sync create redacted previews; apply is explicit and rechecks revisions, IDE processes and lock markers. Keep the IDE closed throughout apply. Built-in apply requires Windows and retains protected backups. Password Safe entries, stored secrets, key contents and host trust policies are not copied.

[Writing safeguards](https://github.com/h2ooooooo/portline/blob/main/docs/profile-writing.md) · [Development](https://github.com/h2ooooooo/portline/blob/main/docs/development.md) · [Ecosystem directory](https://h2ooooooo.github.io/portline/ecosystem).
