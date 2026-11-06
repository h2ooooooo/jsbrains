---
outline: 2
---

# Original jsbrains CLI output

Captured with a synthetic IDE configuration and project. No remote login or real credential-store access occurs. The original CLI uses `--show-secrets`; jsbrains-profiles uses `--show-password` and a different output contract.

## inspect

```sh
jsbrains inspect --config <fixture-directory>\PhpStorm2026.2 --project <fixture-directory>\project --json
```

Exit code: 0.

### stdout

```json
{
  "schemaVersion": 1,
  "command": "inspect",
  "data": {
    "installations": [
      {
        "product": "PhpStorm",
        "version": "2026.2",
        "configPath": "<fixture-directory>\\PhpStorm2026.2",
        "systemPath": null,
        "platform": "win32",
        "detected": false
      }
    ],
    "project": {
      "path": "<fixture-directory>\\project",
      "ideaPath": "<fixture-directory>\\project\\.idea",
      "name": "project"
    },
    "projectDeployments": []
  }
}
```

## installations

```sh
jsbrains installations --config <fixture-directory>\PhpStorm2026.2 --project <fixture-directory>\project --json
```

Exit code: 0.

### stdout

```json
{
  "schemaVersion": 1,
  "command": "installations",
  "data": [
    {
      "product": "PhpStorm",
      "version": "2026.2",
      "configPath": "<fixture-directory>\\PhpStorm2026.2",
      "systemPath": null,
      "platform": "win32",
      "detected": false
    }
  ]
}
```

## projects

```sh
jsbrains projects --config <fixture-directory>\PhpStorm2026.2 --project <fixture-directory>\project --json
```

Exit code: 0.

### stdout

```json
{
  "schemaVersion": 1,
  "command": "projects",
  "data": {
    "installation": {
      "product": "PhpStorm",
      "version": "2026.2",
      "configPath": "<fixture-directory>\\PhpStorm2026.2",
      "systemPath": null,
      "platform": "win32",
      "detected": false
    },
    "projects": []
  }
}
```

## project

```sh
jsbrains project --config <fixture-directory>\PhpStorm2026.2 --project <fixture-directory>\project --json
```

Exit code: 0.

### stdout

```json
{
  "schemaVersion": 1,
  "command": "project",
  "data": {
    "installation": {
      "product": "PhpStorm",
      "version": "2026.2",
      "configPath": "<fixture-directory>\\PhpStorm2026.2",
      "systemPath": null,
      "platform": "win32",
      "detected": false
    },
    "project": {
      "path": "<fixture-directory>\\project",
      "ideaPath": "<fixture-directory>\\project\\.idea",
      "name": "project"
    },
    "state": {}
  }
}
```

## deployments

```sh
jsbrains deployments --config <fixture-directory>\PhpStorm2026.2 --project <fixture-directory>\project --json
```

Exit code: 0.

### stdout

```json
{
  "schemaVersion": 1,
  "command": "deployments",
  "data": {
    "installation": {
      "product": "PhpStorm",
      "version": "2026.2",
      "configPath": "<fixture-directory>\\PhpStorm2026.2",
      "systemPath": null,
      "platform": "win32",
      "detected": false
    },
    "project": "<fixture-directory>\\project",
    "deployments": [
      {
        "id": "demo",
        "name": "Demo",
        "type": "sftp",
        "host": "files.example.invalid",
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
          "serverConfigPath": "<fixture-directory>\\PhpStorm2026.2\\options\\webServers.xml",
          "deploymentConfigPath": "<fixture-directory>\\project\\.idea\\deployment.xml",
          "installationConfigPath": "<fixture-directory>\\PhpStorm2026.2",
          "projectPath": "<fixture-directory>\\project",
          "rawType": "SFTP"
        },
        "diagnostics": []
      }
    ]
  }
}
```

## credentials

```sh
jsbrains credentials Demo --scope global --config <fixture-directory>\PhpStorm2026.2 --project <fixture-directory>\project --json
```

Exit code: 3.

### stdout

```json
{
  "schemaVersion": 1,
  "command": "credentials",
  "data": {
    "installation": {
      "product": "PhpStorm",
      "version": "2026.2",
      "configPath": "<fixture-directory>\\PhpStorm2026.2",
      "systemPath": null,
      "platform": "win32",
      "detected": false
    },
    "project": "<fixture-directory>\\project",
    "summary": {
      "total": 1,
      "available": 0,
      "unavailable": 1,
      "secretsRetrieved": 0
    },
    "results": [
      {
        "id": "demo",
        "name": "Demo",
        "source": {
          "visibility": "global",
          "serverConfigPath": "<fixture-directory>\\PhpStorm2026.2\\options\\webServers.xml",
          "deploymentConfigPath": "<fixture-directory>\\project\\.idea\\deployment.xml",
          "installationConfigPath": "<fixture-directory>\\PhpStorm2026.2",
          "projectPath": "<fixture-directory>\\project",
          "rawType": "SFTP"
        },
        "status": "not-stored",
        "secretRetrieved": false
      }
    ]
  }
}
```

## password-safe

```sh
jsbrains password-safe --config <fixture-directory>\PhpStorm2026.2 --project <fixture-directory>\project --json
```

Exit code: 0.

### stdout

```json
{
  "schemaVersion": 1,
  "command": "password-safe",
  "data": {
    "installation": {
      "product": "PhpStorm",
      "version": "2026.2",
      "configPath": "<fixture-directory>\\PhpStorm2026.2",
      "systemPath": null,
      "platform": "win32",
      "detected": false
    },
    "passwordSafe": {
      "provider": "KEEPASS",
      "databasePath": "<fixture-directory>\\PhpStorm2026.2\\c.kdbx",
      "databaseExists": false,
      "mainKeyPath": "<fixture-directory>\\PhpStorm2026.2\\c.pwd"
    }
  }
}
```

## settings

```sh
jsbrains settings --config <fixture-directory>\PhpStorm2026.2 --project <fixture-directory>\project --json
```

Exit code: 0.

### stdout

```json
{
  "schemaVersion": 1,
  "command": "settings",
  "data": {
    "directory": "<fixture-directory>\\project\\.idea",
    "files": [
      {
        "filename": "deployment.xml",
        "path": "<fixture-directory>\\project\\.idea\\deployment.xml",
        "exists": true
      }
    ]
  }
}
```

## Colored deployment output

<pre class="cli-output" v-pre><code><span style="font-weight:700;"></span><span style="color:#76e3ea;font-weight:700;">Deployments (1)</span><span style="font-weight:700;"></span>
&lt;fixture-directory&gt;\project

<span style="font-weight:700;">Demo</span>  <span style="color:#dbb7ff;">SFTP</span> [global]
  <span style="color:#76e3ea;">files.example.invalid</span>:22  user: deploy
  ID: demo  auth: password
  Source: &lt;fixture-directory&gt;\PhpStorm2026.2\options\webServers.xml</code></pre>

## Contract and exit codes

Success JSON is one stdout document with schemaVersion, command and data. Data is command-specific as shown above. Errors are JSON on stderr. `--json` disables colors. Read-only commands never connect to a deployment server. Credential requests may unlock supported local stores only when explicitly requested.

| Exit | Meaning |
| --- | --- |
| 0 | Success, including empty listings |
| 1 | Read/parse or unexpected failure |
| 2 | Invalid arguments, missing selection or ambiguous selection |
| 3 | Credential test completed with unavailable credentials |

The credential summary reports retrieved-secret counts and statuses without values by default. `--show-secrets` is accepted only with credentials or deployments `--credentials`. OpenSSH delegation can be available without retrieving a password. See [credential behavior](/guide/credentials) and [all inputs](/reference/jsbrains-help).

## Settings payload boundary

The settings listing above reports file metadata. Reading a specific XML file applies name-based field redaction; non-XML files use a text payload returned verbatim. These paths do not guarantee arbitrary native contents are secret-free. See [settings redaction scope](/reference/cli#settings-redaction-scope).
