import {gzipSync as compress, gunzipSync as decompress} from 'node:zlib';

/** Keep the exact view and owned-array contract used by the pinned KDBX source. */
export function gzipSync(data: Uint8Array): Uint8Array {
   return Uint8Array.from(compress(data));
}

export function gunzipSync(data: Uint8Array): Uint8Array {
   return Uint8Array.from(decompress(data));
}
