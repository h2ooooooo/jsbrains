import path from 'node:path';
import {mkdir} from 'node:fs/promises';
import {describe, expect, it} from 'vitest';
import {JetBrains, JetBrainsProject} from '@/index';
import {jetBrainsPaths} from '@/discovery/jetBrainsPaths';
import {compareJetBrainsVersions} from '@/util/versions';
import {fixture, temporaryDirectory, write} from './helpers';

describe('installation discovery', () => {
   it.each(['win32', 'darwin', 'linux'] as const)('discovers config installations on %s without treating caches as configs', async platform => {
      const homePath = await temporaryDirectory();
      const options = {platform, homePath, env: {}};
      const roots = jetBrainsPaths(options);
      await write(roots.configRoot, 'PhpStorm2026.2/options/ide.xml', '<application />');
      await write(roots.configRoot, 'PhpStorm2026.10/options/ide.xml', '<application />');
      await write(roots.configRoot, 'FutureIDE2027.1/options/ide.xml', '<application />');
      await mkdir(path.join(roots.configRoot, 'Toolbox'), {recursive: true});
      await mkdir(path.join(roots.systemRoot, 'PhpStorm2026.10'), {recursive: true});
      await mkdir(path.join(roots.systemRoot, 'CacheOnly2026.2'), {recursive: true});

      const jetBrains = await JetBrains.detect(options);
      const installations = await jetBrains.getInstallations();
      expect(installations).toHaveLength(3);
      const latest = await jetBrains.getInstallation({product: 'phpstorm', latest: true});
      expect(latest?.version).toBe('2026.10');
      expect(latest?.systemPath).toBe(path.join(roots.systemRoot, 'PhpStorm2026.10'));
      expect(await jetBrains.getInstallation({product: 'Absent'})).toBeNull();
      expect((await jetBrains.getInstallation({configPath: latest!.configPath}))?.version).toBe('2026.10');
   });

   it('supports explicit custom locations and returns null for missing selections', async () => {
      const directory = await temporaryDirectory();
      const installation = await JetBrains.fromConfigPath(directory);
      expect(installation.detected).toBe(false);
      expect(installation.version).toBeNull();
      await expect(JetBrains.fromConfigPath(path.join(directory, 'missing'))).rejects.toThrow('does not exist');
   });

   it('honors Linux XDG roots', () => {
      const roots = jetBrainsPaths({platform: 'linux', env: {XDG_CONFIG_HOME: '/config', XDG_CACHE_HOME: '/cache'}});
      expect(roots.configRoot).toBe(path.join('/config', 'JetBrains'));
      expect(roots.systemRoot).toBe(path.join('/cache', 'JetBrains'));
   });

   it('compares versions numerically and puts a release after its preview', () => {
      expect(compareJetBrainsVersions('2026.10', '2026.2')).toBeGreaterThan(0);
      expect(compareJetBrainsVersions('2026.2', '2026.2-EAP')).toBeGreaterThan(0);
      expect(compareJetBrainsVersions(null, '2026.2')).toBeLessThan(0);
      expect(compareJetBrainsVersions('2026.2', '2026.2')).toBe(0);
      expect(compareJetBrainsVersions('2026.2.0', '2026.2')).toBe(0);
      expect(compareJetBrainsVersions('2026.2', '2026.2.0')).toBe(0);
   });
});

describe('projects', () => {
   it('walks upward to .idea and supports standalone projects', async () => {
      const directory = await temporaryDirectory();
      await mkdir(path.join(directory, '.idea'));
      const nested = path.join(directory, 'src', 'deep');
      await mkdir(nested, {recursive: true});
      const project = await JetBrains.findProject({from: nested});
      expect(project?.path).toBe(directory);
      expect(await project?.exists()).toBe(true);
      expect(await new JetBrainsProject({path: path.join(directory, 'missing')}).exists()).toBe(false);
   });

   it('returns null when no parent contains a project', async () => {
      expect(await JetBrains.findProject({from: await temporaryDirectory()})).toBeNull();
   });

   it('retains deleted recent projects, XML escapes, timestamps and Windows case', async () => {
      const directory = await temporaryDirectory();
      await write(directory, 'options/recentProjects.xml', await fixture('projects/recentProjects.xml'));
      const installation = await JetBrains.fromConfigPath(directory, {homePath: directory});
      const projects = await installation.getRecentProjects();
      expect(projects).toHaveLength(2);
      expect(projects[0]?.name).toBe('Deleted & remembered');
      expect(projects[0]?.recent?.exists).toBe(false);
      expect(projects[0]?.recent?.lastOpened?.getTime()).toBe(1700000000000);
      expect(projects[1]?.path).toBe('C:\\Fixture\\MixedCase');
   });

   it('preserves metadata when legacy recent paths repeat a project and retains unresolved macros', async () => {
      const directory = await temporaryDirectory();
      const xml = (await fixture('projects/recentProjects.xml')).replace('C:/Fixture/MixedCase', '$USER_HOME$/deleted-project');
      await write(directory, 'options/recentProjects.xml', xml);
      const installation = await JetBrains.fromConfigPath(directory, {homePath: directory});
      const projects = await installation.getRecentProjects();
      expect(projects).toHaveLength(1);
      expect(projects[0]?.recent?.lastOpened?.getTime()).toBe(1700000000000);
      const unresolved = new JetBrainsProject({path: '$UNKNOWN_ROOT$/project'});
      expect(unresolved.path).toBe('$UNKNOWN_ROOT$/project');
   });
});
