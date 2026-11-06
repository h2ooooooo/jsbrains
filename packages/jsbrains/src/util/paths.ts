import path from 'node:path';
import {homedir} from 'node:os';

export function pathApi(value: string) {
   if (/^[a-z]:[\\/]|^\\\\/i.test(value)) {
      return path.win32;
   }

   return path.posix;
}

export function normalizeFilesystemPath(value: string): string {
   if (/\$[A-Z_]+\$/.test(value)) {
      return value;
   }

   const api = pathApi(value);

   if (api.isAbsolute(value)) {
      return api.normalize(value);
   }

   return path.resolve(value);
}

export interface MacroContext {
   projectPath?: string;
   homePath?: string;
   configPath?: string;
}

export function resolvePathMacros(value: string, context: MacroContext = {}) {
   const macros: Record<string, string | undefined> = {
      PROJECT_DIR: context.projectPath,
      USER_HOME: context.homePath ?? homedir(),
      APPLICATION_CONFIG_DIR: context.configPath
   };
   const unresolved = new Set<string>();
   const resolved = value.replace(/\$([A-Z_]+)\$/g, (original: string, name: string) => {
      const replacement = macros[name];

      if (replacement === undefined) {
         unresolved.add(original);
         return original;
      }

      return replacement;
   });

   return {path: resolved, unresolvedMacros: [...unresolved]};
}
