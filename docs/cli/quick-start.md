# CLI quick start

Start with the original `jsbrains` read-only command. The normalized `jsbrains-profiles` command has a [separate quick start](/cli/profiles).

## Install

```sh
npm install --global @jalsoedesign/jsbrains-cli
```

For project-local use, install without `--global` and prefix commands with `npm exec --`. See [runtime requirements](/guide/installation).

## Save the fixture

Use the [synthetic settings files](/guide/fixtures): <a href="/examples/fixtures/PhpStorm2026.2/options/webServers.xml" download="webServers.xml"><code>PhpStorm2026.2/options/webServers.xml</code></a> · <a href="/examples/fixtures/PhpStorm2026.2/options/sshConfigs.xml" download="sshConfigs.xml"><code>PhpStorm2026.2/options/sshConfigs.xml</code></a>. Run from their parent working directory. The configuration directory is `./PhpStorm2026.2`. Key paths are illustrative metadata and require no key file.

## Read deployments

```sh
jsbrains deployments --global --config ./PhpStorm2026.2 --color --project ./DemoProject
```

Exit code: `0`.

Standard output:

<pre class="cli-output" v-pre><code><span style="font-weight:700"></span><span style="color:#00aaaa;font-weight:700">Deployments (1)</span><span style="font-weight:700"></span>
&lt;fixture-directory&gt;/DemoProject

<span style="font-weight:700">Demo</span>  <span style="color:#aa00aa">SFTP</span> [global]
  <span style="color:#00aaaa">127.0.0.1</span>:22  user: deploy
  ID: demo  auth: password
  Source: &lt;fixture-directory&gt;/PhpStorm2026.2/options/webServers.xml</code></pre>

This reads deployment metadata. For automation, use `--json`; the original command returns a `schemaVersion`/`data` envelope. [Captured original-command JSON](/cli/original-output) shows the complete result.

## Continue by task

Use [normalized profiles](/cli/profiles) for list/search/get or guarded writing. The two commands have different input and output contracts. Contributor fixture runners live in [local demos](/guide/local-demo).
