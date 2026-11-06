import path from 'node:path';
import {inspect} from 'node:util';
import {IdeSettingsManager} from '@/installation/IdeSettingsManager';
import {component, option} from '@/util/xml';
import {resolvePathMacros} from '@/util/paths';
import {fileExists} from '@/util/filesystem';
import {redactSerialization} from '@/util/secrets';
import {KeePassPasswordSafeProvider} from '@/password-safe/KeePassPasswordSafeProvider';
import {JetBrainsCredentialKey} from '@/password-safe/JetBrainsCredentialKey';
import type {DeploymentInfo, DeploymentCredentials} from '@/deployment/types';
import type {CredentialRequest, CredentialResolution, PasswordSafeContext, PasswordSafeInfo, PasswordSafeOptions, StoredCredentialResult} from '@/password-safe/types';

export class PasswordSafeManager {
   #context: PasswordSafeContext;
   #options: PasswordSafeOptions;

   public constructor(context: PasswordSafeContext, options: PasswordSafeOptions = {}) {
      this.#context = context;
      this.#options = options;
   }

   public async getInfo(): Promise<PasswordSafeInfo> {
      const settings = new IdeSettingsManager(this.#context.configPath);
      const document = await settings.readXml('security.xml');
      const safe = component(document, 'PasswordSafe');
      let provider = option(safe, 'PROVIDER') ?? (this.#context.platform === 'win32' ? 'KEEPASS' : 'KEYCHAIN');

      if (this.#context.platform === 'win32' && provider === 'KEYCHAIN') {
         provider = 'KEEPASS';
      }

      const configuredPath = option(safe, 'keepassDb') ?? path.join(this.#context.configPath, 'c.kdbx');
      const expanded = resolvePathMacros(configuredPath, this.#context);
      const databasePath = path.resolve(this.#context.configPath, expanded.path);
      return {
         provider, databasePath,
         databaseExists: expanded.unresolvedMacros.length === 0 && await fileExists(databasePath),
         mainKeyPath: path.join(this.#context.configPath, 'c.pwd')
      };
   }

   public async getCredential(request: CredentialRequest): Promise<StoredCredentialResult> {
      return (await this.getCredentials([request]))[0]!;
   }

   /** Resolves a scoped batch in request order without retaining an unlocked database. */
   public async getCredentials(requests: readonly CredentialRequest[]): Promise<StoredCredentialResult[]> {
      if (requests.length === 0) {
         return [];
      }

      if (this.#options.provider && await this.#options.provider.canHandle(this.#context)) {
         if (this.#options.provider.getCredentials) {
            return this.#options.provider.getCredentials(requests);
         }

         const results: StoredCredentialResult[] = [];

         for (const request of requests) {
            try {
               results.push(await this.#options.provider.getCredential(request));
            } catch {
               results.push({status: 'unavailable'});
            }
         }

         return results;
      }

      const info = await this.getInfo();

      if (info.provider === 'MEMORY_ONLY' || info.provider === 'DO_NOT_STORE') {
         return requests.map(() => ({status: 'not-stored'}));
      }

      if (info.provider !== 'KEEPASS') {
         return requests.map(() => ({status: 'unsupported', reason: 'This Password Safe backend is not implemented.'}));
      }

      if (!info.databaseExists) {
         return requests.map(() => ({status: 'not-stored'}));
      }

      const provider = new KeePassPasswordSafeProvider({...this.#context, ...info}, this.#options);
      return provider.getCredentials(requests);
   }

   public async resolveDeployment(deployment: DeploymentInfo): Promise<CredentialResolution> {
      return (await this.resolveDeployments([deployment]))[0]!;
   }

   /** Opens Password Safe only if at least one deployment needs a stored credential. */
   public async resolveDeployments(deployments: readonly DeploymentInfo[]): Promise<CredentialResolution[]> {
      const results: CredentialResolution[] = deployments.map(() => ({status: 'unavailable'}));
      const lookups: {index: number; deployment: DeploymentInfo; request: CredentialRequest}[] = [];

      for (const [index, deployment] of deployments.entries()) {
         if (deployment.auth.type === 'open-ssh') {
            results[index] = {
               status: 'available',
               credentials: {type: 'open-ssh', username: deployment.username, password: null, passphrase: null}
            };
            continue;
         }

         if (deployment.auth.type === 'anonymous') {
            results[index] = {status: 'not-stored'};
            continue;
         }

         const request = JetBrainsCredentialKey.forDeployment(deployment);

         if (!request) {
            results[index] = {status: 'unsupported', reason: 'No verified credential identifier for this deployment configuration.'};
            continue;
         }

         lookups.push({index, deployment, request});
      }

      if (lookups.length === 0) {
         return results;
      }

      let stored: StoredCredentialResult[];

      try {
         stored = await this.getCredentials(lookups.map(lookup => lookup.request));
      } catch {
         return results;
      }

      for (const [index, lookup] of lookups.entries()) {
         results[lookup.index] = this.deploymentResult(lookup.deployment, stored[index] ?? {status: 'unavailable'});
      }

      return results;
   }

   private deploymentResult(deployment: DeploymentInfo, result: StoredCredentialResult): CredentialResolution {
      if (result.status !== 'available') {
         return result;
      }

      let credentials: DeploymentCredentials;

      if (deployment.auth.type === 'private-key') {
         credentials = {
            type: 'private-key', username: result.credential.username,
            privateKeyPath: deployment.auth.privateKeyPath ?? null,
            passphrase: result.credential.password
         };
      } else {
         credentials = {type: 'password', username: result.credential.username, password: result.credential.password};
      }

      return {status: 'available', credentials: redactSerialization(credentials, ['password', 'passphrase'])};
   }

   public toJSON() {
      return {configPath: this.#context.configPath};
   }

   public [inspect.custom]() {
      return this.toJSON();
   }
}
