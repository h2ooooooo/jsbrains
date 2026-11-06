# Normalized profile command

`jsbrains-profiles` is the optional Portline-based executable. It supplies normalized source selection, queries and guarded preview/apply. The original `jsbrains` command remains read-only.

## Install

```sh
npm install --global @jalsoedesign/jsbrains-portline-cli
```

Use Node.js 22.22.2 or newer. Save the [synthetic configuration](/guide/fixtures), then run from its parent directory.

## Get one property

```sh
jsbrains-profiles get global/deployments/demo host --config ./PhpStorm2026.2 --json
```

Exit code: `0`.

Standard output:

```json
"127.0.0.1"
```

## List profiles

```sh
jsbrains-profiles list --config ./PhpStorm2026.2 --json
```

Exit code: `0`.

Standard output:

```json
[
  {
    "path": "global/deployments/demo",
    "host": "127.0.0.1",
    "protocol": "sftp",
    "keyFile": "",
    "remoteDirectory": ""
  },
  {
    "path": "global/ssh/demo-ssh",
    "host": "127.0.0.1",
    "protocol": "ssh",
    "keyFile": "",
    "remoteDirectory": ""
  }
]
```

Continue with [fixture search and failures](/cli/fixture-output), [query contracts](/cli/queries) or [writing](/cli/writing). Summary records are presentation data, not normalized write intent.
