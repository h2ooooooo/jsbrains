# Original command JSON

Run this command against the [synthetic configuration](/guide/fixtures) with `@jalsoedesign/jsbrains-cli` installed. It uses the original command's versioned envelope; this shape differs from `jsbrains-profiles`.

## Original command JSON

```sh
jsbrains deployments --global --config ./PhpStorm2026.2 --json --project ./DemoProject
```

Exit code: `0`.

Standard output:

```json
{
  "schemaVersion": 1,
  "command": "deployments",
  "data": {
    "installation": {
      "product": "PhpStorm",
      "version": "2026.2",
      "configPath": "<fixture-directory>/PhpStorm2026.2",
      "systemPath": null,
      "platform": "<platform>",
      "detected": false
    },
    "project": "<fixture-directory>/DemoProject",
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
          "serverConfigPath": "<fixture-directory>/PhpStorm2026.2/options/webServers.xml",
          "installationConfigPath": "<fixture-directory>/PhpStorm2026.2",
          "projectPath": "<fixture-directory>/DemoProject",
          "rawType": "SFTP"
        },
        "diagnostics": []
      }
    ]
  }
}
```

`<fixture-directory>` replaces the absolute temporary directory in this verified capture. On the host, the command prints the actual selected settings path. Consume `data.deployments` after checking the exit code. See [the original CLI contract](/reference/cli) for errors, credential exit states and redaction.

`<platform>` stands for the host platform; fixture paths use `/` in this capture. The executable reports the actual platform and native absolute paths.
