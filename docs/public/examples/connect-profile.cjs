function required(name) {
    const value = process.env[name];

    if (!value) {
        throw new Error('Set ' + name);
    }

    return value;
}

async function main() {
    const nativeSettings = required('JETBRAINS_CONFIG');
    const profilePath = required('PROFILE_PATH');

    const {JetBrainsProfileSource} = await import('@jalsoedesign/jsbrains-portline');
    const {createDocklineBridge} = await import('@jalsoedesign/portline-dockline');
    const source = await JetBrainsProfileSource.open({configPath: nativeSettings, projectPath: process.env.JETBRAINS_PROJECT});
    const bridge = createDocklineBridge({source});
    const tls = process.env.FTP_TLS_MODE;

    if (tls && !['none', 'explicit', 'implicit'].includes(tls)) {
        throw new Error('FTP_TLS_MODE must be none, explicit or implicit');
    }

    await bridge.withFiles(profilePath, async remote => {
        for await (const entry of remote.list('.')) {
            console.log(entry.path);
        }
    }, {
        connectionId: 'connection',
        hostFingerprint: process.env.SSH_HOST_KEY_SHA256,
        password: process.env.REMOTE_PASSWORD,
        passphrase: process.env.KEY_PASSPHRASE,
        privateKeyPath: process.env.PRIVATE_KEY_PATH,
        agent: process.env.SSH_AGENT,
        timeoutMs: 30000,
        ...(tls ? {tls: tls } : {}),
    });
}

main().catch(error => {
    console.error(error instanceof Error ? error.message : 'Connection failed');
    process.exitCode = 1;
});
