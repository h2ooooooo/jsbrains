# JSON, errors and troubleshooting

Use `--json` for machine consumption and check the command's exit status. Human tables preserve [the executable's colours](/reference/cli-output); JSON does not contain ANSI formatting. The [complete input reference](/reference/cli-help) is the authority for accepted flags.

## Save a metadata result

```sh
jsbrains-profiles list --config ./PhpStorm2026.2 --json > profiles.json
```


On success the file contains summary records. It is a query result, not an import document or evidence that authentication succeeds. Inspect failures before processing stdout. Read the [output reference](/reference/cli-output) for exact success/failure shapes and exit statuses; the original jsbrains command has a separate versioned envelope and [output contract](/reference/jsbrains-output).

## Credentials

Passwords are hidden by default. `--show-password` explicitly requests supported credential resolution; locked, unavailable and unsupported stores remain distinct states. Do not save revealed credentials into routine logs. Key paths and remote directories are ordinary metadata.

## Troubleshooting

| Problem | Action |
| --- | --- |
| Source selection is ambiguous | Choose the returned source ID or explicit supported file/configuration/registry selector. |
| Exact profile lookup fails | Copy a canonical path from the list result; exact matching is case-sensitive. |
| A profile has diagnostics | Inspect the unsupported native setting before mapping it to an executable operation. |
| A credential remains locked or unavailable | Use supported source-specific resolution; revealing output does not bypass an encrypted store. |
| Apply refuses a stale plan | Reopen the destination, regenerate the preview and review it again. |
| Apply reports busy or unknown lock/process state | Close the application and inspect the destination state. Do not bypass the guard. |
| Apply is unavailable on this platform | Built-in native commit backends require Windows; use read/preview operations or a supported environment. |

Start with the [synthetic quick start](/cli/quick-start) to check the installed command independently of real settings.
