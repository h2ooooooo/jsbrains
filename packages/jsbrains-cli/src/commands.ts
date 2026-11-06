import {DeploymentManager} from '@jalsoedesign/jsbrains';
import type {CredentialResolution, Deployment, JetBrainsInstallation} from '@jalsoedesign/jsbrains';
import {CliContext} from '@cli/context';
import {CliError} from '@cli/options';
import type {CliOptions} from '@cli/options';
import {credentialOutput} from '@cli/credentials';
import {help} from '@cli/help';
import packageInfo from '../package.json';

export interface CommandResult {
   data: unknown;
   exitCode?: number;
}

export async function executeCommand(options: CliOptions, context: CliContext): Promise<CommandResult> {
   switch (options.command) {
      case 'help':
         return {data: help};
      case 'version':
         return {data: {name: packageInfo.name, version: packageInfo.version}};
      case 'installations':
         return {data: (await context.getInstallations()).map(item => item.toJSON())};
      case 'inspect':
         return inspectContext(context);
      case 'projects': {
         const installation = await requireInstallation(context);
         const projects = await installation.getRecentProjects();
         return {data: {installation: installation.toJSON(), projects: await Promise.all(projects.map(async project => ({...project.toJSON(), exists: await project.exists()})))}};
      }
      case 'project': {
         const installation = await context.selectInstallation(false, {allowAmbiguous: true});
         const project = await context.getProject(installation);
         return {data: {installation: installation?.toJSON() ?? null, project: project?.toJSON(), state: await project?.deployments.getProjectState()}};
      }
      case 'password-safe': {
         const installation = await requireInstallation(context);
         return {data: {installation: installation.toJSON(), passwordSafe: await installation.passwordSafe.getInfo()}};
      }
      case 'settings':
         return readSettings(options, context);
      case 'deployments':
      case 'credentials':
         return readDeployments(options, context);
   }
}

async function requireInstallation(context: CliContext): Promise<JetBrainsInstallation> {
   const installation = await context.selectInstallation(true);

   if (!installation) {
      throw new CliError('INSTALLATION_NOT_FOUND', 'Select an IDE with --product or --config.');
   }

   return installation;
}

async function inspectContext(context: CliContext): Promise<CommandResult> {
   const installations = await context.getInstallations();
   const project = await context.getProject(undefined, false);
   const deployments = await project?.deployments.getAll({includeGlobal: false}) ?? [];
   return {
      data: {
         installations: installations.map(item => item.toJSON()),
         project: project?.toJSON() ?? null,
         projectDeployments: deployments.map(item => item.toJSON())
      }
   };
}

function filterDeployments(deployments: Deployment[], options: CliOptions): Deployment[] {
   let selected = deployments;

   if (options.name !== undefined) {
      selected = selected.filter(item => item.name === options.name);
   } else if (options.id !== undefined) {
      selected = selected.filter(item => item.id === options.id);
   }

   if ((options.name || options.id) && selected.length > 1) {
      throw new CliError('AMBIGUOUS_DEPLOYMENT', 'Multiple deployments match. Narrow the selection with --scope project|global or --id ID.');
   }

   if (selected.length === 0 && (options.name || options.id || options.command === 'credentials')) {
      throw new CliError('DEPLOYMENT_NOT_FOUND', 'No matching deployments found. List them with jsbrains deployments first.');
   }

   return selected;
}

async function readDeployments(options: CliOptions, context: CliContext): Promise<CommandResult> {
   const installationRequired = options.command === 'credentials' || options.scope === 'global' || options.credentials;
   const installation = await context.selectInstallation(installationRequired, {allowAmbiguous: options.scope === 'project' && !installationRequired});
   const project = await context.getProject(installation, options.scope === 'project');

   if (!project && !installation) {
      throw new CliError('PROJECT_NOT_FOUND', 'No project or IDE found. Use --project PATH or --config PATH.');
   }

   const manager = new DeploymentManager({project: project ?? undefined, installation});
   const deployments = filterDeployments(await manager.getAll({
      includeProject: options.scope !== 'global',
      includeGlobal: options.scope !== 'project'
   }), options);
   const selection = {installation: installation?.toJSON() ?? null, project: project?.path ?? null};

   if (options.command === 'deployments' && !options.credentials) {
      return {data: {...selection, deployments: deployments.map(item => item.toJSON())}};
   }

   // A scoped batch unlocks once and disposes of database state before returning.
   let resolutions: CredentialResolution[];

   if (installation) {
      resolutions = await installation.passwordSafe.resolveDeployments(deployments);
   } else {
      resolutions = [];

      for (const deployment of deployments) {
         resolutions.push(await deployment.credentials.resolve());
      }
   }

   const results = [];
   const detailed = [];
   let available = 0;
   let secretsRetrieved = 0;

   for (const [index, deployment] of deployments.entries()) {
      const result = credentialOutput(resolutions[index] ?? {status: 'unavailable'}, options.showSecrets);

      if (result.status === 'available') {
         available++;
      }

      if (result.secretRetrieved) {
         secretsRetrieved++;
      }

      results.push({id: deployment.id, name: deployment.name, source: deployment.source, ...result});
      detailed.push({...deployment.toJSON(), credentials: result});
   }

   if (options.command === 'deployments') {
      return {data: {...selection, deployments: detailed}};
   }

   const unavailable = results.length - available;
   return {
      data: {...selection, summary: {total: results.length, available, unavailable, secretsRetrieved}, results},
      exitCode: unavailable > 0 ? 3 : 0
   };
}

function redactSettings(value: unknown): unknown {
   if (Array.isArray(value)) {
      return value.map(redactSettings);
   }

   if (!value || typeof value !== 'object') {
      return value;
   }

   const source = value as Record<string, unknown>;
   const secretName = /password|passphrase|token|secret|privatekeycontent/i;
   const secretOption = typeof source['@_name'] === 'string' && secretName.test(source['@_name']);
   const result: Record<string, unknown> = {};

   for (const [name, content] of Object.entries(source)) {
      if (secretName.test(name) || (secretOption && name !== '@_name')) {
         result[name] = '[redacted]';
      } else {
         result[name] = redactSettings(content);
      }
   }

   return result;
}

async function readSettings(options: CliOptions, context: CliContext): Promise<CommandResult> {
   const installation = await context.selectInstallation(options.globalSettings, {allowAmbiguous: !options.globalSettings});
   let settings = installation?.settings;

   if (!options.globalSettings) {
      const project = await context.getProject(installation);
      settings = project?.settings;
   }

   if (!settings) {
      throw new CliError('SETTINGS_NOT_FOUND', 'Select a project or an IDE settings directory.');
   }

   if (!options.filename) {
      const files = await settings.listFiles();
      return {data: {directory: settings.directory, files}};
   }

   const file = await settings.read(options.filename);

   if (!file) {
      throw new CliError('SETTINGS_NOT_FOUND', 'The requested settings file does not exist.');
   }

   return {data: {
      filename: file.filename, path: file.path, exists: file.exists,
      parsed: redactSettings(file.parsed),
      text: file.parsed === undefined ? file.raw : undefined
   }};
}
