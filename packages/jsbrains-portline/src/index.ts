import {DeploymentManager, JetBrains} from '@jalsoedesign/jsbrains';
import type {Deployment, DetectionOptions, JetBrainsInstallation} from '@jalsoedesign/jsbrains';
import type {AuthenticationMethod, ConnectionDefinition, ConnectionProfile, CredentialReference, CredentialResult, SourceReference} from '@jalsoedesign/portline-abstract';
import {NativeProfileSource, credential, fileSource, nativeProfile, privateKey, requireSource, selectSource} from '@jalsoedesign/portline-platform';

function record(value: unknown): Record<string, unknown> {
   return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function attribute(value: Record<string, unknown>, name: string): string | undefined {
   const result = value['@_' + name];
   return typeof result === 'string' ? result : undefined;
}

export interface JetBrainsProfileOptions extends DetectionOptions {
   configPath?: string;
   sourceId?: string;
   product?: string;
   version?: string;
   projectPath?: string;
}

export class JetBrainsProfileSource extends NativeProfileSource {
   public static async discover(options: JetBrainsProfileOptions = {}) {
      const installations = options.configPath ?
         [await JetBrains.fromConfigPath(options.configPath, options)] :
         await (await JetBrains.detect(options)).getInstallations();
      const candidates = installations.filter(installation =>
         (!options.product || installation.product.toLowerCase() === options.product.toLowerCase()) &&
         (!options.version || installation.version === options.version))
         .map(installation => ({
            ...fileSource('jetbrains', installation.configPath, 'directory'),
            applicationVersion: installation.version ?? undefined,
            scope: installation.product
         }));

      return selectSource(candidates, {
         sourceId: options.sourceId ?? (options.configPath ? candidates[0]?.id : undefined)
      });
   }

   public static async open(options: JetBrainsProfileOptions = {}) {
      const source = requireSource(await JetBrainsProfileSource.discover(options));
      const installation = await JetBrains.fromConfigPath(source.location!, options);

      return JetBrainsProfileSource.fromInstallation(installation, options.projectPath);
   }

   public static async fromInstallation(installation: JetBrainsInstallation, projectPath?: string) {
      const project = projectPath ? await installation.getProject(projectPath) : undefined;
      const manager = new DeploymentManager({installation, project});
      const source: SourceReference = {
         ...fileSource('jetbrains', installation.configPath, 'directory'),
         applicationVersion: installation.version ?? undefined,
         scope: installation.product,
         storage: [
            {kind: 'directory', path: installation.configPath},
            ...(project ? [{kind: 'directory' as const, path: project.ideaPath}] : [])
         ]
      };
      const entries = [
         ...(await manager.getAll()).map(deployment => ({deployment, group: 'deployments'})),
         ...(await manager.getSshConfigurations()).map(deployment => ({deployment, group: 'ssh'}))
      ];
      const native = new Map<string, Deployment>();
      const profiles: ConnectionProfile[] = entries.map(({deployment, group}) => {
         const id = deployment.visibility + '/' + group + '/' + (deployment.id ?? deployment.name);
         const auth = deployment.auth;
         const raw = deployment.getRaw();
         const transfer = record(record(raw.server).fileTransfer);
         const advanced = record(record(transfer.advancedOptions).advancedOptions);
         const passiveMode = attribute(advanced, 'passiveMode');
         const authentication: AuthenticationMethod[] = [...privateKey(auth.privateKeyPath)];

         if (auth.type === 'password') {
            authentication.push({
               type: 'password',
               credential: credential(source, id, auth.storesPassword === false ? 'not-stored' : 'available')
            });
         } else if (auth.type === 'private-key' && authentication[0]?.type === 'private-key') {
            authentication[0] = {
               ...authentication[0],
               passphrase: credential(source, id, auth.storesPassphrase === false ? 'not-stored' : 'available', 'passphrase')
            };
         } else if (auth.type === 'open-ssh') {
            authentication.push({type: 'agent'});
         } else if (auth.type === 'anonymous') {
            authentication.push({type: 'anonymous'});
         }

         if (auth.type === 'unknown') {
            authentication.push({type: 'unsupported', nativeType: 'JetBrains authentication'});
         }

         const base = {
            id: 'connection',
            unsupportedOptions: [
               ...(auth.usesOpenSshConfig ? ['useOpenSSHConfig'] : []),
               ...(auth.privateKeyPath && /[$][A-Z_]+[$]/.test(auth.privateKeyPath) ? ['unresolved private-key path macro'] : []),
               ...Object.keys(advanced).filter(key => key.startsWith('@_') && key !== '@_passiveMode')
                  .map(key => 'advancedOptions.' + key.slice(2)),
               ...(passiveMode !== undefined && !['true', 'false'].includes(passiveMode) ? ['passiveMode'] : [])
            ],
            endpoint: {
               host: deployment.host ?? '',
               port: deployment.literalPort !== undefined && deployment.port === null ? 0 :
                  deployment.port ?? (deployment.type === 'sftp' ? 22 : 21),
               username: deployment.username ?? undefined
            },
            authentication
         };
         const connection: ConnectionDefinition = deployment.type === 'sftp' ? {
            ...base, kind: 'ssh', protocol: group === 'ssh' ? 'ssh' : 'sftp',
            remoteDirectory: deployment.rootPath ?? undefined
         } : deployment.type === 'ftp' || deployment.type === 'ftps' ? {
            ...base, kind: 'ftp', protocol: deployment.type,
            tls: deployment.type === 'ftp' ? 'none' : 'optional',
            passive: passiveMode === undefined ? undefined : passiveMode === 'true',
            remoteDirectory: deployment.rootPath ?? undefined
         } : {...base, kind: 'unsupported', protocol: deployment.type};
         native.set(id, deployment);

         return {
            ...nativeProfile(source, id, [connection]),
            name: deployment.name,
            diagnostics: [
               ...deployment.diagnostics.map(message => ({code: 'native-deployment', severity: 'warning' as const, message})),
               ...(auth.usesOpenSshConfig || auth.type === 'unknown' ? [{code: 'native-authentication', severity: 'warning' as const,
                  message: 'Authentication requires native JetBrains or OpenSSH configuration handling'}] : [])
            ]
         };
      });
      const resolve = async (reference: CredentialReference): Promise<CredentialResult> => {
         const deployment = native.get(reference.id);

         if (!deployment) {
            return {state: 'unavailable'};
         }

         const result = await deployment.credentials.resolve();

         if (result.status === 'available') {
            const value = reference.kind === 'passphrase' && result.credentials.type === 'private-key' ?
               result.credentials.passphrase :
               result.credentials.type === 'password' ? result.credentials.password : null;

            return value === null ? {state: 'not-stored'} : {state: 'available', value};
         }

         if (['locked', 'master-password-required', 'pgp-required'].includes(result.status)) {
            return {state: 'locked'};
         }

         return {state: result.status === 'not-stored' ? 'not-stored' :
            result.status === 'unsupported' ? 'unsupported' : 'unavailable'};
      };

      return new JetBrainsProfileSource(source, profiles, entries.map(({deployment, group}) => ({
         name: deployment.visibility + '/' + group + '/' + (deployment.id ?? deployment.name),
         settings: {raw: JSON.stringify(deployment.getRaw())}
      })), resolve);
   }
}
export const discoverJetBrainsSources = JetBrainsProfileSource.discover;

export * from './writing.js';
