import path from 'node:path';
import {SettingsManager} from '@/settings/SettingsManager';

export class IdeSettingsManager extends SettingsManager {
   public constructor(configPath: string) {
      super(path.join(configPath, 'options'));
   }
}
