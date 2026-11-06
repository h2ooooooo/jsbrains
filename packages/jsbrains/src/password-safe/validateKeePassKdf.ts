import {keepassRuntime} from '@/password-safe/keepassRuntime';

export const MAX_AES_KDF_ROUNDS = 10_000_000;
const maxHeaderBytes = 1024 * 1024;

function headerBytes(data: ArrayBuffer): ArrayBuffer {
   const runtime = keepassRuntime();
   const invalidHeader = () => new runtime.KdbxError(runtime.Consts.ErrorCodes.FileCorrupt, 'Invalid KeePass header.');

   if (data.byteLength < 12) {
      throw invalidHeader();
   }

   const view = new DataView(data);
   const version = view.getUint16(10, true);

   if (version !== 3 && version !== 4) {
      throw new runtime.KdbxError(runtime.Consts.ErrorCodes.Unsupported, 'Unsupported KeePass version.');
   }

   const fieldHeaderSize = version === 3 ? 3 : 5;
   let offset = 12;

   while (offset < data.byteLength) {
      if (offset + fieldHeaderSize > data.byteLength) {
         throw invalidHeader();
      }

      const id = view.getUint8(offset);
      const size = version === 3 ? view.getUint16(offset + 1, true) : view.getUint32(offset + 1, true);
      const end = offset + fieldHeaderSize + size;

      if (end > data.byteLength) {
         throw invalidHeader();
      }

      if (end > maxHeaderBytes) {
         throw new runtime.KdbxError(runtime.Consts.ErrorCodes.Unsupported, 'KeePass header resource limit exceeded.');
      }

      if (id === 0) {
         return data.slice(0, end);
      }

      offset = end;
   }

   throw invalidHeader();
}

/** Reject unauthenticated AES work before kdbxweb allocates its encryption promise chain. */
export function validateKeePassKdf(data: ArrayBuffer): void {
   const runtime = keepassRuntime();
   const context = new runtime.KdbxContext({kdbx: new runtime.Kdbx()});
   const header = runtime.KdbxHeader.read(new runtime.BinaryStream(headerBytes(data)), context);
   let rounds: unknown = header.keyEncryptionRounds;

   if (header.versionMajor === 4) {
      const parameters = header.kdfParameters;
      const algorithm = parameters?.get('$UUID');

      if (!(algorithm instanceof ArrayBuffer) || runtime.ByteUtils.bytesToBase64(algorithm) !== runtime.Consts.KdfId.Aes) {
         return;
      }

      rounds = parameters?.get('R');

      if (rounds instanceof runtime.Int64) {
         // The cap fits in the low word; never coerce an attacker-controlled uint64 to Number.
         rounds = rounds.hi === 0 ? rounds.lo : Infinity;
      }
   }

   if (typeof rounds !== 'number' || !Number.isSafeInteger(rounds) || rounds < 1 || rounds > MAX_AES_KDF_ROUNDS) {
      throw new runtime.KdbxError(runtime.Consts.ErrorCodes.Unsupported, 'AES-KDF resource limit exceeded.');
   }
}
