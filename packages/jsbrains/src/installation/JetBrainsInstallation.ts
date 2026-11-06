import {IdeSettingsManager} from '@/installation/IdeSettingsManager';
import {PasswordSafeManager} from '@/password-safe/PasswordSafeManager';
import {JetBrainsProject} from '@/project/JetBrainsProject';
import {parseRecentProjects} from '@/installation/RecentProjects';
import {DeploymentManager} from '@/deployment/DeploymentManager';
import type {JetBrainsInstallationInfo, DetectionOptions} from '@/types/installation';

export class JetBrainsInstallation implements JetBrainsInstallationInfo {
   public readonly product: string;
   public readonly version: string | null;
   public readonly configPath: string;
   public readonly systemPath: string | null;
   public readonly platform: NodeJS.Platform;
   public readonly detected: boolean;
   public readonly settings: IdeSettingsManager;
   public readonly passwordSafe: PasswordSafeManager;
   public readonly homePath?: string;

   public constructor(info: JetBrainsInstallationInfo, options: DetectionOptions = {}) {
      this.product = info.product;
      this.version = info.version;
      this.configPath = info.configPath;
      this.systemPath = info.systemPath;
      this.platform = info.platform;
      this.detected = info.detected;
      this.homePath = options.homePath;
      this.settings = new IdeSettingsManager(info.configPath);
      this.passwordSafe = new PasswordSafeManager({
         configPath: info.configPath,
         platform: info.platform,
         homePath: options.homePath
      }, options.passwordSafe);
   }

   public async getRecentProjects(): Promise<JetBrainsProject[]> {
      const document = await this.settings.readXml('recentProjects.xml');
      const projects = await parseRecentProjects(document, this.homePath);
      return projects.map(info => new JetBrainsProject({path: info.path, installation: this, recent: info}));
   }

   public async getProject(path: string): Promise<JetBrainsProject> {
      return new JetBrainsProject({path, installation: this});
   }

   public async getGlobalDeployments() {
      return new DeploymentManager({installation: this}).getAll({includeProject: false, includeGlobal: true});
   }

   public toJSON(): JetBrainsInstallationInfo {
      return {
         product: this.product,
         version: this.version,
         configPath: this.configPath,
         systemPath: this.systemPath,
         platform: this.platform,
         detected: this.detected
      };
   }
}
