import path from 'node:path';
import {homedir} from 'node:os';
import type {DetectionOptions} from '@/types/installation';

export function jetBrainsPaths(options: DetectionOptions = {}) {
   const platform = options.platform ?? process.platform;
   const homePath = options.homePath ?? homedir();
   const env = options.env ?? process.env;
   const join = path.join;

   if (platform === 'win32') {
      return {
         configRoot: join(env.APPDATA ?? join(homePath, 'AppData', 'Roaming'), 'JetBrains'),
         systemRoot: join(env.LOCALAPPDATA ?? join(homePath, 'AppData', 'Local'), 'JetBrains')
      };
   }

   if (platform === 'darwin') {
      return {
         configRoot: join(homePath, 'Library', 'Application Support', 'JetBrains'),
         systemRoot: join(homePath, 'Library', 'Caches', 'JetBrains')
      };
   }

   return {
      configRoot: join(env.XDG_CONFIG_HOME ?? join(homePath, '.config'), 'JetBrains'),
      systemRoot: join(env.XDG_CACHE_HOME ?? join(homePath, '.cache'), 'JetBrains')
   };
}
