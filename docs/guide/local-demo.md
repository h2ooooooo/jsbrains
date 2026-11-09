# Run a local demo

These are runnable examples with assertions, not output mockups. Run the commands from this repository’s root after installing its dependencies. Build the packages once:

```sh
npm run build
```

This library reads native application settings. Its demo creates synthetic settings in a new temporary directory, runs the actual built CLI against them and verifies the returned host. It does not connect to a server, read installed application settings or retrieve saved credentials. The temporary files are removed on success or failure.

## Profile queries

Run:

```sh
node examples/test-profiles.mjs
```

Equivalent npm command: `npm run demo:profiles`.

Both `jsbrains-profiles` and the original read-only `jsbrains deployments` executable are exercised.

Expected output, captured from a successful run:

```text
$ jsbrains-profiles list --config <temporary-config> --json
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
$ jsbrains-profiles get global/deployments/demo host --config <temporary-config> --json
"127.0.0.1"
$ jsbrains deployments --global --config <temporary-config> --json
{
  "schemaVersion": 1,
  "command": "deployments",
  "data": {
    "installation": {
      "product": "PhpStorm",
      "version": "2026.2",
      "configPath": "<temporary-directory>\\PhpStorm2026.2",
      "systemPath": null,
      "platform": "win32",
      "detected": false
    },
    "project": null,
    "deployments": [
      {
        "id": "demo",
        "name": "Demo",
        "type": "sftp",
        "host": "127.0.0.1",
        "port": 22,
        "literalPort": "22",
        "username": "deploy",
        "rootPath": null,
        "webUrl": null,
        "auth": {
          "type": "password"
        },
        "mappings": [],
        "visibility": "global",
        "source": {
          "visibility": "global",
          "serverConfigPath": "<temporary-directory>\\PhpStorm2026.2\\options\\webServers.xml",
          "installationConfigPath": "<temporary-directory>\\PhpStorm2026.2",
          "rawType": "SFTP"
        },
        "diagnostics": []
      }
    ]
  }
}
PASS: synthetic native settings -> CLI list and exact property lookup.
Metadata only: no remote connection or installed settings access.
Temporary files removed.
```

## Interpreting the result

Each command exits 0 only after its assertions pass. A CLI failure, incorrect response, changed bytes or unexpected trust behavior produces a nonzero exit and an assertion error. Server ports, temporary paths, platform metadata and any file timestamps can vary. The wrapper displays temporary paths as `<temporary-directory>`; the child CLI receives actual paths. Run a single example at a time when comparing its transcript.

These examples require the development dependencies in this checkout, including the local protocol fixtures where applicable. They are not additional published CLI commands. For complete CLI inputs, output contracts and colored terminal examples, use the CLI reference.

## Shared mapper smoke check

The metadata fixture runner above remains offline. After building the repository and installing `@jalsoedesign/portline-dockline`, `npm run demo:execution` additionally checks native-source conversion through the actual shared bridge without opening sockets. See [connection setup and the smoke example](/api/integration#check-mapping-without-a-server). Real scoped examples on that page deliberately connect only when run with explicit native source, profile and credential/trust configuration.
