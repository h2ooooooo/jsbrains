import path from 'node:path';
import {readFile, symlink, stat} from 'node:fs/promises';
import {describe, expect, it} from 'vitest';
import {ProjectSettingsManager} from '@/index';
import {parseXml} from '@/util/xml';
import {temporaryDirectory, write} from './helpers';

describe('settings', () => {
   it('reads XML and text without modifying file contents or mtime', async () => {
      const directory = await temporaryDirectory();
      const raw = '<project><component name="Example" enabled="false" number="001" /></project>';
      const file = await write(directory, 'workspace.xml', raw);
      const before = await stat(file);
      await write(directory, 'notes.txt', 'ordinary text');
      const settings = new ProjectSettingsManager(directory);
      expect(await settings.exists('workspace.xml')).toBe(true);
      expect(await settings.read('missing.xml')).toBeNull();
      expect((await settings.read('notes.txt'))?.parsed).toBeUndefined();
      expect(await settings.readText('notes.txt')).toBe('ordinary text');
      expect(await settings.readXml('workspace.xml')).toEqual({project: {component: {'@_name': 'Example', '@_enabled': 'false', '@_number': '001'}}});
      expect(await settings.getFiles()).toHaveLength(2);
      expect(await readFile(file, 'utf8')).toBe(raw);
      expect((await stat(file)).mtimeMs).toBe(before.mtimeMs);
   });

   it.each(['../secret.xml', '..\\secret.xml', '/absolute.xml', 'C:secret', '.', '..', 'file\0.xml'])('rejects unsafe filename %s', async filename => {
      const settings = new ProjectSettingsManager(await temporaryDirectory());
      await expect(settings.read(filename)).rejects.toThrow('single filename');
   });

   it.skipIf(process.platform === 'win32')('rejects symlinks outside the settings directory', async () => {
      const directory = await temporaryDirectory();
      const outside = await temporaryDirectory();
      const file = await write(outside, 'secret.xml', '<secret />');
      await symlink(file, path.join(directory, 'linked.xml'));
      await expect(new ProjectSettingsManager(directory).read('linked.xml')).rejects.toThrow('safely access');
   });

   it('reports malformed XML location without revealing contents', async () => {
      const directory = await temporaryDirectory();
      const file = await write(directory, 'broken.xml', '<root secret="fixture-sensitive"><unclosed></root>');
      const settings = new ProjectSettingsManager(directory);
      const error = await settings.read('broken.xml').catch(value => value as Error);
      expect(String(error)).toContain(file);
      expect(String(error)).toContain('line');
      expect(String(error)).not.toContain('fixture-sensitive');
      expect(() => parseXml('<!DOCTYPE root [<!ENTITY secret "secret">]><root>&secret;</root>')).toThrow('DTD');
   });

   it('lists metadata without reading or parsing settings contents', async () => {
      const directory = await temporaryDirectory();
      await write(directory, 'broken.xml', '<project><broken></project>');
      await write(directory, 'notes.txt', 'private fixture text');
      await write(directory, 'nested/ignored.xml', '<project />');
      const settings = new ProjectSettingsManager(directory);
      expect(await settings.listFiles()).toEqual([
         {filename: 'broken.xml', path: path.join(directory, 'broken.xml'), exists: true},
         {filename: 'notes.txt', path: path.join(directory, 'notes.txt'), exists: true}
      ]);
      await expect(settings.read('broken.xml')).rejects.toThrow('line');
      await expect(settings.getFiles()).rejects.toThrow('line');
   });

});
