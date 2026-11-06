import {JetBrains} from '@/index';

if (process.env.JSBRAINS_TEST_REAL_INSTALLATION !== '1') {
   console.log('Set JSBRAINS_TEST_REAL_INSTALLATION=1 to enable read-only local integration checks.');
   process.exit(0);
}

const jetBrains = await JetBrains.detect();
const installations = await jetBrains.getInstallations();
let projectCount = 0;
let deploymentCount = 0;
let available = 0;
let failures = 0;

for (const installation of installations) {
   try {
      const deployments = await installation.getGlobalDeployments();

      for (const project of await installation.getRecentProjects()) {
         projectCount++;
         deployments.push(...await project.deployments.getAll({includeGlobal: false}));
      }

      deploymentCount += deployments.length;

      if (process.env.JSBRAINS_TEST_CREDENTIALS === '1') {
         for (const deployment of deployments) {
            const result = await deployment.credentials.resolve();

            if (result.status === 'available') {
               available++;
            }
         }
      }
   } catch {
      failures++;
   }
}

console.log({installations: installations.length, projects: projectCount, deployments: deploymentCount, failures});

if (process.env.JSBRAINS_TEST_CREDENTIALS === '1') {
   console.log(`Credential resolved: ${available > 0 ? 'yes' : 'no'}`);
}

if (failures > 0) {
   process.exitCode = 1;
}
