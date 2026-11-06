import {JetBrains} from '@/JetBrains';

async function inspect() {
   const jetBrains = await JetBrains.detect();
   const installations = await jetBrains.getInstallations();
   console.log(`JetBrains installations: ${installations.length}\n`);

   for (const installation of installations) {
      console.log(`${installation.product} ${installation.version ?? '(custom)'}`);
      console.log(`Config: ${installation.configPath}`);

      try {
         const projects = await installation.getRecentProjects();
         console.log(`Recent projects: ${projects.length}`);

         for (const project of projects.slice(0, 10)) {
            console.log(`- ${project.name} (${project.path})`);
         }
      } catch {
         console.log('Recent project settings could not be read.');
      }

      console.log('');
   }

   const project = await JetBrains.findProject();

   if (project) {
      console.log(`Current project: ${project.path}`);

      for (const deployment of await project.deployments.getAll()) {
         console.log(`- ${deployment.name} [${deployment.type}] ${deployment.host ?? '(local)'}:${deployment.port ?? ''}`);
      }
   }
}

inspect().catch(() => {
   console.error('JetBrains inspection failed. Check access to the configuration directories.');
   process.exitCode = 1;
});
