import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';
import {keepassRuntime} from '@/password-safe/keepassRuntime';
import {gzipSync, gunzipSync} from '@/password-safe/keepassCompression';

const require = createRequire(import.meta.url);
// Use the independent original writer to check compatibility with existing databases.
const original = require('kdbxweb') as typeof import('kdbxweb');
const oldCompression = require('fflate') as {gzipSync(data: Uint8Array): Uint8Array};
const runtime = keepassRuntime();
const password = 'fixture-compression-master';
const attachment = Uint8Array.from(Buffer.from('Compressed fixture attachment '.repeat(100)));

function credentials(engine: typeof runtime) {
   return new engine.Credentials(engine.ProtectedValue.fromString(password));
}

describe('KeePass native compression boundary', () => {
   it('preserves sliced inputs and returns independently owned exact-length arrays', () => {
      const padded = Uint8Array.from([11, 12, ...attachment, 13, 14]);
      const compressed = gzipSync(padded.subarray(2, padded.length - 2));
      const wrapped = Uint8Array.from([21, 22, ...compressed, 23]);
      const restored = gunzipSync(wrapped.subarray(2, wrapped.length - 1));

      expect(restored).toEqual(attachment);

      for (const result of [compressed, restored]) {
         expect(result.byteOffset).toBe(0);
         expect(result.byteLength).toBe(result.buffer.byteLength);
         expect(Buffer.isBuffer(result)).toBe(false);
      }

      padded.fill(0);
      wrapped.fill(0);
      expect(restored).toEqual(attachment);
   });

   it.each([3, 4] as const)('round trips compressed KDBX%s credentials and attachments across old and new writers', async version => {
      const database = original.Kdbx.create(credentials(original), 'Compression compatibility fixture');
      database.setVersion(version);
      database.header.compression = original.Consts.CompressionAlgorithm.GZip;

      if (version === 3) {
         database.header.keyEncryptionRounds = 1;
      } else {
         database.setKdf(original.Consts.KdfId.Aes);
         database.header.kdfParameters?.set('R', original.VarDictionary.ValueType.UInt64, original.Int64.from(1));
      }

      const entry = database.createEntry(database.getDefaultGroup());
      entry.fields.set('Title', 'compressed-record');
      entry.fields.set('Password', original.ProtectedValue.fromString('fixture-compressed-secret'));
      entry.binaries.set('fixture.bin', await database.binaries.add(attachment));

      const loaded = await runtime.Kdbx.load(await database.save(), credentials(runtime));
      const result = loaded.getDefaultGroup().entries.find(candidate => candidate.fields.get('Title') === 'compressed-record');

      expect(result).toBeDefined();
      const secret = result?.fields.get('Password');
      expect(secret instanceof runtime.ProtectedValue && secret.getText()).toBe('fixture-compressed-secret');

      const binary = result?.binaries.get('fixture.bin');

      if (!runtime.KdbxBinaries.isKdbxBinaryWithHash(binary) || !(binary.value instanceof ArrayBuffer)) {
         throw new Error('Fixture attachment was not restored as database binary data.');
      }

      expect(new Uint8Array(binary.value)).toEqual(attachment);

      const reopened = await original.Kdbx.load(await loaded.save(), credentials(original));
      const originalEntry = reopened.getDefaultGroup().entries.find(candidate => candidate.fields.get('Title') === 'compressed-record');

      expect(originalEntry).toBeDefined();
      expect(reopened.header.compression).toBe(original.Consts.CompressionAlgorithm.GZip);
   });

   it('reads legacy compressed XML attachments and rejects malformed gzip data', () => {
      const bytes = oldCompression.gzipSync(attachment);
      const xml = '<Binary Compressed="True">' + Buffer.from(bytes).toString('base64') + '</Binary>';
      const document = runtime.XmlUtils.parse(xml);
      const value = runtime.XmlUtils.getProtectedBinary(document.documentElement);

      expect(value instanceof ArrayBuffer && new Uint8Array(value)).toEqual(attachment);

      const malformed = runtime.XmlUtils.parse('<Binary Compressed="True">bm90LWd6aXA=</Binary>');
      expect(() => runtime.XmlUtils.getProtectedBinary(malformed.documentElement)).toThrow();
      expect(() => gunzipSync(bytes.subarray(0, bytes.length - 5))).toThrow();
   });
});
