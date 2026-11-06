import path from 'node:path';
import {realpath} from 'node:fs/promises';
import {JetBrainsSettingsError} from '@/errors/errors';
import {fileExists, isMissing, listDirectory, readTextFile} from '@/util/filesystem';
import {parseXml} from '@/util/xml';
import type {JetBrainsSettingsFile, JetBrainsSettingsFileInfo} from '@/types/settings';

export class SettingsManager {
   public constructor(public readonly directory: string) {}

   private async resolve(filename: string): Promise<string> {
      if (!filename || filename.includes('\0') || /[:\\/]/.test(filename) || filename === '..' || filename === '.') {
         throw new JetBrainsSettingsError('Settings filename must be a single filename without a path.');
      }

      const resolved = path.resolve(this.directory, filename);

      try {
         const [directory, target] = await Promise.all([realpath(this.directory), realpath(resolved)]);
         const relative = path.relative(directory, target);

         if (relative.startsWith('..') || path.isAbsolute(relative)) {
            throw new JetBrainsSettingsError(`Settings file escapes its directory: ${resolved}.`);
         }
      } catch (error) {
         if (!isMissing(error)) {
            throw new JetBrainsSettingsError(`Cannot safely access settings file ${resolved}.`);
         }
      }

      return resolved;
   }

   public async listFiles(): Promise<JetBrainsSettingsFileInfo[]> {
      const entries = await listDirectory(this.directory);
      return entries.filter(entry => entry.isFile())
         .sort((left, right) => left.name.localeCompare(right.name))
         .map(entry => ({filename: entry.name, path: path.resolve(this.directory, entry.name), exists: true}));
   }

   public async getFiles(): Promise<JetBrainsSettingsFile[]> {
      const entries = await listDirectory(this.directory);
      const files: JetBrainsSettingsFile[] = [];

      for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
         if (!entry.isFile()) {
            continue;
         }

         const file = await this.read(entry.name);

         if (file) {
            files.push(file);
         }
      }

      return files;
   }

   public async exists(filename: string): Promise<boolean> {
      return fileExists(await this.resolve(filename));
   }

   public async readText(filename: string): Promise<string | null> {
      return readTextFile(await this.resolve(filename));
   }

   public async readXml<T = unknown>(filename: string): Promise<T | null> {
      const resolved = await this.resolve(filename);
      const raw = await readTextFile(resolved);

      if (raw === null) {
         return null;
      }

      return parseXml<T>(raw, resolved);
   }

   public async read<T = unknown>(filename: string): Promise<JetBrainsSettingsFile<T> | null> {
      const resolved = await this.resolve(filename);
      const raw = await readTextFile(resolved);

      if (raw === null) {
         return null;
      }

      const result: JetBrainsSettingsFile<T> = {filename, path: resolved, exists: true, raw};

      if (filename.toLowerCase().endsWith('.xml')) {
         result.parsed = parseXml<T>(raw, resolved);
      }

      return result;
   }
}
