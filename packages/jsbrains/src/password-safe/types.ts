import type {DeploymentCredentials} from '@/deployment/types';

export interface PasswordSafeContext {
   configPath: string;
   platform: NodeJS.Platform;
   homePath?: string;
}

export interface KeePassContext extends PasswordSafeContext {
   databasePath: string;
   mainKeyPath: string;
}

export type CredentialUnavailable =
   | {status: 'not-stored' | 'master-password-required' | 'pgp-required' | 'no-installation-context' | 'unavailable'}
   | {status: 'unsupported'; reason: string}
   | {status: 'locked'; reason: string};

export type CredentialResolution = CredentialUnavailable | {status: 'available'; credentials: DeploymentCredentials};

export interface CredentialRequest {
   serviceName: string;
   username: string | null;
}

export interface StoredCredential {
   username: string | null;
   password: string | null;
}

export type StoredCredentialResult = CredentialUnavailable | {status: 'available'; credential: StoredCredential};
export type KeePassMasterKeyResult = CredentialUnavailable | {status: 'resolved'; password: Uint8Array};

export interface KeePassMasterKeyResolver {
   /** Returned key bytes remain caller-owned; the library copies them before use. */
   resolve(context: KeePassContext): Promise<KeePassMasterKeyResult>;
}

export interface PasswordSafeProvider {
   canHandle(context: PasswordSafeContext): Promise<boolean>;
   getCredential(request: CredentialRequest): Promise<StoredCredentialResult>;
   /** Optional scoped batch operation; results must follow request order. */
   getCredentials?(requests: readonly CredentialRequest[]): Promise<StoredCredentialResult[]>;
}

export interface PasswordSafeOptions {
   masterPassword?: (context: KeePassContext) => Promise<string | null>;
   masterKeyResolver?: KeePassMasterKeyResolver;
   provider?: PasswordSafeProvider;
}

export interface PasswordSafeInfo {
   provider: string;
   databasePath: string;
   databaseExists: boolean;
   mainKeyPath: string;
}
