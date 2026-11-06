import path from 'node:path';
import {directoryExists, listDirectory} from '@/util/filesystem';
import {parseInstallationName} from '@/util/versions';
import {jetBrainsPaths} from '@/discovery/jetBrainsPaths';
import type {DetectionOptions, JetBrainsInstallationInfo} from '@/types/installation';

export async function discoverInstallations(options: DetectionOptions): Promise<JetBrainsInstallationInfo[]> {
   const roots = jetBrainsPaths(options);
   const candidates = new Set<string>(options.configPaths?.map(value => path.resolve(value)));

   for (const entry of await listDirectory(roots.configRoot)) {
      if (entry.isDirectory()) {
         candidates.add(path.join(roots.configRoot, entry.name));
      }
   }

   // Inspect the system root too, but never mistake cache-only directories for configurations.
   for (const entry of await listDirectory(roots.systemRoot)) {
      if (entry.isDirectory() && await directoryExists(path.join(roots.systemRoot, entry.name, 'options'))) {
         candidates.add(path.join(roots.systemRoot, entry.name));
      }
   }

   const installations: JetBrainsInstallationInfo[] = [];

   for (const configPath of candidates) {
      if (!await directoryExists(path.join(configPath, 'options'))) {
         continue;
      }

      const name = path.basename(configPath);
      const identity = parseInstallationName(name);
      const systemCandidate = path.join(roots.systemRoot, name);
      let systemPath: string | null = null;

      if (await directoryExists(systemCandidate) && systemCandidate !== configPath) {
         systemPath = systemCandidate;
      }

      installations.push({
         ...identity,
         configPath,
         systemPath,
         platform: options.platform ?? process.platform,
         detected: true
      });
   }

   return installations;
}
