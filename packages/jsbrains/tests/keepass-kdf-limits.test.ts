import path from 'node:path';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {KeePassPasswordSafeProvider} from '@/password-safe/KeePassPasswordSafeProvider';
import {keepassRuntime} from '@/password-safe/keepassRuntime';
import {MAX_AES_KDF_ROUNDS, validateKeePassKdf} from '@/password-safe/validateKeePassKdf';
import {temporaryDirectory, write} from './helpers';

const runtime = keepassRuntime();
const request = {serviceName: 'fixture-service', username: 'fixture-user'};

afterEach(() => vi.restoreAllMocks());

async function aesFixture(version: 3 | 4): Promise<Buffer> {
   const credentials = new runtime.Credentials(runtime.ProtectedValue.fromString('fixture-master'));
   const database = runtime.Kdbx.create(credentials, 'KDF security fixture');
   database.setVersion(version);

   if (version === 3) {
      database.header.keyEncryptionRounds = 1;
   } else {
      database.setKdf(runtime.Consts.KdfId.Aes);
      database.header.kdfParameters?.set('R', runtime.VarDictionary.ValueType.UInt64, runtime.Int64.from(1));
   }

   const group = database.createGroup(database.getDefaultGroup(), 'IntelliJ Platform');
   const entry = database.createEntry(group);
   entry.fields.set('Title', request.serviceName);
   entry.fields.set('UserName', request.username);
   entry.fields.set('Password', runtime.ProtectedValue.fromString('fixture-password'));
   return Buffer.from(await database.save());
}

function replaceRounds(bytes: Buffer, rounds: bigint): Buffer {
   const output = Buffer.from(bytes);
   const version = output.readUInt16LE(10);
   const fieldHeaderSize = version === 3 ? 3 : 5;

   for (let offset = 12; offset < output.length;) {
      const id = output.readUInt8(offset);
      const size = version === 3 ? output.readUInt16LE(offset + 1) : output.readUInt32LE(offset + 1);
      offset += fieldHeaderSize;

      if (version === 3 && id === 6) {
         output.writeBigUInt64LE(rounds, offset);
         return output;
      }

      if (version === 4 && id === 11) {
         let position = offset + 2;

         while (output.readUInt8(position++) !== 0) {
            const keyLength = output.readInt32LE(position);
            position += 4;
            const key = output.toString('utf8', position, position + keyLength);
            position += keyLength;
            const valueLength = output.readInt32LE(position);
            position += 4;

            if (key === 'R') {
               output.writeBigUInt64LE(rounds, position);
               return output;
            }

            position += valueLength;
         }
      }

      offset += size;
   }

   throw new Error('Fixture AES rounds field was not found.');
}

async function providerFor(bytes: Buffer) {
   const directory = await temporaryDirectory();
   const databasePath = await write(directory, 'fixture.kdbx', bytes);
   return new KeePassPasswordSafeProvider({
      configPath: directory, databasePath, mainKeyPath: path.join(directory, 'unused.pwd'), platform: process.platform
   }, {masterKeyResolver: {resolve: async () => ({status: 'resolved', password: Buffer.from('fixture-master')})}});
}

describe('KeePass AES-KDF resource limits', () => {
   it.each([3, 4] as const)('opens ordinary KDBX%s AES credentials', async version => {
      const provider = await providerFor(await aesFixture(version));
      const result = await provider.getCredential(request);
      expect(result.status).toBe('available');

      if (result.status === 'available') {
         expect(result.credential.password === 'fixture-password').toBe(true);
      }
   });

   it.each([3, 4] as const)('rejects excessive KDBX%s rounds before invoking the loader', async version => {
      const fixture = await aesFixture(version);
      // A loader stub makes this regression safe even if the preflight is accidentally removed.
      const load = vi.spyOn(runtime.Kdbx, 'load').mockRejectedValue(new Error('Expensive loader must not run.'));

      for (const rounds of [BigInt(MAX_AES_KDF_ROUNDS) + 1n, 1_000_000_000_000n, 0xffffffffffffffffn]) {
         const provider = await providerFor(replaceRounds(fixture, rounds));
         expect(await provider.getCredential(request)).toEqual({
            status: 'unsupported', reason: 'Unsupported KeePass format or KDF parameters.'
         });
      }

      expect(load).not.toHaveBeenCalled();
   });

   it.each([3, 4] as const)('accepts the KDBX%s limit without executing the KDF', async version => {
      const fixture = replaceRounds(await aesFixture(version), BigInt(MAX_AES_KDF_ROUNDS));
      expect(() => validateKeePassKdf(Uint8Array.from(fixture).buffer)).not.toThrow();
   });

   it.each([3, 4] as const)('rejects truncated KDBX%s header fields before invoking the loader', async version => {
      const fixture = (await aesFixture(version)).subarray(0, 20);
      const load = vi.spyOn(runtime.Kdbx, 'load').mockRejectedValue(new Error('Loader must not run.'));
      const provider = await providerFor(fixture);
      expect((await provider.getCredential(request)).status).toBe('locked');
      expect(load).not.toHaveBeenCalled();
   });
   it('rejects oversized headers before parsing or invoking the loader', async () => {
      const fixture = await aesFixture(4);
      const comment = Buffer.alloc(5 + 1024 * 1024);
      comment.writeUInt8(1, 0);
      comment.writeUInt32LE(comment.length - 5, 1);
      const bytes = Buffer.concat([fixture.subarray(0, 12), comment, fixture.subarray(12)]);
      const load = vi.spyOn(runtime.Kdbx, 'load').mockRejectedValue(new Error('Loader must not run.'));
      const provider = await providerFor(bytes);
      expect((await provider.getCredential(request)).status).toBe('unsupported');
      expect(load).not.toHaveBeenCalled();
   });
});
