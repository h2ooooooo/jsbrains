import path from 'node:path';
import {directoryExists} from '@/util/filesystem';

export async function discoverProject(from: string): Promise<string | null> {
   let current = path.resolve(from);

   while (true) {
      if (await directoryExists(path.join(current, '.idea'))) {
         return current;
      }

      const parent = path.dirname(current);

      if (parent === current) {
         return null;
      }

      current = parent;
   }
}
