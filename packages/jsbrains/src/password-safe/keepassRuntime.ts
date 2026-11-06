import kdbxweb from './kdbx-source.generated.cjs';
import {argon2d, argon2id} from 'hash-wasm';

let configured = false;

export function keepassRuntime() {
   if (!configured) {
      kdbxweb.CryptoEngine.setArgon2Impl(async (password, salt, memory, iterations, length, parallelism, type, version) => {
         if (version !== 0x13 || ![0, 2].includes(type)) {
            throw new kdbxweb.KdbxError(kdbxweb.Consts.ErrorCodes.Unsupported, 'Unsupported Argon2 variant.');
         }

         // Bound work requested by database headers before allocating WASM memory.
         if (memory > 256 * 1024 || iterations > 100 || parallelism > 16 || length > 1024) {
            throw new kdbxweb.KdbxError(kdbxweb.Consts.ErrorCodes.Unsupported, 'KDF resource limit exceeded.');
         }

         const algorithm = type === 0 ? argon2d : argon2id;
         const result = await algorithm({
            password: new Uint8Array(password), salt: new Uint8Array(salt),
            memorySize: memory, iterations, parallelism, hashLength: length, outputType: 'binary'
         });

         return Uint8Array.from(result).buffer;
      });
      configured = true;
   }

   return kdbxweb;
}
