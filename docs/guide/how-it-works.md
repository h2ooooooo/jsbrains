# How jsbrains works

jsbrains reads IDE settings stored on the host. It can describe deployments, SSH configurations and project mappings without opening a remote session or asking an IDE window to perform the read.

## Select an IDE and project

The original SDK discovers supported JetBrains configuration directories or opens an explicit configuration path. The default configuration roots are:

| Host platform | Configuration directory |
| --- | --- |
| Windows | `%APPDATA%\JetBrains\<Product><Version>` |
| macOS | `~/Library/Application Support/JetBrains/<Product><Version>` |
| Linux | `$XDG_CONFIG_HOME/JetBrains/<Product><Version>`, or `~/.config/JetBrains/<Product><Version>` |

`<Product><Version>` identifies an IDE configuration, for example a PhpStorm installation. These are settings directories, not executable locations. Discovery requires an `options` directory and does not accept a cache-only directory. JetBrains documents the [default directories and custom configuration paths](https://www.jetbrains.com/help/phpstorm/directories-used-by-the-ide-to-store-settings-caches-plugins-and-logs.html); use an explicit config path when the IDE uses a custom location.

Several IDE products or versions can be installed at once. Choose the intended installation explicitly when needed. A selected project contributes its `.idea` settings directory on the host. These settings are read from files, not the Windows registry.

## Combine the relevant settings files

| Native file | What the reader takes from it |
| --- | --- |
| `options/webServers.xml` or `.idea/webServers.xml` | Global or project deployment server definitions |
| `options/sshConfigs.xml` or `.idea/sshConfigs.xml` | Shared SSH connection details referenced by a deployment |
| `.idea/deployment.xml` | Project deployment mappings and default deployment selection |

The reader parses supported XML, associates the records and retains source paths. For a project deployment, project SSH configurations take precedence over global configurations with the same referenced ID. Global deployments use global SSH configurations. Reopen or reread settings after the native files change.

### Follow a deployment's references

The following synthetic excerpts show the relevant records; their surrounding XML containers are omitted:

```xml
<!-- webServers.xml: inside WebServers / option name="servers" -->
<webServer id="demo" name="Example deployment">
    <fileTransfer accessType="SFTP" rootFolder="/srv/example" sshConfigId="demo-ssh" />
</webServer>

<!-- sshConfigs.xml: inside SshConfigs / configs -->
<sshConfig id="demo-ssh" host="sftp.example.test" port="22"
    username="deploy" authType="KEY_PAIR" keyPath="$USER_HOME$/.ssh/id_ed25519" />

<!-- deployment.xml: inside PublishConfigData / serverData -->
<paths id="demo" name="Example deployment">
    <serverdata>
        <mappings>
            <mapping local="$PROJECT_DIR$/public" deploy="/public" web="/" />
        </mappings>
    </serverdata>
</paths>
```

- `sshConfigId="demo-ssh"` points to the SSH record whose `id` is `demo-ssh`. That record supplies the host, port, username and authentication settings.
- `paths id="demo"` associates the mapping with the deployment's `id="demo"`. When a mapping has no ID, the reader matches its name instead.
- `rootFolder="/srv/example"` becomes `DeploymentInfo.rootPath`, a directory on the server.
- `local="$PROJECT_DIR$/public"` becomes `DeploymentMapping.localPath`. With a project at `/work/example` on the host, it expands to `/work/example/public`.
- `deploy="/public"` and `web="/"` become `deploymentPath` and `webPath`. The IDE interprets deployment mappings relative to its deployment root; jsbrains returns these fields separately without joining paths or transferring files.
- `authType="KEY_PAIR"` becomes authentication type `private-key`. `keyPath` identifies a file on the host, not a server path or key material stored in this XML.

See the [public `DeploymentInfo`, `DeploymentMapping` and `DeploymentAuthInfo` definitions](/reference/types#jalsoedesign-jsbrains) for the returned fields. `DeploymentParser.ts` and `DeploymentMappingParser.ts` implement these associations and macro expansion. Unsupported or unresolved values remain visible through diagnostics and explicit raw access.

JetBrains explains the native [connection settings](https://www.jetbrains.com/help/phpstorm/deployment-connection-tab.html) and [mapping meanings](https://www.jetbrains.com/help/phpstorm/deployment-mappings-tab.html). The [compatibility evidence](/COMPATIBILITY#deployment-fixtures) records the XML example reviewed on JetBrains' support site and the limits of the supported persistence formats.

The optional bridge uses selection paths such as `global/deployments/demo` and `project/ssh/demo-ssh`. These identify a record's scope and kind, not a filesystem location. See [Portline profiles](/guide/portline) for the normalized API.

## Resolve stored credentials explicitly

Listing deployments does not unlock Password Safe. Credential resolution is a separate operation through the supported provider and IDE context. A locked store, a required master password and an unsupported format remain explicit outcomes.

The connection XML describes authentication; the secret may live elsewhere. For example, `options/security.xml` describes the selected Password Safe provider and can specify a custom KeePass database. JetBrains' [`PasswordSafeSettings.kt`](https://github.com/JetBrains/intellij-community/blob/803de49279c5f443419bf808364e22d1276a8194/platform/credential-store-impl/src/credentialStore/PasswordSafeSettings.kt) defines those persisted settings. The IDE's [Passwords documentation](https://www.jetbrains.com/help/phpstorm/reference-ide-settings-password-safe.html) explains the native keychain, KeePass and master-password choices.

Supported Windows recovery depends on the owning user and DPAPI context. Some stores require a supplied master-password callback; native macOS/Linux password stores and unsupported plugin identifiers are not automatically recoverable. Private-key paths and SSH-agent settings describe authentication without extracting key material.

For supported SSH credential identities, JetBrains' [`RemoteCredentialsHolder.java`](https://github.com/JetBrains/intellij-community/blob/803de49279c5f443419bf808364e22d1276a8194/platform/remote-core/src/remote/RemoteCredentialsHolder.java) defines the `ssh://username@host:port` identity and separate password/passphrase qualifiers. The [credential identity evidence](/COMPATIBILITY#credential-identities) explains how jsbrains uses those definitions and why plugin-specific stores may still return `not-stored`.

Raw settings can contain sensitive native fields. The [credential guide](/guide/credentials) explains the `CredentialResolution` results and CLI redaction rules.

## Reading and writing

The original SDK provides IDE-specific reads. The optional [Portline bridge](/guide/portline) adds normalized profiles and guarded native writing. Reading does not change settings, create Password Safe entries, transfer files or run SSH commands. Supported writes use a separate preview/apply operation.

Start with the [API quick start](/api/quick-start), [CLI quick start](/cli/quick-start) or [settings and deployments guide](/guide/deployments).

## Shared execution after native interpretation

The source now exposes normalized execution details alongside metadata. `@jalsoedesign/portline-dockline` performs the shared mapping and delegates live sessions to optional Dockline clients. Native-only requirements appear in `unsupportedOptions`; they are refused rather than dropped. Read [the scoped source-to-session walkthrough](/api/integration) for supported operations and explicit trust/authentication options.
