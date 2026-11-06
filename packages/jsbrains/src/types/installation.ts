import type {PasswordSafeOptions} from '@/password-safe/types';

export interface JetBrainsInstallationInfo {
   product: string;
   version: string | null;
   configPath: string;
   systemPath: string | null;
   platform: NodeJS.Platform;
   detected: boolean;
}

export interface InstallationSelector {
   product?: string;
   version?: string;
   latest?: boolean;
   configPath?: string;
}

export interface DetectionOptions {
   platform?: NodeJS.Platform;
   homePath?: string;
   env?: NodeJS.ProcessEnv;
   configPaths?: string[];
   passwordSafe?: PasswordSafeOptions;
}
