# Run commands against the demo fixture

Install `@jalsoedesign/jsbrains-portline-cli` and save the [synthetic files](/guide/fixtures). These captures use those exact files. They are independent of the broader reference examples using `example.invalid` endpoints.

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

## Search metadata

```sh
jsbrains-profiles search 127.0.0.1 --config ./PhpStorm2026.2 --color
```

Exit code: `0`.

Standard output:

<pre class="cli-output" v-pre><code>Found 2 profiles

<span style="color:#00aaaa">┌</span><span style="color:#00aaaa">──────────────────</span><span style="color:#00aaaa">┬</span><span style="color:#00aaaa">──────────────────────────────────────────</span><span style="color:#00aaaa">┐</span>
<span style="color:#00aaaa">│</span> <span style="font-weight:700"></span><span style="color:#ffffff;font-weight:700">Label           </span><span style="font-weight:700"></span> <span style="color:#00aaaa">│</span> <span style="font-weight:700"></span><span style="color:#ffffff;font-weight:700">Value                                   </span><span style="font-weight:700"></span> <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">├</span><span style="color:#00aaaa">──────────────────</span><span style="color:#00aaaa">┼</span><span style="color:#00aaaa">──────────────────────────────────────────</span><span style="color:#00aaaa">┤</span>
<span style="color:#00aaaa">│</span> Name             <span style="color:#00aaaa">│</span> Demo                                     <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Path             <span style="color:#00aaaa">│</span> global/deployments/demo                  <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Protocol         <span style="color:#00aaaa">│</span> sftp                                     <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Host             <span style="color:#00aaaa">│</span> 127.0.0.1                                <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Port             <span style="color:#00aaaa">│</span> 22                                       <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Username         <span style="color:#00aaaa">│</span> deploy                                   <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Password         <span style="color:#00aaaa">│</span> (hidden*)                                <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Passphrase       <span style="color:#00aaaa">│</span>                                          <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Credential state <span style="color:#00aaaa">│</span> available                                <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Authentication   <span style="color:#00aaaa">│</span> connection/password: available (hidden*) <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Private key      <span style="color:#00aaaa">│</span>                                          <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Remote           <span style="color:#00aaaa">│</span>                                          <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">└</span><span style="color:#00aaaa">──────────────────</span><span style="color:#00aaaa">┴</span><span style="color:#00aaaa">──────────────────────────────────────────</span><span style="color:#00aaaa">┘</span>

<span style="color:#00aaaa">┌</span><span style="color:#00aaaa">──────────────────</span><span style="color:#00aaaa">┬</span><span style="color:#00aaaa">─────────────────────</span><span style="color:#00aaaa">┐</span>
<span style="color:#00aaaa">│</span> <span style="font-weight:700"></span><span style="color:#ffffff;font-weight:700">Label           </span><span style="font-weight:700"></span> <span style="color:#00aaaa">│</span> <span style="font-weight:700"></span><span style="color:#ffffff;font-weight:700">Value              </span><span style="font-weight:700"></span> <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">├</span><span style="color:#00aaaa">──────────────────</span><span style="color:#00aaaa">┼</span><span style="color:#00aaaa">─────────────────────</span><span style="color:#00aaaa">┤</span>
<span style="color:#00aaaa">│</span> Name             <span style="color:#00aaaa">│</span> 127.0.0.1           <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Path             <span style="color:#00aaaa">│</span> global/ssh/demo-ssh <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Protocol         <span style="color:#00aaaa">│</span> ssh                 <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Host             <span style="color:#00aaaa">│</span> 127.0.0.1           <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Port             <span style="color:#00aaaa">│</span> 22                  <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Username         <span style="color:#00aaaa">│</span> deploy              <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Password         <span style="color:#00aaaa">│</span>                     <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Passphrase       <span style="color:#00aaaa">│</span>                     <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Credential state <span style="color:#00aaaa">│</span> not-stored          <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Authentication   <span style="color:#00aaaa">│</span>                     <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Private key      <span style="color:#00aaaa">│</span>                     <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">│</span> Remote           <span style="color:#00aaaa">│</span>                     <span style="color:#00aaaa">│</span>
<span style="color:#00aaaa">└</span><span style="color:#00aaaa">──────────────────</span><span style="color:#00aaaa">┴</span><span style="color:#00aaaa">─────────────────────</span><span style="color:#00aaaa">┘</span>

*Enable passwords with <span style="color:#00aa00">--show-password</span></code></pre>



## Missing profile

```sh
jsbrains-profiles get Missing --config ./PhpStorm2026.2 --json
```

Exit code: `1`.

Standard error:

```text
{"error":"Could not find profile by path \"Missing\""}
```

JSON is colour-free; the human capture preserves actual CLI colours. Check the exit code before consuming output. Credential values remain masked unless explicit supported resolution is requested. See [automation](/cli/automation) and the [full command reference](/reference/cli-help).
