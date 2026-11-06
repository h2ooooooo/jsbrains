import {attribute, component, node, nodes} from '@/util/xml';
import {resolvePathMacros} from '@/util/paths';
import type {MacroContext} from '@/util/paths';
import type {DeploymentMapping, DeploymentProjectState} from '@/deployment/types';

export function mappingEntries(document: unknown) {
   const settings = component(document, 'PublishConfigData');
   return nodes(node(settings.serverData).paths);
}

export function parseMappings(entries: unknown[], context: MacroContext = {}): DeploymentMapping[] {
   const mappings: DeploymentMapping[] = [];

   for (const entry of entries) {
      const server = node(node(entry).serverdata);

      for (const mapping of nodes(node(server.mappings).mapping)) {
         const unresolvedMacros = new Set<string>();

         function resolve(name: string) {
            const value = attribute(mapping, name);

            if (value === null) {
               return null;
            }

            const expanded = resolvePathMacros(value, context);

            for (const macro of expanded.unresolvedMacros) {
               unresolvedMacros.add(macro);
            }

            return expanded.path;
         }

         const result: DeploymentMapping = {
            localPath: resolve('local'),
            deploymentPath: resolve('deploy'),
            webPath: resolve('web')
         };

         if (unresolvedMacros.size > 0) {
            result.unresolvedMacros = [...unresolvedMacros];
         }

         mappings.push(result);
      }
   }

   return mappings;
}

export function parseProjectState(document: unknown): DeploymentProjectState {
   const settings = component(document, 'PublishConfigData');
   const state: DeploymentProjectState = {};
   const name = attribute(settings, 'serverName');
   const id = attribute(settings, 'serverId');
   const upload = attribute(settings, 'autoUpload');

   if (name !== null) {
      state.defaultDeploymentName = name;
   }

   if (id !== null) {
      state.defaultDeploymentId = id;
   }

   if (upload !== null) {
      state.autoUpload = 'unknown';
      state.rawAutoUpload = upload;
   }

   return state;
}
