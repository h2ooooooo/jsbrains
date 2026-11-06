import {readFile, readdir, stat} from 'node:fs/promises';
import {JetBrainsSettingsError} from '@/errors/errors';

export function isMissing(error: unknown): boolean {
   const code = (error as NodeJS.ErrnoException).code;
   return code === 'ENOENT' || code === 'ENOTDIR';
}

export async function directoryExists(path: string): Promise<boolean> {
   try {
      return (await stat(path)).isDirectory();
   } catch (error) {
      if (isMissing(error)) {
         return false;
      }

      throw new JetBrainsSettingsError(`Cannot inspect directory ${path}.`);
   }
}

export async function fileExists(path: string): Promise<boolean> {
   try {
      return (await stat(path)).isFile();
   } catch (error) {
      if (isMissing(error)) {
         return false;
      }

      throw new JetBrainsSettingsError(`Cannot inspect file ${path}.`);
   }
}

export async function readTextFile(path: string): Promise<string | null> {
   try {
      return await readFile(path, 'utf8');
   } catch (error) {
      if (isMissing(error)) {
         return null;
      }

      throw new JetBrainsSettingsError(`Cannot read settings file ${path}.`);
   }
}

export async function listDirectory(path: string) {
   try {
      return await readdir(path, {withFileTypes: true});
   } catch (error) {
      if (isMissing(error)) {
         return [];
      }

      throw new JetBrainsSettingsError(`Cannot list directory ${path}.`);
   }
}
