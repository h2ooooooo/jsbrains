# Complete CLI input reference

The help below is captured from the built executable. It is paired with the [output reference](/reference/cli-output). Commands and flags remain application-specific.

## jsbrains-profiles `--help`

```text
Usage: jsbrains-profiles <command> [options] [args]

Commands: search <term>, list, get <path> [property], source, write, sync, apply, write-status, sources
Options: --json, --table, --full, --recurse, --search <term>, --show-password, --help
--config: IDE configuration directory
--project: Project directory
--source: Discovered source ID
--product: IDE product name
--version: IDE configuration version
```

## search

Uses the global command syntax and options shown above. See the [command guide](/reference/cli) for usage.

## list

Uses the global command syntax and options shown above. See the [command guide](/reference/cli) for usage.

## get

Uses the global command syntax and options shown above. See the [command guide](/reference/cli) for usage.

## source

Uses the global command syntax and options shown above. See the [command guide](/reference/cli) for usage.

## write

```text
write-status [destination options]: inspect process, lock and registry capability diagnostics
Registry policy: --registry-mode transactional|guarded (repeat with apply; no automatic fallback)
write --input profiles.json --preview new-plan.json [destination options]
sync --from <application> --profile <path> --target-path <path> --preview new-plan.json
apply --plan new-plan.json [the same explicit destination and policy options]
Previews never apply writes. Applications must be closed; unknown state and native locks block apply.
Modes: --mode create|update|upsert. Stored secrets are never copied. No force/lock bypass is provided.
```

## sync

```text
write-status [destination options]: inspect process, lock and registry capability diagnostics
Registry policy: --registry-mode transactional|guarded (repeat with apply; no automatic fallback)
write --input profiles.json --preview new-plan.json [destination options]
sync --from <application> --profile <path> --target-path <path> --preview new-plan.json
apply --plan new-plan.json [the same explicit destination and policy options]
Previews never apply writes. Applications must be closed; unknown state and native locks block apply.
Modes: --mode create|update|upsert. Stored secrets are never copied. No force/lock bypass is provided.
```

## apply

```text
write-status [destination options]: inspect process, lock and registry capability diagnostics
Registry policy: --registry-mode transactional|guarded (repeat with apply; no automatic fallback)
write --input profiles.json --preview new-plan.json [destination options]
sync --from <application> --profile <path> --target-path <path> --preview new-plan.json
apply --plan new-plan.json [the same explicit destination and policy options]
Previews never apply writes. Applications must be closed; unknown state and native locks block apply.
Modes: --mode create|update|upsert. Stored secrets are never copied. No force/lock bypass is provided.
```

## write-status

```text
write-status [destination options]: inspect process, lock and registry capability diagnostics
Registry policy: --registry-mode transactional|guarded (repeat with apply; no automatic fallback)
write --input profiles.json --preview new-plan.json [destination options]
sync --from <application> --profile <path> --target-path <path> --preview new-plan.json
apply --plan new-plan.json [the same explicit destination and policy options]
Previews never apply writes. Applications must be closed; unknown state and native locks block apply.
Modes: --mode create|update|upsert. Stored secrets are never copied. No force/lock bypass is provided.
```

## sources

```text
Use sources --json to inspect IDE configs; select with --config <directory> or --source <id>.
```

## Declared source and write options

These rows come from the CLI source option definitions and shared write option contract. Arguments taking values are described in the command reference.

| Option | Meaning |
| --- | --- |
| `--config` | IDE configuration directory |
| `--project` | Project directory |
| `--source` | Discovered source ID |
| `--product` | IDE product name |
| `--version` | IDE configuration version |
| `--registry-mode` | transactional (default) or explicit non-atomic guarded registry mode |
| `--input` | Normalized profile/mutations JSON |
| `--preview` | Save a new preview JSON file (never applies it) |
| `--plan` | Saved preview for explicit apply |
| `--mode` | create (default), update or upsert |
| `--allow-lossy` | Acknowledge listed directory/metadata omissions |
| `--from` | Source application for one-way sync |
| `--from-file` | Source native configuration file |
| `--from-directory` | Source portable directory |
| `--from-registry` | Source session registry key |
| `--from-config` | Source `JetBrains` IDE config |
| `--from-project` | Source `JetBrains` project |
| `--profile` | Exact source profile path |
| `--target-path` | Exact destination profile path |
| `--connection` | Selected source connection ID |
| `--scope` | `JetBrains` destination global or project scope |
