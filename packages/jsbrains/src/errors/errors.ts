export class JsBrainsError extends Error {
   public constructor(message: string) {
      super(message);
      this.name = new.target.name;
   }
}

export class JetBrainsDiscoveryError extends JsBrainsError {}
export class JetBrainsSettingsError extends JsBrainsError {}
export class DeploymentParseError extends JsBrainsError {}
export class PasswordSafeError extends JsBrainsError {}
export class KeePassUnlockError extends PasswordSafeError {}
