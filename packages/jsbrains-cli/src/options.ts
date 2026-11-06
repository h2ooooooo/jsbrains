import {parseArgs} from 'node:util';

export const commandNames = ['inspect', 'installations', 'projects', 'project', 'deployments', 'credentials', 'password-safe', 'settings', 'help', 'version'] as const;
export type CommandName = typeof commandNames[number];

export class CliError extends Error {
   public constructor(public readonly code: string, message: string, public readonly exitCode = 2) {
      super(message);
   }
}

export interface CliOptions {
   command: CommandName;
   json: boolean;
   color?: boolean;
   product?: string;
   ideVersion?: string;
   config?: string;
   project?: string;
   scope: 'all' | 'project' | 'global';
   name?: string;
   id?: string;
   filename?: string;
   all: boolean;
   credentials: boolean;
   showSecrets: boolean;
   globalSettings: boolean;
   masterPasswordEnv?: string;
   masterPasswordStdin: boolean;
}

export function wantsJson(arguments_: string[]): boolean {
   const separator = arguments_.indexOf('--');
   const flags = separator < 0 ? arguments_ : arguments_.slice(0, separator);
   return flags.includes('--json');
}

export function parseOptions(arguments_: string[]): CliOptions {
   let parsed;

   try {
      parsed = parseArgs({
         args: arguments_, allowPositionals: true, strict: true, tokens: true,
         options: {
            json: {type: 'boolean'}, help: {type: 'boolean', short: 'h'}, version: {type: 'boolean', short: 'v'},
            color: {type: 'boolean'}, 'no-color': {type: 'boolean'},
            product: {type: 'string'}, 'ide-version': {type: 'string'},
            config: {type: 'string', short: 'c'}, project: {type: 'string', short: 'p'},
            scope: {type: 'string'}, global: {type: 'boolean'},
            name: {type: 'string', short: 'n'}, id: {type: 'string'},
            all: {type: 'boolean'}, credentials: {type: 'boolean'}, 'show-secrets': {type: 'boolean'},
            'master-password-env': {type: 'string'}, 'master-password-stdin': {type: 'boolean'}
         }
      });
   } catch {
      // parseArgs can include user-supplied argument values in its error text.
      throw new CliError('INVALID_ARGUMENTS', 'Unknown or malformed CLI option. Run jsbrains --help.');
   }

   const {values, positionals, tokens} = parsed;
   const seen = new Set<string>();

   for (const token of tokens) {
      if (token.kind !== 'option') {
         continue;
      }

      if (seen.has(token.name)) {
         throw new CliError('INVALID_ARGUMENTS', `Specify --${token.name} only once.`);
      }

      seen.add(token.name);
   }

   let command = positionals[0] ?? 'inspect';

   if (values.help) {
      command = 'help';
   } else if (values.version) {
      command = 'version';
   }

   if (!commandNames.includes(command as CommandName)) {
      throw new CliError('UNKNOWN_COMMAND', 'Unknown command. Run jsbrains --help for available commands.');
   }

   const hasTarget = ['deployments', 'credentials', 'settings'].includes(command);

   if (positionals.length > (hasTarget ? 2 : 1) && command !== 'help') {
      throw new CliError('INVALID_ARGUMENTS', 'Too many positional arguments. Quote names or paths containing spaces.');
   }

   if (values.config && (values.product || values['ide-version'])) {
      throw new CliError('INVALID_ARGUMENTS', 'Use --config or product/version selectors, not both.');
   }

   if (values.color && values['no-color']) {
      throw new CliError('INVALID_ARGUMENTS', 'Use either --color or --no-color.');
   }

   if (values['master-password-env'] && values['master-password-stdin']) {
      throw new CliError('INVALID_ARGUMENTS', 'Choose one master-password input source.');
   }

   const credentialCommand = command === 'credentials' || (command === 'deployments' && values.credentials);

   if ((values['show-secrets'] || values['master-password-env'] || values['master-password-stdin']) && !credentialCommand) {
      throw new CliError('INVALID_ARGUMENTS', 'Credential options require credentials or deployments --credentials.');
   }

   if (values.credentials && command !== 'deployments') {
      throw new CliError('INVALID_ARGUMENTS', '--credentials is only valid with deployments.');
   }

   const deploymentCommand = command === 'deployments' || command === 'credentials';

   if ((values.name || values.id || values.scope) && !deploymentCommand) {
      throw new CliError('INVALID_ARGUMENTS', '--name, --id and --scope are deployment selectors.');
   }

   if (values.all && command !== 'credentials') {
      throw new CliError('INVALID_ARGUMENTS', '--all is only valid with credentials.');
   }

   const name = values.name ?? (deploymentCommand ? positionals[1] : undefined);

   if ((values.name && positionals[1]) || (name && values.id) || (values.all && (name || values.id))) {
      throw new CliError('INVALID_ARGUMENTS', 'Choose one deployment selector: name, --id, or --all.');
   }

   if (command === 'credentials' && !name && !values.id && !values.all) {
      throw new CliError('INVALID_ARGUMENTS', 'Select a deployment: jsbrains credentials "Production", --id ID, or --all.');
   }

   if (values.global && !deploymentCommand && command !== 'settings') {
      throw new CliError('INVALID_ARGUMENTS', '--global applies to deployments, credentials or settings.');
   }

   if (values.global && values.scope) {
      throw new CliError('INVALID_ARGUMENTS', 'Use --global or --scope, not both.');
   }

   const scope = values.global ? 'global' : values.scope ?? 'all';

   if (!['all', 'project', 'global'].includes(scope)) {
      throw new CliError('INVALID_ARGUMENTS', '--scope must be all, project or global.');
   }

   for (const value of Object.values(values)) {
      if (typeof value === 'string' && value.length === 0) {
         throw new CliError('INVALID_ARGUMENTS', 'Option values must not be empty.');
      }
   }

   return {
      command: command as CommandName, json: values.json ?? false,
      color: values['no-color'] ? false : values.color,
      product: values.product, ideVersion: values['ide-version'], config: values.config, project: values.project,
      scope: scope as CliOptions['scope'], name, id: values.id,
      filename: command === 'settings' ? positionals[1] : undefined,
      all: values.all ?? false, credentials: values.credentials ?? false,
      showSecrets: values['show-secrets'] ?? false, globalSettings: values.global ?? false,
      masterPasswordEnv: values['master-password-env'], masterPasswordStdin: values['master-password-stdin'] ?? false
   };
}
