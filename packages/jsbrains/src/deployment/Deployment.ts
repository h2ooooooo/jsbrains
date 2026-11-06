import {inspect} from 'node:util';
import type {DeploymentInfo, RawDeploymentData, DeploymentCredentials} from '@/deployment/types';
import type {CredentialResolution} from '@/password-safe/types';
import type {PasswordSafeManager} from '@/password-safe/PasswordSafeManager';

export class Deployment implements DeploymentInfo {
   public readonly id;
   public readonly name;
   public readonly type;
   public readonly host;
   public readonly port;
   public readonly literalPort;
   public readonly username;
   public readonly rootPath;
   public readonly webUrl;
   public readonly auth;
   public readonly mappings;
   public readonly visibility;
   public readonly source;
   public readonly diagnostics;
   public readonly credentials: {resolve: () => Promise<CredentialResolution>};
   #raw: RawDeploymentData;

   public constructor(info: DeploymentInfo, raw: RawDeploymentData, passwordSafe?: PasswordSafeManager) {
      this.id = info.id;
      this.name = info.name;
      this.type = info.type;
      this.host = info.host;
      this.port = info.port;
      this.literalPort = info.literalPort;
      this.username = info.username;
      this.rootPath = info.rootPath;
      this.webUrl = info.webUrl;
      this.auth = info.auth;
      this.mappings = info.mappings;
      this.visibility = info.visibility;
      this.source = info.source;
      this.diagnostics = info.diagnostics;
      this.#raw = raw;
      this.credentials = {
         resolve: async () => {
            if (!passwordSafe) {
               return {status: 'no-installation-context'};
            }

            return passwordSafe.resolveDeployment(info);
         }
      };
   }

   public async getCredentials(): Promise<DeploymentCredentials | null> {
      const result = await this.credentials.resolve();

      if (result.status === 'available') {
         return result.credentials;
      }

      return null;
   }

   public getRaw(): RawDeploymentData {
      return structuredClone(this.#raw);
   }

   public toJSON(): DeploymentInfo {
      return {
         id: this.id, name: this.name, type: this.type,
         host: this.host, port: this.port, literalPort: this.literalPort,
         username: this.username, rootPath: this.rootPath, webUrl: this.webUrl,
         auth: this.auth, mappings: this.mappings, visibility: this.visibility,
         source: this.source, diagnostics: this.diagnostics
      };
   }

   public [inspect.custom]() {
      return this.toJSON();
   }
}
