# Write and sync profiles

Writing is a two-step workflow: save a preview, inspect it, then apply explicitly to the same destination with the same policies. The default mode is `create`; existing-profile updates require an explicit supported mode.

## Inspect availability

```sh
jsbrains-profiles write-status --config ./PhpStorm2026.2 --json
```


This is read-only. It reports destination revision, process/lock availability and diagnostics; availability depends on the selected native application and platform. Unknown or busy availability prevents apply. For project scope and XML behavior, read the [application writing guide](/guide/portline).

## Save a preview

```sh
jsbrains-profiles write --config ./PhpStorm2026.2 --input profiles.json --preview plan.json --json
```


`profiles.json` must contain supported normalized write intent, not compact list output. Use your [API adapter](/api/) or a selected `sync` source to construct it. This command creates the preview file with create-only semantics and leaves native settings unchanged. Existing `plan.json` is refused.

## Preview cross-app sync

Use `sync --from <application>` with its explicit source selector, `--profile`, `--target-path` and a connection ID when the profile has multiple connections. Source adapters are allowlisted and must already be installed. Sync copies supported metadata, not stored secret values, key contents or host-trust policy. [Complete command help](/reference/cli-help) documents the accepted selectors.

## Apply a reviewed preview

Close the destination application and inspect the saved changes and diagnostics first:

```sh
jsbrains-profiles apply --config ./PhpStorm2026.2 --plan plan.json --json
```


Apply rechecks the preview, current revision, destination identity, process/lock availability and write policy. It retains recovery backups. Built-in native commit backends require Windows; file reads and previews are usable on other supported systems. This adapter writes files; registry-mode options are not applicable. Registry-backed application adapters document their own transactional and guarded policies. Backups may contain the original stored credentials and must remain private.

## Understand the result

Preview/apply fields depend on native storage and supported projection. The [captured output reference](/reference/cli-output) includes actual preview, stale-plan refusal and busy-lock refusal examples where exercised. The [shared writing guide](https://h2ooooooo.github.io/portline/integration/native-writing) explains revision guards, backup/recovery and registry policies. No force flag bypasses unknown availability.
