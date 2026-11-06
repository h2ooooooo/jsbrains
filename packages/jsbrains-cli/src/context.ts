import path from 'node:path';
import {JetBrains, JetBrainsProject} from '@jalsoedesign/jsbrains';
import type {JetBrainsInstallation, PasswordSafeOptions} from '@jalsoedesign/jsbrains';
import {CliError} from '@cli/options';
import type {CliOptions} from '@cli/options';

export interface CliEnvironment {
   cwd: string;
   env: NodeJS.ProcessEnv;
   readStdin: () => Promise<string>;
   stdinIsTTY: boolean;
}

export class CliContext {
   private installations?: Promise<JetBrainsInstallation[]>;

   public constructor(private readonly options: CliOptions, private readonly environment: CliEnvironment) {}

   public async getInstallations(): Promise<JetBrainsInstallation[]> {
      this.installations ??= this.detect();
      return this.installations;
   }

   private async detect(): Promise<JetBrainsInstallation[]> {
      const passwordSafe = this.passwordOptions();

      if (this.options.config) {
         const config = path.resolve(this.environment.cwd, this.options.config);
         return [await JetBrains.fromConfigPath(config, {passwordSafe})];
      }

      const jetBrains = await JetBrains.detect({env: this.environment.env, passwordSafe});
      let installations = await jetBrains.getInstallations();

      if (this.options.product) {
         const product = this.options.product.toLowerCase();
         installations = installations.filter(item => item.product.toLowerCase() === product);
      }

      if (this.options.ideVersion) {
         installations = installations.filter(item => item.version === this.options.ideVersion);
      }

      return installations;
   }

   public async selectInstallation(required: boolean, options: {allowAmbiguous?: boolean} = {}): Promise<JetBrainsInstallation | undefined> {
      const installations = await this.getInstallations();

      if (installations.length === 0) {
         if (required || this.options.product || this.options.ideVersion || this.options.config) {
            throw new CliError('INSTALLATION_NOT_FOUND', 'No matching IDE configuration found. Use --product or --config PATH.');
         }

         return undefined;
      }

      const products = new Set(installations.map(item => item.product.toLowerCase()));

      if (products.size > 1) {
         const explicitSelection = this.options.product || this.options.ideVersion || this.options.config;

         if (!required && options.allowAmbiguous && !explicitSelection) {
            return undefined;
         }

         throw new CliError('AMBIGUOUS_INSTALLATION', 'Multiple IDE products found. Select --product PRODUCT or --config PATH.');
      }

      // The library orders each product newest first, including numeric version comparison.
      return installations[0];
   }

   public async getProject(installation?: JetBrainsInstallation, required = true): Promise<JetBrainsProject | null> {
      const from = path.resolve(this.environment.cwd, this.options.project ?? '.');
      const found = await JetBrains.findProject({from});

      if (!found) {
         if (required || this.options.project) {
            throw new CliError('PROJECT_NOT_FOUND', 'No .idea directory found here or in a parent. Use --project PATH, or --global for IDE deployments.');
         }

         return null;
      }

      if (installation) {
         return installation.getProject(found.path);
      }

      return found;
   }

   private passwordOptions(): PasswordSafeOptions {
      const environmentName = this.options.masterPasswordEnv;

      if (environmentName) {
         const password = this.environment.env[environmentName];

         if (password === undefined) {
            throw new CliError('MASTER_PASSWORD_INPUT', 'The selected master-password environment variable is not set.');
         }

         return {masterPassword: async () => password};
      }

      if (!this.options.masterPasswordStdin) {
         return {};
      }

      if (this.environment.stdinIsTTY) {
         throw new CliError('MASTER_PASSWORD_INPUT', '--master-password-stdin requires piped input; interactive prompts are not used.');
      }

      let input: Promise<string> | undefined;

      return {
         masterPassword: async () => {
            input ??= this.environment.readStdin();
            const password = await input;
            return password.replace(/\r?\n$/, '');
         }
      };
   }
}
