import {spawnSync} from 'node:child_process';
import {mkdtemp, mkdir, writeFile, rm, readFile} from 'node:fs/promises';
import path from 'node:path';
import {tmpdir} from 'node:os';
import {keepassRuntime} from '@/password-safe/keepassRuntime';

const npmCli = process.env.npm_execpath;

if (!npmCli) {
   throw new Error('Run this verification through npm run test:package.');
}

const temporary = await mkdtemp(path.join(tmpdir(), 'jsbrains-package-'));

function runNode(arguments_: string[], cwd: string, env = process.env) {
   const result = spawnSync(process.execPath, arguments_, {cwd, encoding: 'utf8', windowsHide: true, env});

   if (result.status !== 0) {
      throw new Error(`Package verification command failed: ${result.stderr}`);
   }

   return result.stdout;
}

try {
   const packOutput: unknown = JSON.parse(runNode([npmCli, 'pack', '--workspace', '@jalsoedesign/jsbrains', '--workspace', '@jalsoedesign/jsbrains-cli', '--ignore-scripts', '--json', '--pack-destination', temporary], process.cwd()));
   const packed: unknown[] = Array.isArray(packOutput) ? packOutput : Object.values(packOutput ?? {});
   const filenames = packed.map(item => {
      if (!item || typeof item !== 'object' || !('filename' in item) || typeof item.filename !== 'string'
         || path.basename(item.filename) !== item.filename || !item.filename.endsWith('.tgz')) {
         throw new Error('npm pack returned an invalid tarball filename.');
      }

      return item.filename;
   });
   const tarballs = filenames.map(filename => path.join(temporary, filename));

   if (tarballs.length !== 2) {
      throw new Error('npm pack did not return both workspace tarballs.');
   }

   const consumer = path.join(temporary, 'consumer');
   await mkdir(consumer);
   await writeFile(path.join(consumer, 'package.json'), JSON.stringify({name: 'jsbrains-smoke-consumer', version: '1.0.0', private: true}));
   runNode([npmCli, 'install', '--ignore-scripts', '--no-audit', '--no-fund', ...tarballs], consumer);

   const runtime = keepassRuntime();
   const database = runtime.Kdbx.create(new runtime.Credentials(runtime.ProtectedValue.fromString('fixture-master')), 'fake package smoke fixture');
   database.setVersion(3);
   const group = database.createGroup(database.getDefaultGroup(), 'IntelliJ Platform');
   const entry = database.createEntry(group);
   entry.fields.set('Title', 'fixture-service');
   entry.fields.set('UserName', 'fixture-user');
   entry.fields.set('Password', runtime.ProtectedValue.fromString('fixture-password'));
   const deploymentEntry = database.createEntry(group);
   deploymentEntry.fields.set('Title', 'IntelliJ Platform Remote Credentials ssh://fixture-user@example.invalid:22(password)');
   deploymentEntry.fields.set('UserName', 'fixture-user');
   deploymentEntry.fields.set('Password', runtime.ProtectedValue.fromString('fixture-password'));
   const configPath = path.join(consumer, 'config');
   await mkdir(path.join(configPath, 'options'), {recursive: true});
   await writeFile(path.join(configPath, 'c.kdbx'), new Uint8Array(await database.save()));
   await writeFile(path.join(configPath, 'options', 'security.xml'), '<application><component name="PasswordSafe"><option name="PROVIDER" value="KEEPASS" /></component></application>');
   await writeFile(path.join(configPath, 'options', 'webServers.xml'), '<application><component name="WebServers"><option name="servers"><webServer id="fixture-id" name="Fixture"><fileTransfer accessType="SFTP" host="example.invalid" port="22" username="fixture-user" /></webServer></option></component></application>');

   const smoke = [
      'const safe = new PasswordSafeManager({configPath: process.cwd() + \'/config\', platform: \'win32\'}, {masterPassword: async () => \'fixture-master\'});',
      'const result = await safe.getCredential({serviceName: \'fixture-service\', username: \'fixture-user\'});',
      'if (result.status !== \'available\' || result.credential.password !== \'fixture-password\') { throw new Error(\'Packaged credential lookup failed.\'); }',
      'console.log(\'Packaged credential lookup passed.\');'
   ].join('\n');
   await writeFile(path.join(consumer, 'smoke.mjs'), `import {PasswordSafeManager} from '@jalsoedesign/jsbrains';\n${smoke}`);
   await writeFile(path.join(consumer, 'smoke.cjs'), `const {PasswordSafeManager} = require('@jalsoedesign/jsbrains');\n(async () => {\n${smoke}\n})().catch(() => { process.exitCode = 1; });`);
   runNode(['smoke.mjs'], consumer);
   runNode(['smoke.cjs'], consumer);

   const cli = path.join(consumer, 'node_modules', '@jalsoedesign', 'jsbrains-cli', 'dist', 'bin.js');
   const cliVersion = JSON.parse(runNode([npmCli, 'exec', '--no', '--', 'jsbrains', '--version', '--json'], consumer)) as {data: {name: string}};

   if (cliVersion.data.name !== '@jalsoedesign/jsbrains-cli') {
      throw new Error('Packaged CLI version metadata is incorrect.');
   }

   const arguments_ = [cli, 'credentials', 'Fixture', '--global', '--config', configPath, '--master-password-env', 'JSBRAINS_FIXTURE_MASTER', '--json'];
   const environment = {...process.env, JSBRAINS_FIXTURE_MASTER: 'fixture-master'};
   const json = runNode(arguments_, consumer, environment);
   const result = JSON.parse(json) as {data: {summary: {secretsRetrieved: number}}};

   if (result.data.summary.secretsRetrieved !== 1 || json.includes('fixture-password')) {
      throw new Error('Packaged CLI credential status/redaction check failed.');
   }

   const revealed = JSON.parse(runNode([...arguments_, '--show-secrets'], consumer, environment)) as {data: {results: {credentials: {password: string}}[]}};

   if (revealed.data.results[0]?.credentials.password !== 'fixture-password') {
      throw new Error('Packaged CLI explicit fake credential export failed.');
   }

   const lock = JSON.parse(await readFile(path.join(consumer, 'package-lock.json'), 'utf8')) as {packages: Record<string, {version: string}>};

   if (Object.keys(lock.packages).some(name => name.endsWith('/kdbxweb'))) {
      throw new Error('The consumer unexpectedly installed the obsolete kdbxweb dependency graph.');
   }

   console.log('Both tarballs: isolated install, ESM/CommonJS library, CLI JSON, credential redaction and explicit fake-secret export passed.');
} finally {
   await rm(temporary, {recursive: true, force: true});
}
