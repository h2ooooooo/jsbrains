import {afterEach, describe, expect, it, vi} from 'vitest';
import type {Credentials, Kdbx, ProtectedValue} from 'kdbxweb';
import {JetBrains, PasswordSafeManager} from '@/index';
import type {CredentialRequest, StoredCredentialResult} from '@/password-safe/types';
import {keepassRuntime} from '@/password-safe/keepassRuntime';
import {fixture, temporaryDirectory, write} from './helpers';

const master = 'synthetic-batch-master';
const requests: CredentialRequest[] = [
   {serviceName: 'IntelliJ Platform Remote Credentials ssh://fixture-user@example.invalid:22(password)', username: 'fixture-user'},
   {serviceName: 'IntelliJ Platform Remote Credentials ssh://fixture-key-user@key.example.invalid:2222(passphrase)', username: 'fixture-key-user'}
];

afterEach(() => {
   vi.restoreAllMocks();
});

async function setup(version: 3 | 4 = 3) {
   const directory = await temporaryDirectory();
   const runtime = keepassRuntime();
   const database = runtime.Kdbx.create(new runtime.Credentials(runtime.ProtectedValue.fromString(master)), 'synthetic batch fixture');
   database.setVersion(version);
   const group = database.createGroup(database.getDefaultGroup(), 'IntelliJ Platform');

   for (const [index, request] of requests.entries()) {
      const entry = database.createEntry(group);
      entry.fields.set('Title', request.serviceName);
      entry.fields.set('UserName', request.username!);
      entry.fields.set('Password', runtime.ProtectedValue.fromString(`synthetic-secret-${index}`));
   }

   await write(directory, 'c.kdbx', new Uint8Array(await database.save()));
   await write(directory, 'options/security.xml', '<application><component name="PasswordSafe"><option name="PROVIDER" value="KEEPASS" /></component></application>');
   return directory;
}

describe('scoped Password Safe batches', () => {
   it.each([3, 4] as const)('unlocks KDBX%s once per batch, preserves order and clears session buffers', async version => {
      const directory = await setup(version);
      const runtime = keepassRuntime();
      const originalLoad = runtime.Kdbx.load;
      const databases: Kdbx[] = [];
      const protectedValues: ProtectedValue[] = [];
      const load = vi.spyOn(runtime.Kdbx, 'load').mockImplementation(async (...arguments_) => {
         const database = await originalLoad(...arguments_);
         databases.push(database);

         if (database.credentials.passwordHash) {
            protectedValues.push(database.credentials.passwordHash);
         }

         for (const entry of database.getDefaultGroup().allEntries()) {
            for (const value of entry.fields.values()) {
               if (value instanceof runtime.ProtectedValue) {
                  protectedValues.push(value);
               }
            }
         }

         return database;
      });
      const prompt = vi.fn(async () => master);
      const safe = new PasswordSafeManager({configPath: directory, platform: 'win32'}, {masterPassword: prompt});
      const batch = await safe.getCredentials([requests[1]!, {serviceName: 'missing', username: null}, requests[0]!]);
      expect(batch.map(result => result.status)).toEqual(['available', 'not-stored', 'available']);
      expect(batch[0]).toMatchObject({credential: {password: 'synthetic-secret-1'}});
      expect(batch[2]).toMatchObject({credential: {password: 'synthetic-secret-0'}});
      expect(load).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledTimes(1);
      expect(JSON.stringify(batch)).not.toContain('synthetic-secret');
      expect(databases[0]?.groups).toHaveLength(0);
      expect(protectedValues.length).toBeGreaterThan(0);
      expect(protectedValues.every(value => value.value.every(byte => byte === 0) && value.salt.every(byte => byte === 0))).toBe(true);

      expect((await safe.getCredential(requests[0]!)).status).toBe('available');
      expect(load).toHaveBeenCalledTimes(2);
      expect(prompt).toHaveBeenCalledTimes(2);
   });

   it('preserves a custom resolver-owned key across repeated lookups', async () => {
      const directory = await setup();
      const callerKey = Buffer.from(master);
      const originalKey = Buffer.from(callerKey);
      const resolver = {resolve: vi.fn(async () => ({status: 'resolved' as const, password: callerKey}))};
      const safe = new PasswordSafeManager({configPath: directory, platform: 'win32'}, {masterKeyResolver: resolver});
      expect((await safe.getCredential(requests[0]!)).status).toBe('available');
      expect(callerKey.equals(originalKey)).toBe(true);
      expect((await safe.getCredential(requests[1]!)).status).toBe('available');
      expect(callerKey.equals(originalKey)).toBe(true);
   });

   it('resolves mixed deployment types in order and skips unlocking when no secret is needed', async () => {
      const directory = await setup();
      const projectPath = await temporaryDirectory();

      for (const filename of ['webServers.xml', 'sshConfigs.xml', 'deployment.xml']) {
         await write(projectPath, `.idea/${filename}`, await fixture(`deployment/${filename}`));
      }

      const prompt = vi.fn(async () => master);
      const installation = await JetBrains.fromConfigPath(directory, {passwordSafe: {masterPassword: prompt}});
      const project = await installation.getProject(projectPath);
      const deployments = await project.deployments.getAll({includeGlobal: false});
      const results = await installation.passwordSafe.resolveDeployments(deployments);
      expect(results.map(result => result.status)).toEqual(['available', 'available', 'available', 'unsupported', 'unsupported', 'unsupported']);
      expect(results[0]).toMatchObject({credentials: {type: 'password', password: 'synthetic-secret-0'}});
      expect(results[1]).toMatchObject({credentials: {type: 'private-key', passphrase: 'synthetic-secret-1'}});
      expect(prompt).toHaveBeenCalledTimes(1);
      prompt.mockClear();
      await installation.passwordSafe.resolveDeployments(deployments.filter(deployment => ['open-ssh', 'unknown'].includes(deployment.auth.type)));
      expect(prompt).not.toHaveBeenCalled();
      expect(await installation.passwordSafe.getCredentials([])).toEqual([]);
      expect(prompt).not.toHaveBeenCalled();
   });

   it('keeps legacy custom providers serial and isolates per-request failures', async () => {
      const directory = await temporaryDirectory();
      let active = 0;
      let maximumActive = 0;
      const provider = {
         canHandle: vi.fn(async () => true),
         getCredential: vi.fn(async (request: CredentialRequest): Promise<StoredCredentialResult> => {
            active++;
            maximumActive = Math.max(maximumActive, active);
            await Promise.resolve();
            active--;

            if (request.serviceName === 'missing') {
               throw new Error('Synthetic provider failure');
            }

            return {status: 'available', credential: {username: request.username, password: null}};
         })
      };
      const safe = new PasswordSafeManager({configPath: directory, platform: 'win32'}, {provider});
      const results = await safe.getCredentials([requests[0]!, {serviceName: 'missing', username: null}, requests[1]!]);
      expect(results.map(result => result.status)).toEqual(['available', 'unavailable', 'available']);
      expect(maximumActive).toBe(1);
      expect(provider.canHandle).toHaveBeenCalledTimes(1);
      expect(provider.getCredential).toHaveBeenCalledTimes(3);
   });

   it('returns unavailable results for a cancelled batch without retrying per request', async () => {
      const directory = await setup();
      const prompt = vi.fn(async () => null);
      const safe = new PasswordSafeManager({configPath: directory, platform: 'win32'}, {masterPassword: prompt});
      expect((await safe.getCredentials(requests)).map(result => result.status)).toEqual(['master-password-required', 'master-password-required']);
      expect(prompt).toHaveBeenCalledTimes(1);
   });
   it('clears credential hashes after a failed batch unlock', async () => {
      const directory = await setup();
      const runtime = keepassRuntime();
      const originalLoad = runtime.Kdbx.load;
      let credentials: Credentials | undefined;
      const load = vi.spyOn(runtime.Kdbx, 'load').mockImplementation(async (...arguments_) => {
         credentials = arguments_[1];
         return originalLoad(...arguments_);
      });
      const prompt = vi.fn(async () => 'synthetic-wrong-master');
      const safe = new PasswordSafeManager({configPath: directory, platform: 'win32'}, {masterPassword: prompt});
      const results = await safe.getCredentials(requests);
      expect(results.map(result => result.status)).toEqual(['locked', 'locked']);
      expect(load).toHaveBeenCalledTimes(1);
      expect(prompt).toHaveBeenCalledTimes(1);
      expect(credentials?.passwordHash).toBeDefined();
      expect(credentials?.passwordHash?.value.every(byte => byte === 0)).toBe(true);
      expect(credentials?.passwordHash?.salt.every(byte => byte === 0)).toBe(true);
   });

});
