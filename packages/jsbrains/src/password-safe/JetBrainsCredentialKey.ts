import type {DeploymentInfo} from '@/deployment/types';
import type {CredentialRequest} from '@/password-safe/types';

export class JetBrainsCredentialKey {
   public static forDeployment(deployment: DeploymentInfo): CredentialRequest | null {
      if (deployment.type !== 'sftp' || !deployment.host || deployment.username === null || deployment.port === null) {
         return null;
      }

      let qualifier: string;

      if (deployment.auth.type === 'password') {
         qualifier = 'password';
      } else if (deployment.auth.type === 'private-key') {
         qualifier = 'passphrase';
      } else {
         return null;
      }

      // RemoteCredentialsHolder.createAttributes, pinned source in docs/COMPATIBILITY.md.
      const identity = `ssh://${deployment.username}@${deployment.host}:${deployment.literalPort ?? deployment.port}`;
      return {
         serviceName: `IntelliJ Platform Remote Credentials ${identity}(${qualifier})`,
         username: deployment.username
      };
   }
}
