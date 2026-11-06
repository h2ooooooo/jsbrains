---
outline: 2
---

# CLI output reference

These examples were captured from the actual built CLI using synthetic native settings. No remote connection was made. Paths are normalized for portability. Terminal examples preserve the executable's ANSI color choices; JSON examples are color-free. The [complete input reference](/reference/cli-help) lists command help.

## list (terminal)

```sh
jsbrains-profiles list --config <fixture-directory>\PhpStorm2026.2 --color
```

Exit code: 0.

### stdout

<pre class="cli-output" v-pre><code><span style="color:#72f088;">• </span>global/deployments/demo
<span style="color:#72f088;">• </span>global/ssh/demo-ssh</code></pre>

## list (JSON)

```sh
jsbrains-profiles list --config <fixture-directory>\PhpStorm2026.2 --json
```

Exit code: 0.

### stdout

```json
[
  {
    "path": "global/deployments/demo",
    "host": "files.example.invalid",
    "protocol": "sftp",
    "keyFile": "",
    "remoteDirectory": ""
  },
  {
    "path": "global/ssh/demo-ssh",
    "host": "shell.example.invalid",
    "protocol": "ssh",
    "keyFile": "",
    "remoteDirectory": ""
  }
]
```

## list (table)

```sh
jsbrains-profiles list --config <fixture-directory>\PhpStorm2026.2 --table --color
```

Exit code: 0.

### stdout

<pre class="cli-output" v-pre><code><span style="color:#76e3ea;">┌</span><span style="color:#76e3ea;">─────────────────────────</span><span style="color:#76e3ea;">┬</span><span style="color:#76e3ea;">───────────────────────</span><span style="color:#76e3ea;">┬</span><span style="color:#76e3ea;">──────────</span><span style="color:#76e3ea;">┬</span><span style="color:#76e3ea;">─────────────</span><span style="color:#76e3ea;">┬</span><span style="color:#76e3ea;">────────</span><span style="color:#76e3ea;">┐</span>
<span style="color:#76e3ea;">│</span> <span style="font-weight:700;"></span><span style="color:#f0f3f6;font-weight:700;">Path                   </span><span style="font-weight:700;"></span> <span style="color:#76e3ea;">│</span> <span style="font-weight:700;"></span><span style="color:#f0f3f6;font-weight:700;">Host                 </span><span style="font-weight:700;"></span> <span style="color:#76e3ea;">│</span> <span style="font-weight:700;"></span><span style="color:#f0f3f6;font-weight:700;">Protocol</span><span style="font-weight:700;"></span> <span style="color:#76e3ea;">│</span> <span style="font-weight:700;"></span><span style="color:#f0f3f6;font-weight:700;">Private key</span><span style="font-weight:700;"></span> <span style="color:#76e3ea;">│</span> <span style="font-weight:700;"></span><span style="color:#f0f3f6;font-weight:700;">Remote</span><span style="font-weight:700;"></span> <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">├</span><span style="color:#76e3ea;">─────────────────────────</span><span style="color:#76e3ea;">┼</span><span style="color:#76e3ea;">───────────────────────</span><span style="color:#76e3ea;">┼</span><span style="color:#76e3ea;">──────────</span><span style="color:#76e3ea;">┼</span><span style="color:#76e3ea;">─────────────</span><span style="color:#76e3ea;">┼</span><span style="color:#76e3ea;">────────</span><span style="color:#76e3ea;">┤</span>
<span style="color:#76e3ea;">│</span> global/deployments/demo <span style="color:#76e3ea;">│</span> files.example.invalid <span style="color:#76e3ea;">│</span> sftp     <span style="color:#76e3ea;">│</span>             <span style="color:#76e3ea;">│</span>        <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> global/ssh/demo-ssh     <span style="color:#76e3ea;">│</span> shell.example.invalid <span style="color:#76e3ea;">│</span> ssh      <span style="color:#76e3ea;">│</span>             <span style="color:#76e3ea;">│</span>        <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">└</span><span style="color:#76e3ea;">─────────────────────────</span><span style="color:#76e3ea;">┴</span><span style="color:#76e3ea;">───────────────────────</span><span style="color:#76e3ea;">┴</span><span style="color:#76e3ea;">──────────</span><span style="color:#76e3ea;">┴</span><span style="color:#76e3ea;">─────────────</span><span style="color:#76e3ea;">┴</span><span style="color:#76e3ea;">────────</span><span style="color:#76e3ea;">┘</span></code></pre>

## search

```sh
jsbrains-profiles search example --config <fixture-directory>\PhpStorm2026.2 --color
```

Exit code: 0.

### stdout

<pre class="cli-output" v-pre><code>Found 2 profiles

<span style="color:#76e3ea;">┌</span><span style="color:#76e3ea;">──────────────────</span><span style="color:#76e3ea;">┬</span><span style="color:#76e3ea;">──────────────────────────────────────────</span><span style="color:#76e3ea;">┐</span>
<span style="color:#76e3ea;">│</span> <span style="font-weight:700;"></span><span style="color:#f0f3f6;font-weight:700;">Label           </span><span style="font-weight:700;"></span> <span style="color:#76e3ea;">│</span> <span style="font-weight:700;"></span><span style="color:#f0f3f6;font-weight:700;">Value                                   </span><span style="font-weight:700;"></span> <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">├</span><span style="color:#76e3ea;">──────────────────</span><span style="color:#76e3ea;">┼</span><span style="color:#76e3ea;">──────────────────────────────────────────</span><span style="color:#76e3ea;">┤</span>
<span style="color:#76e3ea;">│</span> Name             <span style="color:#76e3ea;">│</span> Demo                                     <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Path             <span style="color:#76e3ea;">│</span> global/deployments/demo                  <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Protocol         <span style="color:#76e3ea;">│</span> sftp                                     <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Host             <span style="color:#76e3ea;">│</span> files.example.invalid                    <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Port             <span style="color:#76e3ea;">│</span> 22                                       <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Username         <span style="color:#76e3ea;">│</span> deploy                                   <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Password         <span style="color:#76e3ea;">│</span> (hidden*)                                <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Passphrase       <span style="color:#76e3ea;">│</span>                                          <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Credential state <span style="color:#76e3ea;">│</span> available                                <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Authentication   <span style="color:#76e3ea;">│</span> connection/password: available (hidden*) <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Private key      <span style="color:#76e3ea;">│</span>                                          <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Remote           <span style="color:#76e3ea;">│</span>                                          <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">└</span><span style="color:#76e3ea;">──────────────────</span><span style="color:#76e3ea;">┴</span><span style="color:#76e3ea;">──────────────────────────────────────────</span><span style="color:#76e3ea;">┘</span>

<span style="color:#76e3ea;">┌</span><span style="color:#76e3ea;">──────────────────</span><span style="color:#76e3ea;">┬</span><span style="color:#76e3ea;">───────────────────────</span><span style="color:#76e3ea;">┐</span>
<span style="color:#76e3ea;">│</span> <span style="font-weight:700;"></span><span style="color:#f0f3f6;font-weight:700;">Label           </span><span style="font-weight:700;"></span> <span style="color:#76e3ea;">│</span> <span style="font-weight:700;"></span><span style="color:#f0f3f6;font-weight:700;">Value                </span><span style="font-weight:700;"></span> <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">├</span><span style="color:#76e3ea;">──────────────────</span><span style="color:#76e3ea;">┼</span><span style="color:#76e3ea;">───────────────────────</span><span style="color:#76e3ea;">┤</span>
<span style="color:#76e3ea;">│</span> Name             <span style="color:#76e3ea;">│</span> shell.example.invalid <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Path             <span style="color:#76e3ea;">│</span> global/ssh/demo-ssh   <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Protocol         <span style="color:#76e3ea;">│</span> ssh                   <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Host             <span style="color:#76e3ea;">│</span> shell.example.invalid <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Port             <span style="color:#76e3ea;">│</span> 22                    <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Username         <span style="color:#76e3ea;">│</span> deploy                <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Password         <span style="color:#76e3ea;">│</span>                       <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Passphrase       <span style="color:#76e3ea;">│</span>                       <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Credential state <span style="color:#76e3ea;">│</span> not-stored            <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Authentication   <span style="color:#76e3ea;">│</span>                       <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Private key      <span style="color:#76e3ea;">│</span>                       <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">│</span> Remote           <span style="color:#76e3ea;">│</span>                       <span style="color:#76e3ea;">│</span>
<span style="color:#76e3ea;">└</span><span style="color:#76e3ea;">──────────────────</span><span style="color:#76e3ea;">┴</span><span style="color:#76e3ea;">───────────────────────</span><span style="color:#76e3ea;">┘</span>

*Enable passwords with <span style="color:#72f088;">--show-password</span></code></pre>

## get (JSON)

```sh
jsbrains-profiles get global/deployments/demo --config <fixture-directory>\PhpStorm2026.2 --json
```

Exit code: 0.

### stdout

```json
{
  "name": "Demo",
  "path": "global/deployments/demo",
  "protocol": "sftp",
  "host": "files.example.invalid",
  "port": 22,
  "user": "deploy",
  "password": "(hidden)",
  "passphrase": "(hidden)",
  "credentialState": "available",
  "credentials": [
    {
      "connectionId": "connection",
      "kind": "password",
      "state": "available"
    }
  ],
  "authentication": "connection/password: available (hidden*)",
  "keyFile": "",
  "remoteDirectory": "",
  "connections": [
    {
      "id": "connection",
      "endpoint": {
        "host": "files.example.invalid",
        "port": 22,
        "username": "deploy"
      },
      "authentication": [
        {
          "type": "password",
          "credential": {
            "sourceId": "jetbrains:<fixture-directory>\\PhpStorm2026.2",
            "id": "global/deployments/demo",
            "state": "available",
            "kind": "password"
          }
        }
      ],
      "kind": "ssh",
      "protocol": "sftp"
    }
  ],
  "diagnostics": [],
  "source": {
    "id": "jetbrains:<fixture-directory>\\PhpStorm2026.2",
    "application": "jetbrains",
    "location": "<fixture-directory>\\PhpStorm2026.2",
    "storage": [
      {
        "kind": "directory",
        "path": "<fixture-directory>\\PhpStorm2026.2"
      }
    ],
    "applicationVersion": "2026.2",
    "scope": "PhpStorm"
  }
}
```

## get a property

```sh
jsbrains-profiles get global/deployments/demo host --config <fixture-directory>\PhpStorm2026.2 --json
```

Exit code: 0.

### stdout

```json
"files.example.invalid"
```

## source

```sh
jsbrains-profiles source --config <fixture-directory>\PhpStorm2026.2 --json
```

Exit code: 0.

### stdout

```json
{
  "id": "jetbrains:<fixture-directory>\\PhpStorm2026.2",
  "application": "jetbrains",
  "location": "<fixture-directory>\\PhpStorm2026.2",
  "storage": [
    {
      "kind": "directory",
      "path": "<fixture-directory>\\PhpStorm2026.2"
    }
  ],
  "applicationVersion": "2026.2",
  "scope": "PhpStorm"
}
```

## full record

```sh
jsbrains-profiles get global/deployments/demo --config <fixture-directory>\PhpStorm2026.2 --full --json
```

Exit code: 0.

### stdout

```json
{
  "name": "Demo",
  "path": "global/deployments/demo",
  "protocol": "sftp",
  "host": "files.example.invalid",
  "port": 22,
  "user": "deploy",
  "password": "(hidden)",
  "passphrase": "(hidden)",
  "credentialState": "available",
  "credentials": [
    {
      "connectionId": "connection",
      "kind": "password",
      "state": "available"
    }
  ],
  "authentication": "connection/password: available (hidden*)",
  "keyFile": "",
  "remoteDirectory": "",
  "connections": [
    {
      "id": "connection",
      "endpoint": {
        "host": "files.example.invalid",
        "port": 22,
        "username": "deploy"
      },
      "authentication": [
        {
          "type": "password",
          "credential": {
            "sourceId": "jetbrains:<fixture-directory>\\PhpStorm2026.2",
            "id": "global/deployments/demo",
            "state": "available",
            "kind": "password"
          }
        }
      ],
      "kind": "ssh",
      "protocol": "sftp"
    }
  ],
  "diagnostics": [],
  "source": {
    "id": "jetbrains:<fixture-directory>\\PhpStorm2026.2",
    "application": "jetbrains",
    "location": "<fixture-directory>\\PhpStorm2026.2",
    "storage": [
      {
        "kind": "directory",
        "path": "<fixture-directory>\\PhpStorm2026.2"
      }
    ],
    "applicationVersion": "2026.2",
    "scope": "PhpStorm"
  }
}
```

## recursive list

```sh
jsbrains-profiles list --config <fixture-directory>\PhpStorm2026.2 --recurse --json
```

Exit code: 0.

### stdout

```json
{
  "name": "Root",
  "folders": [
    {
      "name": "global",
      "folders": [
        {
          "name": "deployments",
          "folders": [],
          "profiles": [
            {
              "name": "Demo",
              "path": "global/deployments/demo",
              "protocol": "sftp",
              "host": "files.example.invalid",
              "port": 22,
              "user": "deploy",
              "password": "(hidden)",
              "passphrase": "(hidden)",
              "credentialState": "available",
              "credentials": [
                {
                  "connectionId": "connection",
                  "kind": "password",
                  "state": "available"
                }
              ],
              "authentication": "connection/password: available (hidden*)",
              "keyFile": "",
              "remoteDirectory": "",
              "connections": [
                {
                  "id": "connection",
                  "endpoint": {
                    "host": "files.example.invalid",
                    "port": 22,
                    "username": "deploy"
                  },
                  "authentication": [
                    {
                      "type": "password",
                      "credential": {
                        "sourceId": "jetbrains:<fixture-directory>\\PhpStorm2026.2",
                        "id": "global/deployments/demo",
                        "state": "available",
                        "kind": "password"
                      }
                    }
                  ],
                  "kind": "ssh",
                  "protocol": "sftp"
                }
              ],
              "diagnostics": [],
              "source": {
                "id": "jetbrains:<fixture-directory>\\PhpStorm2026.2",
                "application": "jetbrains",
                "location": "<fixture-directory>\\PhpStorm2026.2",
                "storage": [
                  {
                    "kind": "directory",
                    "path": "<fixture-directory>\\PhpStorm2026.2"
                  }
                ],
                "applicationVersion": "2026.2",
                "scope": "PhpStorm"
              }
            }
          ]
        },
        {
          "name": "ssh",
          "folders": [],
          "profiles": [
            {
              "name": "shell.example.invalid",
              "path": "global/ssh/demo-ssh",
              "protocol": "ssh",
              "host": "shell.example.invalid",
              "port": 22,
              "user": "deploy",
              "password": "(hidden)",
              "passphrase": "(hidden)",
              "credentialState": "not-stored",
              "credentials": [],
              "authentication": "",
              "keyFile": "",
              "remoteDirectory": "",
              "connections": [
                {
                  "id": "connection",
                  "endpoint": {
                    "host": "shell.example.invalid",
                    "port": 22,
                    "username": "deploy"
                  },
                  "authentication": [
                    {
                      "type": "agent"
                    }
                  ],
                  "kind": "ssh",
                  "protocol": "ssh"
                }
              ],
              "diagnostics": [],
              "source": {
                "id": "jetbrains:<fixture-directory>\\PhpStorm2026.2",
                "application": "jetbrains",
                "location": "<fixture-directory>\\PhpStorm2026.2",
                "storage": [
                  {
                    "kind": "directory",
                    "path": "<fixture-directory>\\PhpStorm2026.2"
                  }
                ],
                "applicationVersion": "2026.2",
                "scope": "PhpStorm"
              }
            }
          ]
        }
      ],
      "profiles": []
    }
  ],
  "profiles": []
}
```

## missing profile

```sh
jsbrains-profiles get does-not-exist --config <fixture-directory>\PhpStorm2026.2 --json
```

Exit code: 1.

### stderr

```json
{"error":"Could not find profile by path \"does-not-exist\""}
```

## write status

```sh
jsbrains-profiles write-status --config <fixture-directory>\PhpStorm2026.2 --json
```

Exit code: 0.

### stdout

```json
{
  "source": {
    "id": "jetbrains:<fixture-directory>\\PhpStorm2026.2",
    "application": "jetbrains",
    "location": "<fixture-directory>\\PhpStorm2026.2",
    "scope": "PhpStorm",
    "applicationVersion": "2026.2",
    "storage": [
      {
        "kind": "directory",
        "path": "<fixture-directory>\\PhpStorm2026.2"
      }
    ]
  },
  "revision": "77073b0cb4d7ddccbb9bbd3acdaf7d4301e8d3d0e9810f20281593c17716a53b",
  "diagnostics": [],
  "lock": "unlocked",
  "application": "open"
}
```

## sources

```sh
jsbrains-profiles sources --config <fixture-directory>\PhpStorm2026.2 --json
```

Exit code: 0.

### stdout

```json
{
  "candidates": [
    {
      "id": "jetbrains:<fixture-directory>\\PhpStorm2026.2",
      "application": "jetbrains",
      "location": "<fixture-directory>\\PhpStorm2026.2",
      "storage": [
        {
          "kind": "directory",
          "path": "<fixture-directory>\\PhpStorm2026.2"
        }
      ],
      "applicationVersion": "2026.2",
      "scope": "PhpStorm"
    }
  ],
  "selectedSourceId": "jetbrains:<fixture-directory>\\PhpStorm2026.2",
  "selectedBy": "explicit",
  "diagnostics": []
}
```

## write preview

```sh
jsbrains-profiles write --config <fixture-directory>\PhpStorm2026.2 --input <fixture-directory>\jsbrains-profiles-profiles.json --json
```

Exit code: 0.

### stdout

```json
{
  "schemaVersion": 1,
  "sourceId": "jetbrains:<fixture-directory>\\PhpStorm2026.2",
  "application": "jetbrains",
  "scope": "global",
  "mode": "create",
  "allowLossy": false,
  "registryMode": "transactional",
  "expectedRevision": "77073b0cb4d7ddccbb9bbd3acdaf7d4301e8d3d0e9810f20281593c17716a53b",
  "inspection": {
    "source": {
      "id": "jetbrains:<fixture-directory>\\PhpStorm2026.2",
      "application": "jetbrains",
      "location": "<fixture-directory>\\PhpStorm2026.2",
      "scope": "PhpStorm",
      "applicationVersion": "2026.2",
      "storage": [
        {
          "kind": "directory",
          "path": "<fixture-directory>\\PhpStorm2026.2"
        }
      ]
    },
    "revision": "77073b0cb4d7ddccbb9bbd3acdaf7d4301e8d3d0e9810f20281593c17716a53b",
    "diagnostics": [],
    "lock": "unlocked",
    "application": "open"
  },
  "changes": [
    {
      "profileId": "global/deployments/Imported",
      "operation": "create",
      "fields": [
        "host",
        "port",
        "username",
        "authType",
        "keyPath",
        "storePassword",
        "storePassphrase",
        "anonymous",
        "accessType",
        "rootFolder"
      ]
    }
  ],
  "diagnostics": [
    {
      "code": "metadata-only-sync",
      "severity": "warning",
      "message": "Stored secrets, private key contents, trust policies and application-specific settings are not copied"
    }
  ],
  "mutations": [
    {
      "operation": "create",
      "path": "global/deployments/Imported",
      "profile": {
        "id": "global/deployments/demo",
        "path": "global/deployments/Imported",
        "name": "Imported",
        "source": {
          "id": "jetbrains:<fixture-directory>\\PhpStorm2026.2",
          "application": "jetbrains"
        },
        "connections": [
          {
            "id": "connection",
            "endpoint": {
              "host": "files.example.invalid",
              "port": 22,
              "username": "deploy"
            },
            "authentication": [
              {
                "type": "password",
                "credential": {
                  "sourceId": "omitted",
                  "id": "omitted",
                  "kind": "password",
                  "state": "not-stored"
                }
              }
            ],
            "kind": "ssh",
            "protocol": "sftp"
          }
        ],
        "diagnostics": []
      }
    }
  ],
  "digest": "bb132767eda93bea29a4a362abfd978c8aad2b16d16ec9b6fdf72d81eca92925"
}
```

## invalid apply

```sh
jsbrains-profiles apply --config <fixture-directory>\PhpStorm2026.2 --plan <fixture-directory>\missing-plan.json --json
```

Exit code: 1.

### stderr

```json
{"error":"ENOENT: no such file or directory, stat '<fixture-directory>\\missing-plan.json'"}
```

## Write and sync result contracts

write and sync both emit `NativeWritePreview`: schemaVersion, application, sourceId, expectedRevision, mode, `allowLossy`, optional `registryMode`/scope, inspection, diagnostics, changes, sanitized mutations and a digest. They never apply settings. A digest detects an edited plan; it is not a signature. Sync requires an installed source adapter and explicit connection selection for multi-connection profiles.

Successful apply emits `{applied: true, sourceId, changes, backups}`. It performs guard checks and commits separately; this documentation does not execute apply against a real application store. write-status emits source, revision, application, lock and diagnostics. These write commands emit JSON even without `--json`; `--json` also requests JSON errors.

Read/query success uses stdout; shared query/write failures use stderr and exit 1. Help and successful/empty reads exit 0. With `--json`, ordinary errors have an error string. Registry refusals can additionally include code, nativeCode, operation, `recoveryRequired` and backups. Do not treat a failed lookup as an empty successful list.

Stored credentials remain hidden by default. `--show-password` explicitly changes credential visibility and may report unavailable/locked/unsupported states. Keys and remote directories appear only when present. Captured examples contain no real credential values.
