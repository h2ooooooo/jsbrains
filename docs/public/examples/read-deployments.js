// read-deployments.js
import {JetBrains} from '@jalsoedesign/jsbrains';

const installation = await JetBrains.fromConfigPath(process.argv[2] ?? './PhpStorm2026.2');
const deployments = await installation.getGlobalDeployments();

console.log('Deployments: ' + deployments.length);

for (const deployment of deployments) {
    console.log(deployment.name + ': ' + deployment.type + ' ' + deployment.host + ':' + deployment.port);
}

console.log('Metadata only: no server connection or Password Safe unlock.');
