export type DeploymentType = 'ftp' | 'ftps' | 'sftp' | 'local' | 'mounted-folder' | 'webdav' | 'unknown';
export type DeploymentVisibility = 'project' | 'global';
export type DeploymentAuthType = 'password' | 'private-key' | 'open-ssh' | 'anonymous' | 'unknown';

export interface DeploymentAuthInfo {
   type: DeploymentAuthType;
   privateKeyPath?: string;
   storesPassword?: boolean;
   storesPassphrase?: boolean;
   usesOpenSshConfig?: boolean;
   sshConfigId?: string;
}

export interface DeploymentMapping {
   localPath: string | null;
   deploymentPath: string | null;
   webPath: string | null;
   unresolvedMacros?: string[];
}

export interface DeploymentSourceInfo {
   visibility: DeploymentVisibility;
   projectPath?: string;
   installationConfigPath?: string;
   serverConfigPath: string;
   deploymentConfigPath?: string;
   sshConfigPath?: string;
   rawType?: string;
}

export interface DeploymentInfo {
   id: string | null;
   name: string;
   type: DeploymentType;
   host: string | null;
   port: number | null;
   literalPort?: string;
   username: string | null;
   rootPath: string | null;
   webUrl: string | null;
   auth: DeploymentAuthInfo;
   mappings: DeploymentMapping[];
   visibility: DeploymentVisibility;
   source: DeploymentSourceInfo;
   diagnostics: string[];
}

export interface RawDeploymentData {
   server?: unknown;
   mapping?: unknown;
   ssh?: unknown;
   serverXmlPath: string;
   mappingXmlPath?: string;
}

export type DeploymentCredentials =
   | {type: 'password'; username: string | null; password: string | null}
   | {type: 'private-key'; username: string | null; privateKeyPath: string | null; passphrase: string | null}
   | {type: 'open-ssh'; username: string | null; password: null; passphrase: null};

export interface DeploymentQueryOptions {
   includeProject?: boolean;
   includeGlobal?: boolean;
}

export type AutoUploadMode = 'never' | 'always' | 'on-explicit-save' | 'unknown';

export interface DeploymentProjectState {
   defaultDeploymentId?: string;
   defaultDeploymentName?: string;
   autoUpload?: AutoUploadMode;
   rawAutoUpload?: string;
}
