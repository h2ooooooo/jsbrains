import {Chalk} from 'chalk';
import {stripVTControlCharacters} from 'node:util';
import type {CommandName} from '@cli/options';
import type {DeploymentInfo} from '@jalsoedesign/jsbrains';
import type {CredentialOutput} from '@cli/credentials';
import {help} from '@cli/help';

export interface JsonResponse {
   schemaVersion: 1;
   command: CommandName;
   data: unknown;
}

function safeText(value: unknown): string {
   // XML names and other local metadata should not inject terminal control sequences.
   return stripVTControlCharacters(String(value)).replace(/[\p{Cc}\p{Cf}]/gu, ' ');
}

export class CliOutput {
   private readonly colors: InstanceType<typeof Chalk>;

   public constructor(color: boolean) {
      this.colors = new Chalk({level: color ? 1 : 0});
   }

   public format(response: JsonResponse): string {
      if (response.command === 'help') {
         return this.helpText();
      }

      if (response.command === 'version') {
         const data = response.data as {name: string; version: string};
         return `${this.colors.bold(safeText(data.name))} ${safeText(data.version)}\n`;
      }

      if (response.command === 'deployments') {
         const data = response.data as {project: string | null; deployments: (DeploymentInfo & {credentials?: CredentialOutput})[]};
         return this.deployments(data);
      }

      const title = response.command.replace('-', ' ');
      return `${this.colors.bold.cyan(`jsbrains ${title}`)}\n\n${this.tree(response.data).join('\n')}\n`;
   }

   public error(code: string, message: string): string {
      return `${this.colors.bold.red(safeText(code))}: ${safeText(message)}\n`;
   }

   private helpText(): string {
      const output = [this.colors.bold.cyan(help.usage), '', this.colors.bold('Commands')];

      for (const [name, description] of Object.entries(help.commands)) {
         output.push(`  ${this.colors.cyan(name.padEnd(15))} ${description}`);
      }

      output.push('', this.colors.bold('Options'));

      for (const [name, description] of Object.entries(help.options)) {
         output.push(`  ${this.colors.yellow(name)}\n    ${description}`);
      }

      output.push('', this.colors.bold('Examples'), ...help.examples.map(example => `  ${example}`), '', help.note, '');
      return output.join('\n');
   }

   private deployments(data: {project: string | null; deployments: (DeploymentInfo & {credentials?: CredentialOutput})[]}): string {
      const output = [this.colors.bold.cyan(`Deployments (${data.deployments.length})`)];

      if (data.project) {
         output.push(this.colors.dim(safeText(data.project)));
      }

      if (data.deployments.length === 0) {
         output.push('No deployments found.');
      }

      for (const deployment of data.deployments) {
         const protocol = this.colors.magenta(deployment.type.toUpperCase());
         const visibility = this.colors.dim(`[${deployment.visibility}]`);
         output.push('', `${this.colors.bold(safeText(deployment.name))}  ${protocol} ${visibility}`);
         const address = deployment.host ?? '(local)';
         const port = deployment.port ?? '';
         output.push(`  ${this.colors.cyan(safeText(address))}:${port}  user: ${safeText(deployment.username ?? '(unspecified)')}`);
         output.push(`  ID: ${safeText(deployment.id ?? '(none)')}  auth: ${deployment.auth.type}`);

         if (deployment.rootPath !== null) {
            output.push(`  Root: ${safeText(deployment.rootPath)}`);
         }

         for (const mapping of deployment.mappings) {
            output.push(`  ${safeText(mapping.localPath ?? '?')} -> ${safeText(mapping.deploymentPath ?? '?')}  web: ${safeText(mapping.webPath ?? '?')}`);
         }

         for (const diagnostic of deployment.diagnostics) {
            output.push(this.colors.yellow(`  ${safeText(diagnostic)}`));
         }

         if (deployment.credentials) {
            output.push('  Credentials:', ...this.tree(deployment.credentials, 2));
         }

         output.push(this.colors.dim(`  Source: ${safeText(deployment.source.serverConfigPath)}`));
      }

      return `${output.join('\n')}\n`;
   }

   private scalar(value: unknown): string {
      const text = safeText(value);

      if (value === true || value === 'available') {
         return this.colors.green(text);
      }

      if (value === false || ['not-stored', 'locked', 'unsupported', 'unavailable', 'master-password-required', 'pgp-required'].includes(text)) {
         return this.colors.yellow(text);
      }

      if (value === null) {
         return this.colors.dim('none');
      }

      return text;
   }

   private tree(value: unknown, depth = 0): string[] {
      const indent = '  '.repeat(depth);

      if (value instanceof Date) {
         return [`${indent}${value.toISOString()}`];
      }

      if (Array.isArray(value)) {
         if (value.length === 0) {
            return [`${indent}(none)`];
         }

         return value.flatMap((item, index) => [`${indent}${this.colors.dim(`[${index + 1}]`)}`, ...this.tree(item, depth + 1)]);
      }

      if (value && typeof value === 'object') {
         const lines: string[] = [];

         for (const [name, content] of Object.entries(value)) {
            if (content === undefined) {
               continue;
            }

            const key = this.colors.cyan(safeText(name));

            if (content !== null && typeof content === 'object' && !(content instanceof Date)) {
               lines.push(`${indent}${key}:`, ...this.tree(content, depth + 1));
            } else {
               lines.push(`${indent}${key}: ${this.scalar(content)}`);
            }
         }

         return lines;
      }

      return [`${indent}${this.scalar(value)}`];
   }
}
