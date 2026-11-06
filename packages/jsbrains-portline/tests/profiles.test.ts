import path from 'node:path';
import os from 'node:os';
import {mkdtemp, mkdir, rm, writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {afterEach, expect, it, vi} from 'vitest';
import {JetBrains, DeploymentManager} from '@jalsoedesign/jsbrains';
import {JetBrainsProfileSource} from '../src/index.js';

const directories: string[] = [];

afterEach(async () => {
   await Promise.all(directories.splice(0).map(directory => rm(directory, {recursive: true, force: true})));
});

async function fixture() {
   const directory = await mkdtemp(path.join(os.tmpdir(), 'jsbrains portline '));
   directories.push(directory);
   const config = path.join(directory, 'PhpStorm2026.2');
   await mkdir(path.join(config, 'options'), {recursive: true});
   await writeFile(path.join(config, 'options', 'sshConfigs.xml'), [
      '<application><component name="SshConfigs"><configs>',
      '<sshConfig id="ssh-1" name="Gateway" host="gateway.example" port="2222" username="deploy" authType="KEY_PAIR" keyPath="C:\\keys\\id.ppk" storePassphrase="true" />',
      '<sshConfig id="ssh-2" name="Password host" host="password.example" port="22" username="alice" authType="PASSWORD" storePassword="true" />',
      '</configs></component></application>'
   ].join(''));
   await writeFile(path.join(config, 'options', 'webServers.xml'), [
      '<application><component name="WebServers"><option name="servers">',
      '<webServer id="web-1" name="Site"><fileTransfer accessType="SFTP" sshConfigId="ssh-1" rootFolder="/srv/site" /></webServer>',
      '</option></component></application>'
   ].join(''));

   return {directory, config};
}

it('reuses deployment and Password Safe readers, with no credential retrieval during metadata access', async () => {
   const {config} = await fixture();
   const provider = {
      canHandle: vi.fn(async () => true),
      getCredential: vi.fn(async (request: {username: string | null}) => ({
         status: 'available' as const,
         credential: {username: request.username, password: 'fixture-secret'}
      }))
   };
   const installation = await JetBrains.fromConfigPath(config, {passwordSafe: {provider}});
   const source = await JetBrainsProfileSource.fromInstallation(installation);
   const profiles = source.list();

   expect(profiles).toHaveLength(3);
   expect(source.get('global/deployments/web-1')?.connections[0]).toMatchObject({
      protocol: 'sftp', endpoint: {host: 'gateway.example', port: 2222}, remoteDirectory: '/srv/site'
   });
   expect(source.get('global/ssh/ssh-1')?.connections[0]?.protocol).toBe('ssh');
   expect(provider.getCredential).not.toHaveBeenCalled();
   expect(JSON.stringify(profiles)).not.toContain('fixture-secret');
   const password = source.get('global/ssh/ssh-2')!.connections[0]!.authentication[0]!;

   if (password.type !== 'password') {
      throw new Error('Expected password authentication');
   }

   expect(await source.resolve(password.credential)).toEqual({state: 'available', value: 'fixture-secret'});
   expect(provider.getCredential).toHaveBeenCalledTimes(1);
   expect((await new DeploymentManager({installation}).getSshConfigurations()).map(item => item.name))
      .toEqual(['Gateway', 'Password host']);
   expect((await installation.getGlobalDeployments())[0]?.name).toBe('Site');
});

it('selects an explicit IDE config/version and exposes a shared CLI without replacing jsbrains', async () => {
   const {config} = await fixture();
   const result = await JetBrainsProfileSource.discover({configPath: config});

   expect(result.selectedBy).toBe('explicit');
   expect(result.candidates[0]?.applicationVersion).toBe('2026.2');
   const cli = spawnSync(process.execPath, [
      'packages/jsbrains-portline-cli/bin/cli.js', 'get', 'global/ssh/ssh-1', '--config', config, '--json'
   ], {encoding: 'utf8'});

   expect(cli.status, cli.stderr).toBe(0);
   expect(JSON.parse(cli.stdout)).toMatchObject({host: 'gateway.example', keyFile: 'C:\\keys\\id.ppk'});
});

it('reports locked Password Safe credentials without caching secrets in profiles', async () => {
   const {config} = await fixture();
   const installation = await JetBrains.fromConfigPath(config, {
      passwordSafe: {provider: {
         canHandle: async () => true,
         getCredential: async () => ({status: 'master-password-required'})
      }}
   });
   const source = await JetBrainsProfileSource.fromInstallation(installation);
   const auth = source.get('global/ssh/ssh-2')!.connections[0]!.authentication[0]!;

   if (auth.type !== 'password') {
      throw new Error('Expected password authentication');
   }

   expect(await source.resolve(auth.credential)).toEqual({state: 'locked'});
});
