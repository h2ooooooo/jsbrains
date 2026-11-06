import {JetBrains, JetBrainsProject} from '@/index';

const jetBrains = await JetBrains.detect();
const installation = await jetBrains.getInstallation({product: 'PhpStorm', latest: true});
const project = new JetBrainsProject({path: process.argv[2] ?? process.cwd(), installation: installation ?? undefined});

for (const deployment of await project.deployments.getAll()) {
   console.log(deployment.toJSON());
}
