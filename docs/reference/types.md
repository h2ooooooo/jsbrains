<!-- Generated from public package declarations by scripts/generate-api-docs.mjs. -->
# TypeScript reference

These signatures come from the public package entry points and their re-exports. Build the libraries and run `npm run docs:api` to update them. Use the API guide for behavior and examples.

## @jalsoedesign/jsbrains

### index.d.ts

```ts
import { inspect } from 'node:util';

interface JetBrainsSettingsFileInfo {
    filename: string;
    path: string;
    exists: boolean;
}
interface JetBrainsSettingsFile<T = unknown> extends JetBrainsSettingsFileInfo {
    raw: string;
    parsed?: T;
}

declare class SettingsManager {
    readonly directory: string;
    constructor(directory: string);
    private resolve;
    listFiles(): Promise<JetBrainsSettingsFileInfo[]>;
    getFiles(): Promise<JetBrainsSettingsFile[]>;
    exists(filename: string): Promise<boolean>;
    readText(filename: string): Promise<string | null>;
    readXml<T = unknown>(filename: string): Promise<T | null>;
    read<T = unknown>(filename: string): Promise<JetBrainsSettingsFile<T> | null>;
}

declare class IdeSettingsManager extends SettingsManager {
    constructor(configPath: string);
}

type DeploymentType = 'ftp' | 'ftps' | 'sftp' | 'local' | 'mounted-folder' | 'webdav' | 'unknown';
type DeploymentVisibility = 'project' | 'global';
type DeploymentAuthType = 'password' | 'private-key' | 'open-ssh' | 'anonymous' | 'unknown';
interface DeploymentAuthInfo {
    type: DeploymentAuthType;
    privateKeyPath?: string;
    storesPassword?: boolean;
    storesPassphrase?: boolean;
    usesOpenSshConfig?: boolean;
    sshConfigId?: string;
}
interface DeploymentMapping {
    localPath: string | null;
    deploymentPath: string | null;
    webPath: string | null;
    unresolvedMacros?: string[];
}
interface DeploymentSourceInfo {
    visibility: DeploymentVisibility;
    projectPath?: string;
    installationConfigPath?: string;
    serverConfigPath: string;
    deploymentConfigPath?: string;
    sshConfigPath?: string;
    rawType?: string;
}
interface DeploymentInfo {
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
interface RawDeploymentData {
    server?: unknown;
    mapping?: unknown;
    ssh?: unknown;
    serverXmlPath: string;
    mappingXmlPath?: string;
}
type DeploymentCredentials = {
    type: 'password';
    username: string | null;
    password: string | null;
} | {
    type: 'private-key';
    username: string | null;
    privateKeyPath: string | null;
    passphrase: string | null;
} | {
    type: 'open-ssh';
    username: string | null;
    password: null;
    passphrase: null;
};
interface DeploymentQueryOptions {
    includeProject?: boolean;
    includeGlobal?: boolean;
}
type AutoUploadMode = 'never' | 'always' | 'on-explicit-save' | 'unknown';
interface DeploymentProjectState {
    defaultDeploymentId?: string;
    defaultDeploymentName?: string;
    autoUpload?: AutoUploadMode;
    rawAutoUpload?: string;
}

interface PasswordSafeContext {
    configPath: string;
    platform: NodeJS.Platform;
    homePath?: string;
}
interface KeePassContext extends PasswordSafeContext {
    databasePath: string;
    mainKeyPath: string;
}
type CredentialUnavailable = {
    status: 'not-stored' | 'master-password-required' | 'pgp-required' | 'no-installation-context' | 'unavailable';
} | {
    status: 'unsupported';
    reason: string;
} | {
    status: 'locked';
    reason: string;
};
type CredentialResolution = CredentialUnavailable | {
    status: 'available';
    credentials: DeploymentCredentials;
};
interface CredentialRequest {
    serviceName: string;
    username: string | null;
}
interface StoredCredential {
    username: string | null;
    password: string | null;
}
type StoredCredentialResult = CredentialUnavailable | {
    status: 'available';
    credential: StoredCredential;
};
type KeePassMasterKeyResult = CredentialUnavailable | {
    status: 'resolved';
    password: Uint8Array;
};
interface KeePassMasterKeyResolver {
    /** Returned key bytes remain caller-owned; the library copies them before use. */
    resolve(context: KeePassContext): Promise<KeePassMasterKeyResult>;
}
interface PasswordSafeProvider {
    canHandle(context: PasswordSafeContext): Promise<boolean>;
    getCredential(request: CredentialRequest): Promise<StoredCredentialResult>;
    /** Optional scoped batch operation; results must follow request order. */
    getCredentials?(requests: readonly CredentialRequest[]): Promise<StoredCredentialResult[]>;
}
interface PasswordSafeOptions {
    masterPassword?: (context: KeePassContext) => Promise<string | null>;
    masterKeyResolver?: KeePassMasterKeyResolver;
    provider?: PasswordSafeProvider;
}
interface PasswordSafeInfo {
    provider: string;
    databasePath: string;
    databaseExists: boolean;
    mainKeyPath: string;
}

declare class PasswordSafeManager {
    #private;
    constructor(context: PasswordSafeContext, options?: PasswordSafeOptions);
    getInfo(): Promise<PasswordSafeInfo>;
    getCredential(request: CredentialRequest): Promise<StoredCredentialResult>;
    /** Resolves a scoped batch in request order without retaining an unlocked database. */
    getCredentials(requests: readonly CredentialRequest[]): Promise<StoredCredentialResult[]>;
    resolveDeployment(deployment: DeploymentInfo): Promise<CredentialResolution>;
    /** Opens Password Safe only if at least one deployment needs a stored credential. */
    resolveDeployments(deployments: readonly DeploymentInfo[]): Promise<CredentialResolution[]>;
    private deploymentResult;
    toJSON(): {
        configPath: string;
    };
    [inspect.custom](): {
        configPath: string;
    };
}

declare class ProjectSettingsManager extends SettingsManager {
}

declare class Deployment implements DeploymentInfo {
    #private;
    readonly id: string | null;
    readonly name: string;
    readonly type: DeploymentType;
    readonly host: string | null;
    readonly port: number | null;
    readonly literalPort: string | undefined;
    readonly username: string | null;
    readonly rootPath: string | null;
    readonly webUrl: string | null;
    readonly auth: DeploymentAuthInfo;
    readonly mappings: DeploymentMapping[];
    readonly visibility: DeploymentVisibility;
    readonly source: DeploymentSourceInfo;
    readonly diagnostics: string[];
    readonly credentials: {
        resolve: () => Promise<CredentialResolution>;
    };
    constructor(info: DeploymentInfo, raw: RawDeploymentData, passwordSafe?: PasswordSafeManager);
    getCredentials(): Promise<DeploymentCredentials | null>;
    getRaw(): RawDeploymentData;
    toJSON(): DeploymentInfo;
    [inspect.custom](): DeploymentInfo;
}

declare class DeploymentManager {
    private readonly context;
    constructor(context: {
        project?: JetBrainsProject;
        installation?: JetBrainsInstallation;
    });
    getAll(options?: DeploymentQueryOptions): Promise<Deployment[]>;
    /** Standalone SSH configs use the deployment parser and Password Safe conventions. */
    getSshConfigurations(options?: DeploymentQueryOptions): Promise<Deployment[]>;
    get(name: string, options?: DeploymentQueryOptions): Promise<Deployment | null>;
    getById(id: string, options?: DeploymentQueryOptions): Promise<Deployment | null>;
    getProjectState(): Promise<DeploymentProjectState>;
}

interface RecentProjectInfo {
    name: string | null;
    path: string;
    exists: boolean;
    lastOpened?: Date;
}

interface ProjectOptions {
    path: string;
    installation?: JetBrainsInstallation;
    recent?: RecentProjectInfo;
}
declare class JetBrainsProject {
    readonly path: string;
    readonly ideaPath: string;
    readonly name: string | null;
    readonly recent?: RecentProjectInfo;
    readonly settings: ProjectSettingsManager;
    readonly deployments: DeploymentManager;
    constructor(options: ProjectOptions);
    exists(): Promise<boolean>;
    toJSON(): {
        path: string;
        ideaPath: string;
        name: string | null;
        recent: RecentProjectInfo | undefined;
    };
}

interface JetBrainsInstallationInfo {
    product: string;
    version: string | null;
    configPath: string;
    systemPath: string | null;
    platform: NodeJS.Platform;
    detected: boolean;
}
interface InstallationSelector {
    product?: string;
    version?: string;
    latest?: boolean;
    configPath?: string;
}
interface DetectionOptions {
    platform?: NodeJS.Platform;
    homePath?: string;
    env?: NodeJS.ProcessEnv;
    configPaths?: string[];
    passwordSafe?: PasswordSafeOptions;
}

declare class JetBrainsInstallation implements JetBrainsInstallationInfo {
    readonly product: string;
    readonly version: string | null;
    readonly configPath: string;
    readonly systemPath: string | null;
    readonly platform: NodeJS.Platform;
    readonly detected: boolean;
    readonly settings: IdeSettingsManager;
    readonly passwordSafe: PasswordSafeManager;
    readonly homePath?: string;
    constructor(info: JetBrainsInstallationInfo, options?: DetectionOptions);
    getRecentProjects(): Promise<JetBrainsProject[]>;
    getProject(path: string): Promise<JetBrainsProject>;
    getGlobalDeployments(): Promise<Deployment[]>;
    toJSON(): JetBrainsInstallationInfo;
}

declare class JetBrains {
    private readonly installations;
    private constructor();
    static detect(options?: DetectionOptions): Promise<JetBrains>;
    static fromConfigPath(configPath: string, options?: DetectionOptions): Promise<JetBrainsInstallation>;
    static findProject(options?: {
        from?: string;
    }): Promise<JetBrainsProject | null>;
    getInstallations(): Promise<JetBrainsInstallation[]>;
    getInstallation(selector: InstallationSelector): Promise<JetBrainsInstallation | null>;
}

declare class KeePassPasswordSafeProvider implements PasswordSafeProvider {
    #private;
    constructor(context: KeePassContext, options?: PasswordSafeOptions);
    canHandle(): Promise<boolean>;
    getCredential(request: CredentialRequest): Promise<StoredCredentialResult>;
    getCredentials(requests: readonly CredentialRequest[]): Promise<StoredCredentialResult[]>;
    private readCredentials;
    private findCredential;
    private clearProtectedValue;
    private disposeDatabase;
    toJSON(): {
        provider: string;
    };
    [inspect.custom](): {
        provider: string;
    };
}

declare class DefaultKeePassMasterKeyResolver implements KeePassMasterKeyResolver {
    resolve(context: KeePassContext): Promise<KeePassMasterKeyResult>;
}

declare class JetBrainsCredentialKey {
    static forDeployment(deployment: DeploymentInfo): CredentialRequest | null;
}

declare class JsBrainsError extends Error {
    constructor(message: string);
}
declare class JetBrainsDiscoveryError extends JsBrainsError {
}
declare class JetBrainsSettingsError extends JsBrainsError {
}
declare class DeploymentParseError extends JsBrainsError {
}
declare class PasswordSafeError extends JsBrainsError {
}
declare class KeePassUnlockError extends PasswordSafeError {
}

export { type AutoUploadMode, type CredentialRequest, type CredentialResolution, type CredentialUnavailable, DefaultKeePassMasterKeyResolver, Deployment, type DeploymentAuthInfo, type DeploymentAuthType, type DeploymentCredentials, type DeploymentInfo, DeploymentManager, type DeploymentMapping, DeploymentParseError, type DeploymentProjectState, type DeploymentQueryOptions, type DeploymentSourceInfo, type DeploymentType, type DeploymentVisibility, type DetectionOptions, IdeSettingsManager, type InstallationSelector, JetBrains, JetBrainsCredentialKey, JetBrainsDiscoveryError, JetBrainsInstallation, type JetBrainsInstallationInfo, JetBrainsProject, JetBrainsSettingsError, type JetBrainsSettingsFile, type JetBrainsSettingsFileInfo, JsBrainsError, type KeePassContext, type KeePassMasterKeyResolver, type KeePassMasterKeyResult, KeePassPasswordSafeProvider, KeePassUnlockError, type PasswordSafeContext, PasswordSafeError, type PasswordSafeInfo, PasswordSafeManager, type PasswordSafeOptions, type PasswordSafeProvider, type ProjectOptions, ProjectSettingsManager, type RawDeploymentData, type RecentProjectInfo, type StoredCredential, type StoredCredentialResult };
```

## @jalsoedesign/jsbrains-portline

### index.d.ts

```ts
import type { DetectionOptions, JetBrainsInstallation } from '@jalsoedesign/jsbrains';
import { NativeProfileSource } from '@jalsoedesign/portline-platform';
export interface JetBrainsProfileOptions extends DetectionOptions {
    configPath?: string;
    sourceId?: string;
    product?: string;
    version?: string;
    projectPath?: string;
}
export declare class JetBrainsProfileSource extends NativeProfileSource {
    static discover(options?: JetBrainsProfileOptions): Promise<import("@jalsoedesign/portline-platform").DiscoveryResult>;
    static open(options?: JetBrainsProfileOptions): Promise<JetBrainsProfileSource>;
    static fromInstallation(installation: JetBrainsInstallation, projectPath?: string): Promise<JetBrainsProfileSource>;
}
export declare const discoverJetBrainsSources: typeof JetBrainsProfileSource.discover;
export * from './writing.js';
```

### writing.d.ts

```ts
import { NativeProfileWriter } from '@jalsoedesign/portline-platform';
import type { NativeWriteOptions } from '@jalsoedesign/portline-platform';
import type { SourceReference } from '@jalsoedesign/portline-abstract';
export declare function createJetBrainsWriter(source: SourceReference, options?: Omit<NativeWriteOptions, 'source' | 'application'>): NativeProfileWriter;
```
