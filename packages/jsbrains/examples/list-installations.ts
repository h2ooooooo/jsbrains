import {JetBrains} from '@/index';

const jetBrains = await JetBrains.detect();

for (const installation of await jetBrains.getInstallations()) {
   console.log(installation.toJSON());
}
