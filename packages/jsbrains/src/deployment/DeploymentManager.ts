import {Deployment} from '@/deployment/Deployment';
import {parseDeployments, parseSshConfigs} from '@/deployment/DeploymentParser';
import {parseProjectState} from '@/deployment/DeploymentMappingParser';
import type {DeploymentQueryOptions} from '@/deployment/types';
import type {JetBrainsProject} from '@/project/JetBrainsProject';
import type {JetBrainsInstallation} from '@/installation/JetBrainsInstallation';

export class DeploymentManager {
   public constructor(private readonly context: {project?: JetBrainsProject; installation?: JetBrainsInstallation}) {}

   public async getAll(options: DeploymentQueryOptions = {}): Promise<Deployment[]> {
      const {project, installation} = this.context;
      const includeProject = (options.includeProject ?? true) && Boolean(project);
      const includeGlobal = (options.includeGlobal ?? true) && Boolean(installation);

      if (!includeProject && !includeGlobal) {
         return [];
      }

      const mappings = await project?.settings.read('deployment.xml');
      let projectSsh;

      if (includeProject) {
         projectSsh = await project?.settings.read('sshConfigs.xml');
      }
      const globalSsh = await installation?.settings.read('sshConfigs.xml');
      const localConfigs = parseSshConfigs(projectSsh?.parsed, projectSsh?.path ?? '');
      const globalConfigs = parseSshConfigs(globalSsh?.parsed, globalSsh?.path ?? '');
      const deployments: Deployment[] = [];
      const sources = [];

      if (includeProject && project) {
         sources.push({settings: project.settings, visibility: 'project' as const});
      }

      if (includeGlobal && installation) {
         sources.push({settings: installation.settings, visibility: 'global' as const});
      }

      for (const source of sources) {
         const file = await source.settings.read('webServers.xml');

         if (!file) {
            continue;
         }

         let sshConfigs = globalConfigs;

         if (source.visibility === 'project') {
            sshConfigs = [...localConfigs, ...globalConfigs];
         }

         const parsed = parseDeployments({
            document: file.parsed,
            mappings: mappings?.parsed,
            sshConfigs,
            homePath: installation?.homePath,
            source: {
               visibility: source.visibility,
               serverConfigPath: file.path,
               deploymentConfigPath: mappings?.path,
               installationConfigPath: installation?.configPath,
               projectPath: project?.path
            }
         });

         for (const result of parsed) {
            deployments.push(new Deployment(result.info, result.raw, installation?.passwordSafe));
         }
      }

      return deployments;
   }

   /** Standalone SSH configs use the deployment parser and Password Safe conventions. */
   public async getSshConfigurations(options: DeploymentQueryOptions = {}): Promise<Deployment[]> {
      const {project, installation} = this.context;
      const sources = [];

      if ((options.includeProject ?? true) && project) {
         sources.push({settings: project.settings, visibility: 'project' as const});
      }

      if ((options.includeGlobal ?? true) && installation) {
         sources.push({settings: installation.settings, visibility: 'global' as const});
      }

      const result: Deployment[] = [];

      for (const source of sources) {
         const file = await source.settings.read('sshConfigs.xml');
         const configs = parseSshConfigs(file?.parsed, file?.path ?? '');

         for (const [index, ssh] of configs.entries()) {
            const id = String(ssh.config['@_id'] ?? index);
            const name = String(ssh.config['@_name'] ?? ssh.config['@_host'] ?? ssh.config['@_HOST'] ?? id);
            const parsed = parseDeployments({
               document: {application: {component: {
                  '@_name': 'WebServers',
                  option: {'@_name': 'servers', webServer: {
                     '@_id': id, '@_name': name,
                     fileTransfer: {'@_accessType': 'SFTP', '@_sshConfigId': id}
                  }}
               }}},
               mappings: undefined,
               sshConfigs: configs,
               homePath: installation?.homePath,
               source: {
                  visibility: source.visibility,
                  serverConfigPath: file?.path ?? '',
                  installationConfigPath: installation?.configPath,
                  projectPath: project?.path
               }
            });

            for (const entry of parsed) {
               result.push(new Deployment(entry.info, entry.raw, installation?.passwordSafe));
            }
         }
      }

      return result;
   }

   public async get(name: string, options?: DeploymentQueryOptions): Promise<Deployment | null> {
      const deployments = await this.getAll(options);
      return deployments.find(deployment => deployment.name === name) ?? null;
   }

   public async getById(id: string, options?: DeploymentQueryOptions): Promise<Deployment | null> {
      const deployments = await this.getAll(options);
      return deployments.find(deployment => deployment.id === id) ?? null;
   }

   public async getProjectState() {
      const document = await this.context.project?.settings.readXml('deployment.xml');
      return parseProjectState(document);
   }
}
