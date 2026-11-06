import path from 'node:path';
import {fileSource, requireSource} from '@jalsoedesign/portline-platform';
import {JetBrainsProfileSource, createJetBrainsWriter} from '@jalsoedesign/jsbrains-portline';
import {createNormalizedCliSource, createProfileCli, parseProfileArgs, createProfileWriteCommands} from '@jalsoedesign/portline-cli';
import type {ProfileCliOptions} from '@jalsoedesign/portline-cli';
import type {JetBrainsProfileOptions} from '@jalsoedesign/jsbrains-portline';

const sourceOptions = [
   {flag: '--config', key: 'configPath', takesValue: true, description: 'IDE configuration directory'},
   {flag: '--project', key: 'projectPath', takesValue: true, description: 'Project directory'},
   {flag: '--source', key: 'sourceId', takesValue: true, description: 'Discovered source ID'},
   {flag: '--product', key: 'product', takesValue: true, description: 'IDE product name'},
   {flag: '--version', key: 'version', takesValue: true, description: 'IDE configuration version'}
] as const;

function sourceOptionsFor(options: ProfileCliOptions): JetBrainsProfileOptions {
   return options as JetBrainsProfileOptions;
}

export const cli = createProfileCli({
   name: 'jsbrains-profiles',
   sourceOptions,
   loadSource: options => JetBrainsProfileSource.open(sourceOptionsFor(options)).then(createNormalizedCliSource),
   commands: {
      ...createProfileWriteCommands({
         application: 'jetbrains', sourceOptions,
         importSource: name => import(name),
         writer: async options => {
            if (options.scope && !['global', 'project'].includes(String(options.scope))) {
               throw new Error('JetBrains write scope must be global or project');
            }

            if (options.scope === 'project' && typeof options.projectPath !== 'string') {
               throw new Error('Project writes require --project <directory>');
            }

            const source = options.scope === 'project' ? fileSource('jetbrains', path.join(String(options.projectPath), '.idea'), 'directory') :
               requireSource(await JetBrainsProfileSource.discover(sourceOptionsFor(options)));

            return createJetBrainsWriter(source, {
               scope: options.scope === 'project' ? 'project' : 'global',
               mode: options.mode as 'create' | 'update' | 'upsert' | undefined,
               allowLossy: options.allowLossy === true,
                registryMode: options.registryMode as 'transactional' | 'guarded' | undefined,
            });
         }
      }),
      async sources(args) {
         const {options} = parseProfileArgs(args, {sourceOptions});

         if (options.help) {
            console.log('Use sources --json to inspect IDE configs; select with --config <directory> or --source <id>.');

            return;
         }

         console.log(JSON.stringify(await JetBrainsProfileSource.discover(sourceOptionsFor(options)), null, 2));
      }
   }
});
