import path from 'node:path';
import {JetBrainsInstallation} from '@/installation/JetBrainsInstallation';
import {JetBrainsProject} from '@/project/JetBrainsProject';
import {discoverInstallations} from '@/discovery/discoverInstallations';
import {discoverProject} from '@/discovery/discoverProject';
import {compareJetBrainsVersions, parseInstallationName} from '@/util/versions';
import {directoryExists} from '@/util/filesystem';
import {JetBrainsDiscoveryError} from '@/errors/errors';
import type {DetectionOptions, InstallationSelector} from '@/types/installation';

export class JetBrains {
   private constructor(private readonly installations: JetBrainsInstallation[]) {}

   public static async detect(options: DetectionOptions = {}): Promise<JetBrains> {
      const detected = await discoverInstallations(options);
      const installations = detected.map(info => new JetBrainsInstallation(info, options));
      installations.sort((left, right) => {
         return left.product.localeCompare(right.product) || compareJetBrainsVersions(right.version, left.version);
      });

      return new JetBrains(installations);
   }

   public static async fromConfigPath(configPath: string, options: DetectionOptions = {}): Promise<JetBrainsInstallation> {
      const resolved = path.resolve(configPath);

      if (!await directoryExists(resolved)) {
         throw new JetBrainsDiscoveryError(`Configuration directory does not exist: ${resolved}.`);
      }

      return new JetBrainsInstallation({
         ...parseInstallationName(path.basename(resolved)),
         configPath: resolved,
         systemPath: null,
         platform: options.platform ?? process.platform,
         detected: false
      }, options);
   }

   public static async findProject(options: {from?: string} = {}): Promise<JetBrainsProject | null> {
      const projectPath = await discoverProject(options.from ?? process.cwd());

      if (!projectPath) {
         return null;
      }

      return new JetBrainsProject({path: projectPath});
   }

   public async getInstallations(): Promise<JetBrainsInstallation[]> {
      return [...this.installations];
   }

   public async getInstallation(selector: InstallationSelector): Promise<JetBrainsInstallation | null> {
      const candidates = this.installations.filter(installation => {
         if (selector.product && installation.product.toLowerCase() !== selector.product.toLowerCase()) {
            return false;
         }

         if (selector.version && installation.version !== selector.version) {
            return false;
         }

         if (selector.configPath) {
            const requested = path.resolve(selector.configPath);
            const actual = path.resolve(installation.configPath);

            if (installation.platform === 'win32') {
               return actual.toLowerCase() === requested.toLowerCase();
            }

            return actual === requested;
         }

         return true;
      });

      if (selector.latest) {
         candidates.sort((left, right) => compareJetBrainsVersions(right.version, left.version));
      }

      return candidates[0] ?? null;
   }
}
