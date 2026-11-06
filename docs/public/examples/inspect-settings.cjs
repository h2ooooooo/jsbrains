// inspect-settings.cjs
async function main() {
    const {JetBrains} = await import('@jalsoedesign/jsbrains');

    const installation = await JetBrains.fromConfigPath(process.argv[2] ?? './PhpStorm2026.2');
    const files = await installation.settings.listFiles();
    const servers = await installation.settings.readXml('webServers.xml');

    console.log('Settings files: ' + files.length);
    console.log('Deployment XML found: ' + Boolean(servers));
    console.log('Raw settings contents omitted from output.');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
