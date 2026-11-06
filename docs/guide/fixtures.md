# Synthetic settings for examples

These files contain loopback endpoints and illustrative key paths. They do not require an account, an installed `JetBrains` application or an actual private key. Reading them opens no connection.

## Download or copy

<a href="/examples/fixtures/PhpStorm2026.2/options/webServers.xml" download="webServers.xml"><code>PhpStorm2026.2/options/webServers.xml</code></a> · <a href="/examples/fixtures/PhpStorm2026.2/options/sshConfigs.xml" download="sshConfigs.xml"><code>PhpStorm2026.2/options/sshConfigs.xml</code></a>

Save the files under the shown names in an empty working directory. Create parent directories where shown. These are settings files on the host, not paths on a remote server. Keep this directory separate from installed application settings.

### PhpStorm2026.2/options/`webServers.xml`

```xml
<application>
    <component name="WebServers">
        <option name="servers">
            <webServer id="demo" name="Demo">
                <fileTransfer accessType="SFTP" host="127.0.0.1" port="22" username="deploy" />
            </webServer>
        </option>
    </component>
</application>
```

### PhpStorm2026.2/options/`sshConfigs.xml`

```xml
<application>
    <component name="SshConfigs">
        <configs>
            <sshConfig id="demo-ssh" host="127.0.0.1" port="22" username="deploy" authType="OPEN_SSH" />
        </configs>
    </component>
</application>
```



Continue with the [API quick start](/api/quick-start) or [CLI quick start](/cli/quick-start).

## Original CLI project context

For the original CLI examples, also create `DemoProject/.idea` and save <a href="/examples/fixtures/DemoProject/project-name.txt" download=".name"><code>DemoProject/.idea/.name</code></a> with the text `Demo Project`. The command selects this synthetic project explicitly so parent-directory discovery does not inspect an unrelated project.
