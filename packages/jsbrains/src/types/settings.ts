export interface JetBrainsSettingsFileInfo {
   filename: string;
   path: string;
   exists: boolean;
}

export interface JetBrainsSettingsFile<T = unknown> extends JetBrainsSettingsFileInfo {
   raw: string;
   parsed?: T;
}
