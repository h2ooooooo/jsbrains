// read-deployments.cjs
async function main() {
    const {JetBrains} = await import('@jalsoedesign/jsbrains');

    const installation = await JetBrains.fromConfigPath(process.argv[2] ?? './PhpStorm2026.2');
    const deployments = await installation.getGlobalDeployments();

    console.log('Deployments: ' + deployments.length);

    for (const deployment of deployments) {
        console.log(deployment.name + ': ' + deployment.type + ' ' + deployment.host + ':' + deployment.port);
    }

    console.log('Metadata only: no server connection or Password Safe unlock.');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
