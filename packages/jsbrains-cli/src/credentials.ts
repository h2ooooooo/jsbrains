import type {CredentialResolution, DeploymentCredentials} from '@jalsoedesign/jsbrains';

export function credentialOutput(result: CredentialResolution, showSecrets: boolean) {
   if (result.status !== 'available') {
      return {...result, secretRetrieved: false};
   }

   const credentials = result.credentials;
   let secretRetrieved = false;
   let passwordStored = false;
   let passphraseStored = false;

   if (credentials.type === 'password') {
      passwordStored = credentials.password !== null;
      secretRetrieved = passwordStored;
   } else if (credentials.type === 'private-key') {
      passphraseStored = credentials.passphrase !== null;
      secretRetrieved = passphraseStored;
   }

   const safeFields = {
      type: credentials.type,
      username: credentials.username,
      privateKeyPath: credentials.type === 'private-key' ? credentials.privateKeyPath : undefined,
      passwordStored, passphraseStored
   };
   let output: typeof safeFields | (typeof safeFields & DeploymentCredentials) = safeFields;

   if (showSecrets) {
      // The explicit CLI flag opts into data export, bypassing library redaction hooks.
      output = {...safeFields, ...credentials};
   }

   return {status: 'available' as const, secretRetrieved, credentials: output};
}

export type CredentialOutput = ReturnType<typeof credentialOutput>;
