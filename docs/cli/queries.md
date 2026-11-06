---
outline: 2
---

# Query command examples

Inputs and outputs below were captured from the built command using synthetic settings. Colours preserve the executable's actual ANSI choices; JSON remains colour-free. These reference fixtures use example.invalid hosts and are separate from the 127.0.0.1 quick-start fixture. Placeholder fixture paths must be replaced with your local paths. No external server was contacted.

Start with the [CLI quick start](/cli/quick-start) for a complete fixture you can create and query immediately. See the [full output reference](/reference/cli-output) for every captured case.

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
