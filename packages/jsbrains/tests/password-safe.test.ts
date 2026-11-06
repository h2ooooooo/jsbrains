import {createCipheriv} from 'node:crypto';
import {spawn} from 'node:child_process';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
import {inspect} from 'node:util';
import {describe, expect, it, vi} from 'vitest';
import {JetBrains, DefaultKeePassMasterKeyResolver, JetBrainsCredentialKey, PasswordSafeManager} from '@/index';
import {keepassRuntime} from '@/password-safe/keepassRuntime';
import {fixture, temporaryDirectory, write} from './helpers';

const fakeMaster = 'fixture-master-password';
const fakePassword = 'fixture-deployment-password';
const request = {
   serviceName: 'IntelliJ Platform Remote Credentials ssh://fixture-user@example.invalid:22(password)',
   username: 'fixture-user'
};

function envelope(password: string): Buffer {
   const iv = Buffer.from('00112233445566778899aabbccddeeff', 'hex');
   const cipher = createCipheriv('aes-128-cbc', Buffer.from('Proxy Config Sec'), iv);
   const length = Buffer.alloc(4);
   length.writeInt32BE(iv.length);
   return Buffer.concat([length, iv, cipher.update(password), cipher.final()]);
}

async function databaseFixture(directory: string, version: 3 | 4 = 3, argon2id = false) {
   const runtime = keepassRuntime();
   const database = runtime.Kdbx.create(new runtime.Credentials(runtime.ProtectedValue.fromString(fakeMaster)), 'jsbrains fake fixture');
   database.setVersion(version);

   if (version === 4 && argon2id) {
      database.setKdf(runtime.Consts.KdfId.Argon2id);
   }

   const group = database.createGroup(database.getDefaultGroup(), 'IntelliJ Platform');
   const entry = database.createEntry(group);
   entry.fields.set('Title', request.serviceName);
   entry.fields.set('UserName', request.username);
   entry.fields.set('Password', runtime.ProtectedValue.fromString(fakePassword));
   const keyEntry = database.createEntry(group);
   keyEntry.fields.set('Title', 'IntelliJ Platform Remote Credentials ssh://fixture-key-user@key.example.invalid:2222(passphrase)');
   keyEntry.fields.set('UserName', 'fixture-key-user');
   keyEntry.fields.set('Password', runtime.ProtectedValue.fromString('fixture-key-passphrase'));

   await write(directory, 'c.kdbx', new Uint8Array(await database.save()));
   await write(directory, 'options/security.xml', '<application><component name="PasswordSafe"><option name="PROVIDER" value="KEEPASS" /></component></application>');
}

async function protectForCurrentWindowsUser(bytes: Uint8Array): Promise<Buffer> {
   const script = [
      '$ErrorActionPreference = \'Stop\'',
      'Add-Type -AssemblyName System.Security',
      '$bytes = [Convert]::FromBase64String([Console]::In.ReadToEnd())',
      '$protected = [Security.Cryptography.ProtectedData]::Protect($bytes, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)',
      '[Console]::Out.Write([Convert]::ToBase64String($protected))'
   ].join('\n');

   return new Promise((resolve, reject) => {
      const executable = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
      const child = spawn(executable, ['-NoProfile', '-NonInteractive', '-Command', script], {windowsHide: true, stdio: ['pipe', 'pipe', 'ignore']});
      const chunks: Buffer[] = [];
      child.stdout.on('data', (chunk: Buffer) => chunks.push(chunk));
      child.on('error', () => reject(new Error('Fixture DPAPI helper failed.')));
      child.on('close', code => {
         if (code !== 0) {
            reject(new Error('Fixture DPAPI encryption failed.'));
            return;
         }

         resolve(Buffer.from(Buffer.concat(chunks).toString(), 'base64'));
      });
      child.stdin.end(Buffer.from(bytes).toString('base64'));
   });
}

describe('KeePass Password Safe', () => {
   it.each([3, 4] as const)('opens fake KDBX%s with an explicit master password, and only returns the exact entry', async version => {
      const directory = await temporaryDirectory();
      await databaseFixture(directory, version);
      const safe = new PasswordSafeManager({configPath: directory, platform: 'win32'}, {masterPassword: async () => fakeMaster});
      const before = await stat(path.join(directory, 'c.kdbx'));
      const bytes = await readFile(path.join(directory, 'c.kdbx'));
      const result = await safe.getCredential(request);
      expect(result.status).toBe('available');

      if (result.status === 'available') {
         expect(result.credential.password === fakePassword).toBe(true);
      }

      expect(JSON.stringify(result)).not.toContain(fakePassword);
      expect(inspect(result, {showHidden: true})).not.toContain(fakePassword);

      expect(await safe.getCredential({...request, serviceName: `${request.serviceName}-missing`})).toEqual({status: 'not-stored'});
      expect(await safe.getCredential({...request, username: 'wrong-user'})).toEqual({status: 'not-stored'});
      expect((await stat(path.join(directory, 'c.kdbx'))).mtimeMs).toBe(before.mtimeMs);
      expect((await readFile(path.join(directory, 'c.kdbx'))).equals(bytes)).toBe(true);
   });

   it('opens Argon2id KDBX4 fixtures', async () => {
      const directory = await temporaryDirectory();
      await databaseFixture(directory, 4, true);
      const safe = new PasswordSafeManager({configPath: directory, platform: 'win32'}, {masterPassword: async () => fakeMaster});
      expect((await safe.getCredential(request)).status).toBe('available');
   });

   it('returns a safe locked result for a wrong master password', async () => {
      const directory = await temporaryDirectory();
      await databaseFixture(directory);
      const safe = new PasswordSafeManager({configPath: directory, platform: 'win32'}, {masterPassword: async () => 'fixture-wrong-password'});
      const result = await safe.getCredential(request);
      expect(result.status).toBe('locked');
      expect(JSON.stringify(result)).not.toContain('fixture-wrong-password');
      expect(JSON.stringify(result)).not.toContain(fakePassword);
   });

   it('uses the explicit callback when a recovered key no longer unlocks the database', async () => {
      const directory = await temporaryDirectory();
      await databaseFixture(directory);
      await write(directory, 'c.pwd', `encryption: BUILT_IN\nvalue: !!binary ${envelope('outdated-fake-master').toString('base64')}`);
      const callback = vi.fn(async () => fakeMaster);
      const safe = new PasswordSafeManager({configPath: directory, platform: 'win32'}, {masterPassword: callback});
      expect((await safe.getCredential(request)).status).toBe('available');
      expect(callback).toHaveBeenCalledTimes(1);
   });

   it('discovers custom database paths while retaining c.pwd in the IDE config directory', async () => {
      const directory = await temporaryDirectory();
      const custom = await temporaryDirectory();
      await databaseFixture(custom);
      await write(directory, 'options/security.xml', `<application><component name="PasswordSafe"><option name="PROVIDER" value="KEEPASS" /><option name="keepassDb" value="${custom}/c.kdbx" /></component></application>`);
      const safe = new PasswordSafeManager({configPath: directory, platform: 'win32'}, {masterPassword: async () => fakeMaster});
      expect((await safe.getInfo()).databasePath).toBe(path.join(custom, 'c.kdbx'));
      expect((await safe.getInfo()).mainKeyPath).toBe(path.join(directory, 'c.pwd'));
      expect((await safe.getCredential(request)).status).toBe('available');
   });

   it('reports memory-only, missing, native-keychain and master-password-required states', async () => {
      const directory = await temporaryDirectory();
      const safe = new PasswordSafeManager({configPath: directory, platform: 'win32'});
      expect(await safe.getCredential(request)).toEqual({status: 'not-stored'});
      await databaseFixture(directory);
      expect(await safe.getCredential(request)).toEqual({status: 'master-password-required'});
      await write(directory, 'options/security.xml', '<application><component name="PasswordSafe"><option name="PROVIDER" value="MEMORY_ONLY" /></component></application>');
      expect(await safe.getCredential(request)).toEqual({status: 'not-stored'});
      await write(directory, 'options/security.xml', '<application><component name="PasswordSafe"><option name="PROVIDER" value="KEYCHAIN" /></component></application>');
      const mac = new PasswordSafeManager({configPath: directory, platform: 'darwin'});
      expect((await mac.getCredential(request)).status).toBe('unsupported');
      expect((await safe.getInfo()).provider).toBe('KEEPASS');
   });

   it('automatically reads the current built-in envelope and supports legacy pdb.pwd', async () => {
      const directory = await temporaryDirectory();
      await databaseFixture(directory);
      const data = envelope(fakeMaster);
      await write(directory, 'c.pwd', `encryption: BUILT_IN\nisAutoGenerated: true\nvalue: !!binary ${data.toString('base64')}`);
      const safe = new PasswordSafeManager({configPath: directory, platform: 'linux'});
      expect((await safe.getCredential(request)).status).toBe('available');

      const legacy = await temporaryDirectory();
      await databaseFixture(legacy);
      await write(legacy, 'pdb.pwd', data);
      expect((await new PasswordSafeManager({configPath: legacy, platform: 'linux'}).getCredential(request)).status).toBe('available');
   });

   it('returns PGP/unsupported statuses and allows an explicit password fallback', async () => {
      const directory = await temporaryDirectory();
      await databaseFixture(directory);
      await write(directory, 'c.pwd', 'encryption: PGP_KEY\nvalue: !!binary ZmFrZQ==');
      const safe = new PasswordSafeManager({configPath: directory, platform: 'win32'});
      expect(await safe.getCredential(request)).toEqual({status: 'pgp-required'});
      const fallback = new PasswordSafeManager({configPath: directory, platform: 'win32'}, {masterPassword: async () => fakeMaster});
      expect((await fallback.getCredential(request)).status).toBe('available');
      await write(directory, 'c.pwd', 'encryption: FUTURE_CIPHER\nvalue: !!binary ZmFrZQ==');
      expect((await safe.getCredential(request)).status).toBe('unsupported');
   });

   it('rejects malformed envelopes without exposing encoded values', async () => {
      const directory = await temporaryDirectory();
      await write(directory, 'c.pwd', 'encryption: BUILT_IN\nvalue: !!binary Zml4dHVyZS1zZWNyZXQ=');
      const result = await new DefaultKeePassMasterKeyResolver().resolve({configPath: directory, mainKeyPath: path.join(directory, 'c.pwd'), databasePath: path.join(directory, 'c.kdbx'), platform: 'linux'});
      expect(result.status).toBe('locked');
      expect(JSON.stringify(result)).not.toContain('Zml4dHVyZS1zZWNyZXQ=');
   });

   it.skipIf(process.platform !== 'win32')('unlocks a generated JetBrains-format DPAPI + AES + KDBX fixture without prompting', async () => {
      const directory = await temporaryDirectory();
      await databaseFixture(directory);
      const protectedData = await protectForCurrentWindowsUser(envelope(fakeMaster));
      await write(directory, 'c.pwd', `encryption: CRYPT_32\nisAutoGenerated: true\nvalue: !!binary ${protectedData.toString('base64')}`);
      const prompt = vi.fn(async () => null);
      const safe = new PasswordSafeManager({configPath: directory, platform: 'win32'}, {masterPassword: prompt});
      expect((await safe.getCredential(request)).status).toBe('available');
      expect(prompt).not.toHaveBeenCalled();
   });

   it('resolves deployment passwords and key passphrases lazily without changing serialization', async () => {
      const directory = await temporaryDirectory();
      await databaseFixture(directory);
      const projectPath = await temporaryDirectory();

      for (const filename of ['webServers.xml', 'sshConfigs.xml', 'deployment.xml']) {
         await write(projectPath, `.idea/${filename}`, await fixture(`deployment/${filename}`));
      }

      const prompt = vi.fn(async () => fakeMaster);
      const installation = await JetBrains.fromConfigPath(directory, {passwordSafe: {masterPassword: prompt}});
      const project = await installation.getProject(projectPath);
      const deployment = await project.deployments.get('Production & Main');
      expect(prompt).not.toHaveBeenCalled();
      const json = JSON.stringify(deployment);
      expect(JetBrainsCredentialKey.forDeployment(deployment!)?.serviceName).toBe(request.serviceName);
      const credentials = await deployment?.getCredentials();
      expect(credentials?.type).toBe('password');

      if (credentials?.type === 'password') {
         expect(credentials.password === fakePassword).toBe(true);
      }

      expect(JSON.stringify(credentials)).not.toContain(fakePassword);
      expect(inspect(credentials, {showHidden: true})).not.toContain(fakePassword);

      const key = await project.deployments.get('Key server');
      const keyCredentials = await key?.getCredentials();
      expect(keyCredentials?.type).toBe('private-key');

      if (keyCredentials?.type === 'private-key') {
         expect(keyCredentials.passphrase === 'fixture-key-passphrase').toBe(true);
      }

      expect(JSON.stringify(deployment)).toBe(json);
      expect(inspect(deployment, {showHidden: true})).not.toContain(fakePassword);
      expect(inspect(installation.passwordSafe, {showHidden: true})).not.toContain(fakeMaster);
      expect((await (await project.deployments.get('FTP'))?.credentials.resolve())?.status).toBe('unsupported');
   });
});
