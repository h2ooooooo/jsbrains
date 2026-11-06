import {JetBrains} from '@/index';

const jetBrains = await JetBrains.detect();
const installation = await jetBrains.getInstallation({product: 'PhpStorm', latest: true});

if (installation) {
   for (const project of await installation.getRecentProjects()) {
      console.log(project.path, await project.exists());
   }
}
