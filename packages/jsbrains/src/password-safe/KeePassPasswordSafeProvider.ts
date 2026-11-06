import {readFile} from 'node:fs/promises';
import {inspect} from 'node:util';
import type {Credentials, Kdbx, KdbxGroup, ProtectedValue} from 'kdbxweb';
import {keepassRuntime} from '@/password-safe/keepassRuntime';
import {DefaultKeePassMasterKeyResolver} from '@/password-safe/KeePassMasterKeyResolver';
import {validateKeePassKdf} from '@/password-safe/validateKeePassKdf';
import {redactSerialization} from '@/util/secrets';
import type {CredentialRequest, KeePassContext, KeePassMasterKeyResult, PasswordSafeOptions, PasswordSafeProvider, StoredCredentialResult} from '@/password-safe/types';

export class KeePassPasswordSafeProvider implements PasswordSafeProvider {
   #context: KeePassContext;
   #options: PasswordSafeOptions;

   public constructor(context: KeePassContext, options: PasswordSafeOptions = {}) {
      this.#context = context;
      this.#options = options;
   }

   public async canHandle(): Promise<boolean> {
      return true;
   }

   public async getCredential(request: CredentialRequest): Promise<StoredCredentialResult> {
      return (await this.getCredentials([request]))[0]!;
   }

   public async getCredentials(requests: readonly CredentialRequest[]): Promise<StoredCredentialResult[]> {
      if (requests.length === 0) {
         return [];
      }

      const resolver = this.#options.masterKeyResolver ?? new DefaultKeePassMasterKeyResolver();
      let key: KeePassMasterKeyResult;

      try {
         key = await resolver.resolve(this.#context);
      } catch {
         key = {status: 'unavailable'};
      }

      let results: StoredCredentialResult[];

      if (key.status === 'resolved') {
         const ownedKey = Uint8Array.from(key.password);

         if (!this.#options.masterKeyResolver) {
            key.password.fill(0);
         }

         results = await this.readCredentials(requests, ownedKey);
      } else {
         const unavailable = key;
         results = requests.map(() => unavailable);
      }

      const mayRetry = results.some(result => ['locked', 'master-password-required', 'pgp-required', 'unsupported', 'unavailable'].includes(result.status));

      if (!mayRetry || !this.#options.masterPassword) {
         return results;
      }

      try {
         const supplied = await this.#options.masterPassword({...this.#context});

         if (supplied === null) {
            return results;
         }

         return this.readCredentials(requests, Buffer.from(supplied, 'utf8'));
      } catch {
         return requests.map(() => ({status: 'unavailable'}));
      }
   }

   private async readCredentials(requests: readonly CredentialRequest[], key: Uint8Array): Promise<StoredCredentialResult[]> {
      const runtime = keepassRuntime();
      const password = runtime.ProtectedValue.fromBinary(Uint8Array.from(key).buffer);
      key.fill(0);
      let database: Kdbx | undefined;
      let credentials: Credentials | undefined;

      try {
         const bytes = await readFile(this.#context.databasePath);
         const data = Uint8Array.from(bytes).buffer;
         validateKeePassKdf(data);
         credentials = new runtime.Credentials(password);
         database = await runtime.Kdbx.load(data, credentials);
         const group = database.getDefaultGroup().groups.find(value => value.name === 'IntelliJ Platform');

         if (!group) {
            return requests.map(() => ({status: 'not-stored'}));
         }

         return requests.map(request => this.findCredential(group, request));
      } catch (error) {
         if (error instanceof runtime.KdbxError && error.code === runtime.Consts.ErrorCodes.Unsupported) {
            return requests.map(() => ({status: 'unsupported', reason: 'Unsupported KeePass format or KDF parameters.'}));
         }

         return requests.map(() => ({status: 'locked', reason: 'Could not open the KeePass database; check the master password and file integrity.'}));
      } finally {
         if (credentials) {
            await credentials.ready.catch(() => undefined);
            this.clearProtectedValue(credentials.passwordHash);
            this.clearProtectedValue(credentials.keyFileHash);
         }

         this.clearProtectedValue(password);

         if (database) {
            this.disposeDatabase(database);
         }
      }
   }

   private findCredential(group: KdbxGroup, request: CredentialRequest): StoredCredentialResult {
      const runtime = keepassRuntime();

      function field(value: string | ProtectedValue | undefined) {
         if (value instanceof runtime.ProtectedValue) {
            return value.getText();
         }

         return value ?? null;
      }

      const entry = group.entries.find(value => {
         const matchesTitle = field(value.fields.get('Title')) === request.serviceName;
         const matchesUser = !request.username || field(value.fields.get('UserName')) === request.username;
         return matchesTitle && matchesUser;
      });

      if (!entry || !entry.fields.has('Password')) {
         return {status: 'not-stored'};
      }

      return {
         status: 'available',
         credential: redactSerialization({
            username: field(entry.fields.get('UserName')),
            password: field(entry.fields.get('Password'))
         }, ['password'])
      };
   }

   private clearProtectedValue(value: ProtectedValue | undefined) {
      value?.value.fill(0);
      value?.salt.fill(0);
   }

   private disposeDatabase(database: Kdbx) {
      const runtime = keepassRuntime();

      for (const group of database.groups) {
         for (const entry of group.allEntries()) {
            for (const version of [entry, ...entry.history]) {
               for (const value of version.fields.values()) {
                  if (value instanceof runtime.ProtectedValue) {
                     this.clearProtectedValue(value);
                  }
               }
            }
         }
      }

      database.groups.length = 0;
      database.xml = undefined;
   }

   public toJSON() {
      return {provider: 'KeePass'};
   }

   public [inspect.custom]() {
      return this.toJSON();
   }
}
