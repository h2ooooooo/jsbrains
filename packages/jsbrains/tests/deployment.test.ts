import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {inspect} from 'node:util';
import {describe, expect, it, vi} from 'vitest';
import {JetBrains, JetBrainsProject} from '@/index';
import {fixture, temporaryDirectory, write} from './helpers';

async function projectFixture() {
   const directory = await temporaryDirectory();

   for (const filename of ['webServers.xml', 'sshConfigs.xml', 'deployment.xml']) {
      await write(directory, `.idea/${filename}`, await fixture(`deployment/${filename}`));
   }

   return directory;
}

describe('deployment metadata', () => {
   it('normalizes protocols, shared SSH references, auth, mappings and provenance', async () => {
      const directory = await projectFixture();
      const project = new JetBrainsProject({path: directory});
      const deployments = await project.deployments.getAll();
      expect(deployments).toHaveLength(6);
      const production = await project.deployments.get('Production & Main');
      expect(production).toMatchObject({id: 'password-server', host: 'example.invalid', port: 22, type: 'sftp', username: 'fixture-user', rootPath: '/srv'});
      expect(production?.auth).toMatchObject({type: 'password', usesOpenSshConfig: true});
      expect(production?.mappings).toHaveLength(3);
      expect(production?.mappings[0]?.localPath).toBe(`${directory}/public`);
      expect(production?.mappings[2]?.unresolvedMacros).toEqual(['$UNKNOWN_ROOT$']);
      expect(production?.source.serverConfigPath).toBe(path.join(directory, '.idea', 'webServers.xml'));
      expect(production?.getRaw().mapping).toBeDefined();
      expect((await project.deployments.get('Key server'))?.auth).toMatchObject({type: 'private-key'});
      expect((await project.deployments.get('Agent server'))?.auth.type).toBe('open-ssh');
      expect((await project.deployments.get('FTP'))?.type).toBe('ftp');
      expect((await project.deployments.get('FTPS'))?.port).toBe(990);
      expect((await project.deployments.getById('future-server'))?.source.rawType).toBe('FUTURE_PROTOCOL');
      expect((await project.deployments.get('Future'))?.type).toBe('unknown');
      expect(await project.deployments.getProjectState()).toEqual({defaultDeploymentName: 'Production & Main', autoUpload: 'unknown', rawAutoUpload: 'OPAQUE_FUTURE_VALUE'});
      expect(await project.deployments.get('Absent')).toBeNull();
      expect(await production?.credentials.resolve()).toEqual({status: 'no-installation-context'});
   });

   it('returns project and global duplicates and honors visibility filters without decrypting', async () => {
      const directory = await projectFixture();
      const config = await temporaryDirectory();
      const masterPassword = vi.fn(async () => 'never-requested');
      await write(config, 'options/webServers.xml', await fixture('deployment/global.xml'));
      const installation = await JetBrains.fromConfigPath(config, {passwordSafe: {masterPassword}});
      const project = await installation.getProject(directory);
      const deployments = await project.deployments.getAll();
      expect(deployments).toHaveLength(7);
      expect(deployments.filter(value => value.id === 'password-server')).toHaveLength(2);
      expect(await project.deployments.getAll({includeProject: false})).toHaveLength(1);
      expect(await project.deployments.getAll({includeGlobal: false})).toHaveLength(6);
      expect(await installation.getGlobalDeployments()).toHaveLength(1);
      expect(masterPassword).not.toHaveBeenCalled();
      expect(JSON.stringify(installation)).not.toContain('never-requested');
   });

   it('supports missing files, missing SSH references and missing mappings', async () => {
      const directory = await temporaryDirectory();
      const project = new JetBrainsProject({path: directory});
      expect(await project.deployments.getAll()).toEqual([]);
      await write(directory, '.idea/webServers.xml', await fixture('deployment/webServers.xml'));
      const deployment = await project.deployments.get('Production & Main');
      expect(deployment?.mappings).toEqual([]);
      expect(deployment?.auth.type).toBe('unknown');
      expect(deployment?.diagnostics).toContain('Referenced SSH configuration was not found.');
   });

   it('does not read settings when both scopes are excluded', async () => {
      const directory = await temporaryDirectory();
      await write(directory, '.idea/deployment.xml', 'broken XML');
      const project = new JetBrainsProject({path: directory});
      expect(await project.deployments.getAll({includeProject: false, includeGlobal: false})).toEqual([]);
   });

   it('keeps raw secrets out of ordinary JSON and object inspection', async () => {
      const directory = await projectFixture();
      const file = path.join(directory, '.idea', 'webServers.xml');
      const xml = await readFile(file, 'utf8');
      await write(directory, '.idea/webServers.xml', xml.replace('rootFolder="/srv"', 'password="fake-raw-secret" rootFolder="/srv"'));
      const project = new JetBrainsProject({path: directory});
      const deployment = await project.deployments.get('Production & Main');
      expect(JSON.stringify(deployment)).not.toContain('fake-raw-secret');
      expect(inspect(deployment, {showHidden: true})).not.toContain('fake-raw-secret');
      expect(JSON.stringify(deployment?.getRaw())).toContain('fake-raw-secret');
   });

   it('uses installation macro context for project mappings and private keys', async () => {
      const directory = await projectFixture();
      const config = await temporaryDirectory();
      const homePath = path.join(config, 'imported-home');
      const mappings = '<project><component name="PublishConfigData"><serverData><paths name="Key server"><serverdata><mappings><mapping local="$USER_HOME$/src" deploy="/src" web="/" /><mapping local="$APPLICATION_CONFIG_DIR$/src" deploy="/config" web="/" /></mappings></serverdata></paths></serverData></component></project>';
      await write(directory, '.idea/deployment.xml', mappings);
      const installation = await JetBrains.fromConfigPath(config, {homePath});
      const project = await installation.getProject(directory);
      const key = await project.deployments.get('Key server');
      expect(key?.auth.privateKeyPath).toBe(homePath + '/.ssh/fixture_key');
      expect(key?.mappings).toEqual([
         {localPath: homePath + '/src', deploymentPath: '/src', webPath: '/'},
         {localPath: config + '/src', deploymentPath: '/config', webPath: '/'}
      ]);
      const ssh = (await fixture('deployment/sshConfigs.xml')).replace('$USER_HOME$', '$APPLICATION_CONFIG_DIR$');
      await write(directory, '.idea/sshConfigs.xml', ssh);
      expect((await project.deployments.get('Key server'))?.auth.privateKeyPath).toBe(config + '/.ssh/fixture_key');
      const standalone = new JetBrainsProject({path: directory});
      expect((await standalone.deployments.get('Key server'))?.mappings[1]?.unresolvedMacros).toEqual(['$APPLICATION_CONFIG_DIR$']);
   });

});
