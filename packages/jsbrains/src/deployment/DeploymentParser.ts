import {attribute, component, node, nodes} from '@/util/xml';
import type {XmlNode} from '@/util/xml';
import {resolvePathMacros} from '@/util/paths';
import type {MacroContext} from '@/util/paths';
import {mappingEntries, parseMappings} from '@/deployment/DeploymentMappingParser';
import type {DeploymentAuthInfo, DeploymentInfo, DeploymentSourceInfo, DeploymentType, RawDeploymentData} from '@/deployment/types';

export interface SshConfigSource {
   config: XmlNode;
   path: string;
}

export function parseSshConfigs(document: unknown, path: string): SshConfigSource[] {
   const settings = component(document, 'SshConfigs');
   return nodes(node(settings.configs).sshConfig).map(config => ({config, path}));
}

function parseType(raw: string | null): DeploymentType {
   const types: Record<string, DeploymentType> = {
      FTP: 'ftp', FTPS: 'ftps', SFTP: 'sftp', LOCAL: 'local',
      MOUNTED: 'mounted-folder', MOUNTED_FOLDER: 'mounted-folder', WEBDAV: 'webdav'
   };
   return types[raw?.toUpperCase() ?? ''] ?? 'unknown';
}

function parseAuth(connection: XmlNode, type: DeploymentType, context: MacroContext): DeploymentAuthInfo {
   const declared = attribute(connection, 'authType');
   const auth: DeploymentAuthInfo = {type: 'unknown'};

   if (declared === 'KEY_PAIR' || attribute(connection, 'USE_KEY_PAIR') === 'true' || attribute(connection, 'useKeyPair') === 'true') {
      auth.type = 'private-key';
   } else if (declared === 'OPEN_SSH' || attribute(connection, 'USE_AUTH_AGENT') === 'true' || attribute(connection, 'authAgent') === 'true') {
      auth.type = 'open-ssh';
   } else if (attribute(connection, 'anonymous') === 'true') {
      auth.type = 'anonymous';
   } else if (declared === 'PASSWORD' || (!declared && ['sftp', 'ftp', 'ftps', 'webdav'].includes(type))) {
      auth.type = 'password';
   }

   const key = attribute(connection, 'keyPath') ?? attribute(connection, 'privateKey') ?? attribute(connection, 'PRIVATE_KEY_FILE');

   if (key) {
      auth.privateKeyPath = resolvePathMacros(key, context).path;
   }

   const openSsh = attribute(connection, 'useOpenSSHConfig') ?? attribute(connection, 'USE_OPENSSH_CONFIG');

   if (openSsh !== null) {
      auth.usesOpenSshConfig = openSsh === 'true';
   }

   for (const [xmlName, property] of [['storePassword', 'storesPassword'], ['storePassphrase', 'storesPassphrase']] as const) {
      const stored = attribute(connection, xmlName);

      if (stored !== null) {
         auth[property] = stored === 'true';
      }
   }

   return auth;
}

export function parseDeployments(options: {
   document: unknown;
   mappings: unknown;
   source: DeploymentSourceInfo;
   sshConfigs: SshConfigSource[];
   homePath?: string;
}): {info: DeploymentInfo; raw: RawDeploymentData}[] {
   const settings = component(options.document, 'WebServers');
   const serversOption = nodes(settings.option).find(item => attribute(item, 'name') === 'servers');
   const servers = nodes(node(serversOption).webServer);
   const paths = mappingEntries(options.mappings);
   const context: MacroContext = {
      projectPath: options.source.projectPath,
      configPath: options.source.installationConfigPath,
      homePath: options.homePath
   };

   return servers.map(server => {
      const transfer = node(server.fileTransfer);
      const rawType = attribute(transfer, 'accessType') ?? attribute(server, 'type');
      const type = parseType(rawType);
      const sshId = attribute(transfer, 'sshConfigId');
      const ssh = options.sshConfigs.find(item => sshId !== null && attribute(item.config, 'id') === sshId);
      const connection = {...transfer, ...ssh?.config};
      const id = attribute(server, 'id');
      const name = attribute(server, 'name') ?? id ?? 'Unnamed deployment';
      const diagnostics: string[] = [];
      const matchingPaths = paths.filter(entry => {
         const entryId = attribute(entry, 'id');

         if (entryId !== null) {
            return id !== null && entryId === id;
         }

         return attribute(entry, 'name') === name;
      });
      const auth = parseAuth(connection, type, context);

      if (sshId !== null) {
         auth.sshConfigId = sshId;

         if (!ssh) {
            auth.type = 'unknown';
            diagnostics.push('Referenced SSH configuration was not found.');
         }
      }

      let literalPort = attribute(connection, 'port') ?? attribute(connection, 'PORT');

      if (literalPort === null && type === 'sftp') {
         literalPort = '22';
      }

      if (literalPort === null && (type === 'ftp' || type === 'ftps')) {
         literalPort = '21';
      }

      let port: number | null = null;

      if (literalPort !== null && /^\d+$/.test(literalPort)) {
         const parsed = Number(literalPort);

         if (parsed > 0 && parsed <= 65535) {
            port = parsed;
         }
      }

      if (literalPort !== null && port === null) {
         diagnostics.push('Port is not a valid numeric TCP port.');
      }

      if (type === 'unknown') {
         diagnostics.push('Unrecognized deployment type; original data is available through getRaw().');
      }

      const source = {...options.source, rawType: rawType ?? undefined, sshConfigPath: ssh?.path};
      const mappings = parseMappings(matchingPaths, context);

      if (mappings.some(mapping => mapping.unresolvedMacros?.length)) {
         diagnostics.push('Some mapping path macros could not be resolved.');
      }

      const info: DeploymentInfo = {
         id, name, type, port,
         literalPort: literalPort ?? undefined,
         host: attribute(connection, 'host') ?? attribute(connection, 'HOST'),
         username: attribute(connection, 'username') ?? attribute(connection, 'userName') ?? attribute(connection, 'user') ?? attribute(connection, 'USERNAME'),
         rootPath: attribute(transfer, 'rootFolder'),
         webUrl: attribute(server, 'url'),
         auth, mappings, source, diagnostics,
         visibility: source.visibility
      };

      return {
         info,
         raw: {
            server, mapping: matchingPaths, ssh: ssh?.config,
            serverXmlPath: source.serverConfigPath,
            mappingXmlPath: source.deploymentConfigPath
         }
      };
   });
}
