import path from 'node:path';
import {mkdtemp, mkdir, readFile, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {createCipheriv} from 'node:crypto';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {runCli} from '@cli/run';
import {credentialOutput} from '@cli/credentials';
import {keepassRuntime} from '@/password-safe/keepassRuntime';

const directories: string[] = [];
const fakeMaster = 'fake-cli-master';
const fakeSecret = 'fake-cli-password';

afterEach(async () => {
   for (const directory of directories.splice(0)) {
      await rm(directory, {recursive: true, force: true});
   }
});

async function setup() {
   const directory = await mkdtemp(path.join(tmpdir(), 'jsbrains-cli-'));
   directories.push(directory);
   const config = path.join(directory, 'PhpStorm2026.2');
   const project = path.join(directory, 'project with spaces');
   await mkdir(path.join(config, 'options'), {recursive: true});
   await mkdir(path.join(project, '.idea'), {recursive: true});

   for (const filename of ['webServers.xml', 'sshConfigs.xml', 'deployment.xml']) {
      const fixture = await readFile(new URL(`../../jsbrains/tests/fixtures/deployment/${filename}`, import.meta.url), 'utf8');
      await writeFile(path.join(project, '.idea', filename), fixture);
   }

   const runtime = keepassRuntime();
   const database = runtime.Kdbx.create(new runtime.Credentials(runtime.ProtectedValue.fromString(fakeMaster)), 'fake CLI fixture');
   database.setVersion(3);
   const group = database.createGroup(database.getDefaultGroup(), 'IntelliJ Platform');
   const entry = database.createEntry(group);
   entry.fields.set('Title', 'IntelliJ Platform Remote Credentials ssh://fixture-user@example.invalid:22(password)');
   entry.fields.set('UserName', 'fixture-user');
   entry.fields.set('Password', runtime.ProtectedValue.fromString(fakeSecret));
   await writeFile(path.join(config, 'c.kdbx'), new Uint8Array(await database.save()));
   await writeFile(path.join(config, 'options', 'security.xml'), '<application><component name="PasswordSafe"><option name="PROVIDER" value="KEEPASS" /></component></application>');
   return {directory, config, project};
}

async function invoke(arguments_: string[], cwd: string, options: {env?: NodeJS.ProcessEnv; stdin?: string; tty?: boolean} = {}) {
   let stdout = '';
   let stderr = '';
   const readStdin = vi.fn(async () => options.stdin ?? '');
   const exitCode = await runCli(arguments_, {
      cwd, env: options.env ?? {}, stdinIsTTY: options.tty ?? false, stdoutIsTTY: options.tty ?? false,
      readStdin,
      stdout: text => {
         stdout += text;
      },
      stderr: text => {
         stderr += text;
      }
   });

   return {stdout, stderr, exitCode, readStdin};
}

describe('CLI contract', () => {
   it('offers colored help, plain piped output and JSON version/help', async () => {
      const directory = (await setup()).directory;
      const plain = await invoke(['--help'], directory);
      expect(plain.exitCode).toBe(0);
      expect(plain.stdout).toContain('jsbrains [command]');
      expect(plain.stdout).not.toContain('\u001b');
      expect((await invoke(['--help', '--color'], directory)).stdout).toContain('\u001b');
      const version = await invoke(['--version', '--json', '--color'], directory, {env: {FORCE_COLOR: '1'}});
      expect(JSON.parse(version.stdout)).toMatchObject({schemaVersion: 1, command: 'version', data: {name: '@jalsoedesign/jsbrains-cli'}});
      expect(version.stdout).not.toContain('\u001b');
      expect(version.stderr).toBe('');
      expect(JSON.parse((await invoke(['help', '--json'], directory)).stdout).data.commands.credentials).toBeDefined();
   });

   it.each([
      ['nonsense', '--json'], ['deployments', '--bogus', '--json'], ['credentials', '--json'],
      ['deployments', '--show-secrets', '--json'], ['deployments', '--scope', 'bad', '--json'],
      ['credentials', '--all', '--name', 'Production', '--json'],
      ['deployments', '--config', 'one', '--config', 'two', '--json'],
      ['deployments', '--config', 'one', '--product', 'PhpStorm', '--json']
   ])('reports invalid arguments as JSON on stderr: %j', async (...arguments_: string[]) => {
      const result = await invoke(arguments_, (await setup()).directory);
      expect(result.exitCode).toBe(2);
      expect(result.stdout).toBe('');
      expect(JSON.parse(result.stderr).error.code).toBeDefined();
   });

   it('supports a bare --json overview and explicit installation listing', async () => {
      const {config, project} = await setup();
      const overview = await invoke(['--json', '--config', config], project);
      expect(overview.exitCode).toBe(0);
      expect(JSON.parse(overview.stdout).data.projectDeployments).toHaveLength(6);
      const pretty = await invoke(['--config', config], project);
      expect(pretty.stdout).not.toContain('resolve:');
      const installations = await invoke(['installations', '--config', config, '--json'], project);
      expect(JSON.parse(installations.stdout).data[0].product).toBe('PhpStorm');
   });

   it('lists deployments without resolving secrets and resolves nested project paths', async () => {
      const {config, project} = await setup();
      const nested = path.join(project, 'src', 'nested');
      await mkdir(nested, {recursive: true});
      const result = await invoke(['deployments', '--config', config, '--json'], nested);
      expect(result.exitCode).toBe(0);
      expect(result.readStdin).not.toHaveBeenCalled();
      const data = JSON.parse(result.stdout).data;
      expect(data.project).toBe(project);
      expect(data.deployments).toHaveLength(6);
      expect(data.deployments[0].credentials).toBeUndefined();
      const pretty = await invoke(['deployments', '--config', config, '--color'], nested);
      expect(pretty.stdout).toContain('Production & Main');
      expect(pretty.stdout).toContain('SFTP');
      expect(pretty.stdout).toContain('\u001b');
      expect(pretty.stdout).not.toContain(fakeSecret);
   });

   it('tests a real fake-database lookup and exposes secrets only with an explicit flag', async () => {
      const {config, project} = await setup();
      const arguments_ = ['credentials', 'Production & Main', '--config', config, '--master-password-env', 'FIXTURE_MASTER', '--json'];
      const env = {FIXTURE_MASTER: fakeMaster};
      const result = await invoke(arguments_, project, {env});
      expect(result.exitCode).toBe(0);
      expect(JSON.parse(result.stdout).data.summary).toMatchObject({available: 1, unavailable: 0, secretsRetrieved: 1});
      expect(JSON.parse(result.stdout).data.results[0].credentials.passwordStored).toBe(true);
      expect(result.stdout).not.toContain(fakeSecret);
      expect(result.stderr).not.toContain(fakeMaster);
      const revealed = await invoke([...arguments_, '--show-secrets'], project, {env});
      expect(JSON.parse(revealed.stdout).data.results[0].credentials.password === fakeSecret).toBe(true);
   });

   it('accepts piped master passwords, strips only one newline, and does not prompt', async () => {
      const {config, project} = await setup();
      const arguments_ = ['credentials', '--id', 'password-server', '--config', config, '--master-password-stdin', '--json'];
      const result = await invoke(arguments_, project, {stdin: `${fakeMaster}\r\n`});
      expect(result.exitCode).toBe(0);
      expect(result.readStdin).toHaveBeenCalledTimes(1);
      const terminal = await invoke(arguments_, project, {tty: true});
      expect(terminal.exitCode).toBe(2);
      expect(JSON.parse(terminal.stderr).error.code).toBe('MASTER_PASSWORD_INPUT');
   });

   it('reports unsuccessful retrieval with exit 3 and preserves metadata with --credentials', async () => {
      const {config, project} = await setup();
      const result = await invoke(['credentials', '--all', '--config', config, '--json'], project);
      expect(result.exitCode).toBe(3);
      expect(result.stderr).toBe('');
      expect(JSON.parse(result.stdout).data.results[0].status).toBe('master-password-required');
      const metadata = await invoke(['deployments', '--credentials', '--config', config, '--json'], project);
      expect(metadata.exitCode).toBe(0);
      expect(JSON.parse(metadata.stdout).data.deployments[0].credentials.status).toBe('master-password-required');
   });

   it('does not claim that OpenSSH availability means a secret was retrieved', () => {
      const result = credentialOutput({status: 'available', credentials: {type: 'open-ssh', username: 'fixture', password: null, passphrase: null}}, false);
      expect(result.secretRetrieved).toBe(false);
   });

   it('retrieves a fake key passphrase and retains empty stored passwords', () => {
      const key = credentialOutput({status: 'available', credentials: {type: 'private-key', username: 'fixture', privateKeyPath: '/fake/key', passphrase: fakeSecret}}, false);
      expect(key.secretRetrieved).toBe(true);
      expect(JSON.stringify(key)).not.toContain(fakeSecret);
      const empty = credentialOutput({status: 'available', credentials: {type: 'password', username: 'fixture', password: ''}}, false);
      expect(empty.secretRetrieved).toBe(true);
   });

   it('rejects ambiguous deployment matches before requesting credentials', async () => {
      const {config, project} = await setup();
      const globals = await readFile(new URL('../../jsbrains/tests/fixtures/deployment/global.xml', import.meta.url), 'utf8');
      await writeFile(path.join(config, 'options', 'webServers.xml'), globals);
      const arguments_ = ['credentials', 'Production & Main', '--config', config, '--master-password-stdin', '--json'];
      const result = await invoke(arguments_, project);
      expect(result.exitCode).toBe(2);
      expect(JSON.parse(result.stderr).error.code).toBe('AMBIGUOUS_DEPLOYMENT');
      expect(result.readStdin).not.toHaveBeenCalled();
      const selected = await invoke([...arguments_, '--scope', 'project'], project, {stdin: fakeMaster});
      expect(selected.exitCode).toBe(0);
   });

   it('reads settings, project state, recent projects and Password Safe metadata', async () => {
      const {config, project} = await setup();
      for (const command of ['settings', 'project', 'projects', 'password-safe']) {
         const result = await invoke([command, '--config', config, '--project', project, '--json'], project);
         expect(result.exitCode).toBe(0);
         expect(JSON.parse(result.stdout).data).toBeDefined();
      }

      const settings = await invoke(['settings', 'deployment.xml', '--config', config, '--json'], project);
      expect(JSON.parse(settings.stdout).data.parsed.project).toBeDefined();
      const missing = await invoke(['settings', 'missing.xml', '--config', config, '--json'], project);
      expect(missing.exitCode).toBe(2);
   });

   it('redacts recognized XML secrets and gives safe malformed-file errors', async () => {
      const {config, project} = await setup();
      await writeFile(path.join(project, '.idea', 'secret.xml'), `<project password="${fakeSecret}"><option name="token" value="${fakeSecret}" /></project>`);
      const result = await invoke(['settings', 'secret.xml', '--config', config, '--json'], project);
      expect(result.stdout).not.toContain(fakeSecret);
      await writeFile(path.join(project, '.idea', 'deployment.xml'), `<project secret="${fakeSecret}"><broken></project>`);
      const error = await invoke(['deployments', '--config', config, '--json'], project);
      expect(error.exitCode).toBe(1);
      expect(error.stdout).toBe('');
      expect(error.stderr).not.toContain(fakeSecret);
   });

   it('handles automatic bootstrap unlocking without reading supplied stdin', async () => {
      const {config, project} = await setup();
      const iv = Buffer.alloc(16, 7);
      const length = Buffer.alloc(4);
      length.writeInt32BE(16);
      const cipher = createCipheriv('aes-128-cbc', Buffer.from('Proxy Config Sec'), iv);
      const data = Buffer.concat([length, iv, cipher.update(fakeMaster), cipher.final()]);
      await writeFile(path.join(config, 'c.pwd'), `encryption: BUILT_IN\nvalue: !!binary ${data.toString('base64')}`);
      const result = await invoke(['credentials', 'Production & Main', '--config', config, '--master-password-stdin', '--json'], project);
      expect(result.exitCode).toBe(0);
      expect(result.readStdin).not.toHaveBeenCalled();
   });

   it('selects global deployments outside a project and rejects nonexistent projects', async () => {
      const {directory, config} = await setup();
      const globals = await readFile(new URL('../../jsbrains/tests/fixtures/deployment/global.xml', import.meta.url), 'utf8');
      await writeFile(path.join(config, 'options', 'webServers.xml'), globals);
      const result = await invoke(['deployments', '--config', config, '--json'], directory);
      expect(result.exitCode).toBe(0);
      expect(JSON.parse(result.stdout).data.project).toBeNull();
      expect(JSON.parse(result.stdout).data.deployments).toHaveLength(1);
      const missing = await invoke(['deployments', '--config', config, '--project', path.join(directory, 'missing'), '--json'], directory);
      expect(missing.exitCode).toBe(2);
      expect(JSON.parse(missing.stderr).error.code).toBe('PROJECT_NOT_FOUND');
   });

   it('honors NO_COLOR and --no-color, including when FORCE_COLOR is set', async () => {
      const directory = (await setup()).directory;
      const disabled = await invoke(['help'], directory, {tty: true, env: {NO_COLOR: '1'}});
      expect(disabled.stdout).not.toContain('\u001b');
      const forcedOff = await invoke(['help', '--no-color'], directory, {env: {FORCE_COLOR: '1'}});
      expect(forcedOff.stdout).not.toContain('\u001b');
   });

   it('lists setting names even when an unrelated XML file is malformed', async () => {
      const {config, project} = await setup();
      await writeFile(path.join(project, '.idea', 'broken.xml'), '<project secret="fake-unread-value"><broken></project>');
      const result = await invoke(['settings', '--config', config, '--json'], project);
      expect(result.exitCode).toBe(0);
      expect(JSON.parse(result.stdout).data.files).toContainEqual({filename: 'broken.xml', path: path.join(project, '.idea', 'broken.xml'), exists: true});
      expect(result.stdout).not.toContain('fake-unread-value');
      const read = await invoke(['settings', 'broken.xml', '--config', config, '--json'], project);
      expect(read.exitCode).toBe(1);
   });

   it('allows project metadata with multiple IDE products while keeping explicit selectors strict', async () => {
      const {directory, project} = await setup();
      const env = {APPDATA: path.join(directory, 'roaming'), LOCALAPPDATA: path.join(directory, 'local'), XDG_CONFIG_HOME: path.join(directory, 'xdg'), XDG_CACHE_HOME: path.join(directory, 'cache')};
      const {JetBrains, JetBrainsInstallation} = await import('@jalsoedesign/jsbrains');
      const detected = [
         new JetBrainsInstallation({product: 'PhpStorm', version: '2026.2', configPath: path.join(directory, 'PhpStorm2026.2'), systemPath: null, platform: process.platform, detected: true}),
         new JetBrainsInstallation({product: 'WebStorm', version: '2026.2', configPath: path.join(directory, 'WebStorm2026.2'), systemPath: null, platform: process.platform, detected: true})
      ];
      const jetBrains = await JetBrains.detect({platform: 'linux', homePath: directory, env: {}});
      const installations = vi.spyOn(jetBrains, 'getInstallations').mockResolvedValue(detected);
      const detect = vi.spyOn(JetBrains, 'detect').mockResolvedValue(jetBrains);
      try {
         for (const command of [['project'], ['settings', 'deployment.xml'], ['deployments', '--scope', 'project']]) {
            const result = await invoke([...command, '--project', project, '--json'], directory, {env});
            expect(result.exitCode).toBe(0);
            expect(result.stderr).toBe('');
            const selected = await invoke([...command, '--product', 'MissingIDE', '--json'], project, {env});
            expect(selected.exitCode).toBe(2);
            expect(JSON.parse(selected.stderr).error.code).toBe('INSTALLATION_NOT_FOUND');
            const ambiguous = await invoke([...command, '--ide-version', '2026.2', '--json'], project, {env});
            expect(ambiguous.exitCode).toBe(2);
            expect(JSON.parse(ambiguous.stderr).error.code).toBe('AMBIGUOUS_INSTALLATION');
         }
         for (const command of [['settings', '--global'], ['deployments'], ['credentials', '--all', '--scope', 'project']]) {
            const result = await invoke([...command, '--json'], project, {env});
            expect(result.exitCode).toBe(2);
            expect(JSON.parse(result.stderr).error.code).toBe('AMBIGUOUS_INSTALLATION');
         }
      } finally {
         detect.mockRestore();
         installations.mockRestore();
      }
   });

   it('opens KeePass only once for a CLI credential batch', async () => {
      const {config, project} = await setup();
      const load = vi.spyOn(keepassRuntime().Kdbx, 'load');

      try {
         const result = await invoke(['credentials', '--all', '--config', config, '--master-password-env', 'FIXTURE_MASTER', '--json'], project, {env: {FIXTURE_MASTER: fakeMaster}});
         const data = JSON.parse(result.stdout).data;
         expect(data.results).toHaveLength(6);
         expect(data.results[0].status).toBe('available');
         expect(data.results[1].status).toBe('not-stored');
         expect(data.results[2].status).toBe('available');
         expect(load).toHaveBeenCalledTimes(1);
         expect(result.stdout).not.toContain(fakeSecret);
      } finally {
         load.mockRestore();
      }
   });

});
