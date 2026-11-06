import {attribute, components, node, nodes, option} from '@/util/xml';
import {normalizeFilesystemPath, pathApi, resolvePathMacros} from '@/util/paths';
import {directoryExists} from '@/util/filesystem';
import type {RecentProjectInfo} from '@/types/project';

export async function parseRecentProjects(document: unknown, homePath?: string): Promise<RecentProjectInfo[]> {
   const projects = new Map<string, RecentProjectInfo>();

   async function add(rawPath: string | null, metadata = {}) {
      if (!rawPath) {
         return;
      }

      const expanded = resolvePathMacros(rawPath, {homePath});
      let projectPath = expanded.path;

      if (expanded.unresolvedMacros.length === 0) {
         projectPath = normalizeFilesystemPath(projectPath);
      }

      const key = pathApi(projectPath).sep === '\\' ? projectPath.toLowerCase() : projectPath;
      const existing = projects.get(key);
      const name = option(metadata, 'displayName') ?? option(metadata, 'projectName') ?? existing?.name ?? pathApi(projectPath).basename(projectPath);
      const timestamp = option(metadata, 'projectOpenTimestamp') ?? option(metadata, 'activationTimestamp');
      const project: RecentProjectInfo = {
         path: projectPath,
         name,
         exists: expanded.unresolvedMacros.length === 0 && await directoryExists(projectPath),
         lastOpened: existing?.lastOpened
      };

      if (timestamp && Number.isFinite(Number(timestamp))) {
         const date = new Date(Number(timestamp));

         if (Number.isFinite(date.getTime())) {
            project.lastOpened = date;
         }
      }

      projects.set(key, project);
   }

   for (const manager of components(document)) {
      if (!attribute(manager, 'name')?.includes('RecentProjectsManager')) {
         continue;
      }

      for (const setting of nodes(manager.option)) {
         const name = attribute(setting, 'name');

         if (name === 'additionalInfo') {
            for (const entry of nodes(node(setting.map).entry)) {
               await add(attribute(entry, 'key'), node(node(entry.value).RecentProjectMetaInfo));
            }
         }

         if (name === 'recentPaths' || name === 'openPaths') {
            for (const entry of nodes(node(setting.list).option)) {
               await add(attribute(entry, 'value'));
            }
         }
      }
   }

   return [...projects.values()];
}
