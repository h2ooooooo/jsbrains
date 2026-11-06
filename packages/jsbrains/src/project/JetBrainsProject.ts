import {ProjectSettingsManager} from '@/project/ProjectSettingsManager';
import {DeploymentManager} from '@/deployment/DeploymentManager';
import {directoryExists} from '@/util/filesystem';
import {normalizeFilesystemPath, pathApi} from '@/util/paths';
import type {JetBrainsInstallation} from '@/installation/JetBrainsInstallation';
import type {RecentProjectInfo} from '@/types/project';

export interface ProjectOptions {
   path: string;
   installation?: JetBrainsInstallation;
   recent?: RecentProjectInfo;
}

export class JetBrainsProject {
   public readonly path: string;
   public readonly ideaPath: string;
   public readonly name: string | null;
   public readonly recent?: RecentProjectInfo;
   public readonly settings: ProjectSettingsManager;
   public readonly deployments: DeploymentManager;

   public constructor(options: ProjectOptions) {
      this.path = normalizeFilesystemPath(options.path);
      this.ideaPath = pathApi(this.path).join(this.path, '.idea');
      this.recent = options.recent;
      this.name = options.recent?.name ?? pathApi(this.path).basename(this.path);
      this.settings = new ProjectSettingsManager(this.ideaPath);
      this.deployments = new DeploymentManager({project: this, installation: options.installation});
   }

   public async exists(): Promise<boolean> {
      return directoryExists(this.path);
   }

   public toJSON() {
      return {path: this.path, ideaPath: this.ideaPath, name: this.name, recent: this.recent};
   }
}
