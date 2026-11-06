import {createDecipheriv} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {isMissing} from '@/util/filesystem';
import {unprotectWindowsData} from '@/windows/dpapi';
import type {KeePassContext, KeePassMasterKeyResolver, KeePassMasterKeyResult} from '@/password-safe/types';

export function decryptBuiltInKey(data: Buffer): Buffer {
   // EncryptionSupport.kt: big-endian IV length + IV + AES/CBC/PKCS5 payload.
   // This is JetBrains' bootstrap wrapper, not KeePass cryptography. See docs/COMPATIBILITY.md.
   if (data.length < 36 || data.readInt32BE(0) !== 16 || (data.length - 20) % 16 !== 0) {
      throw new Error('Invalid JetBrains main key envelope.');
   }

   const decipher = createDecipheriv('aes-128-cbc', Buffer.from('Proxy Config Sec', 'ascii'), data.subarray(4, 20));
   return Buffer.concat([decipher.update(data.subarray(20)), decipher.final()]);
}

export class DefaultKeePassMasterKeyResolver implements KeePassMasterKeyResolver {
   public async resolve(context: KeePassContext): Promise<KeePassMasterKeyResult> {
      let encrypted: Buffer;
      let encryption = context.platform === 'win32' ? 'CRYPT_32' : 'BUILT_IN';

      try {
         const text = await readFile(context.mainKeyPath, 'utf8');
         const type = /^encryption:\s*([A-Z_]+)\s*$/mi.exec(text);
         const value = /^value:\s*(?:!!binary\s+)?([A-Za-z0-9+/]+={0,2})\s*$/m.exec(text);

         if (type?.[1]) {
            encryption = type[1].toUpperCase();
         }

         if (encryption === 'PGP_KEY') {
            return {status: 'pgp-required'};
         }

         if (!value?.[1]) {
            return {status: 'unsupported', reason: 'Unrecognized c.pwd main key format.'};
         }

         encrypted = Buffer.from(value[1], 'base64');
      } catch (error) {
         if (!isMissing(error)) {
            return {status: 'unavailable'};
         }

         try {
            encrypted = await readFile(path.join(context.configPath, 'pdb.pwd'));
         } catch (legacyError) {
            if (isMissing(legacyError)) {
               return {status: 'master-password-required'};
            }

            return {status: 'unavailable'};
         }
      }

      let envelope = encrypted;

      try {
         if (encryption === 'CRYPT_32') {
            if (context.platform !== 'win32' || process.platform !== 'win32') {
               return {status: 'unsupported', reason: 'This main key requires Windows DPAPI under its owning user.'};
            }

            envelope = await unprotectWindowsData(encrypted);
         } else if (encryption !== 'BUILT_IN') {
            return {status: 'unsupported', reason: 'Unrecognized main key encryption type.'};
         }

         return {status: 'resolved', password: decryptBuiltInKey(envelope)};
      } catch {
         return {status: 'locked', reason: 'The JetBrains main key could not be decrypted for this user.'};
      } finally {
         encrypted.fill(0);
         envelope.fill(0);
      }
   }
}
