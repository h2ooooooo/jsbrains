import {inspect} from 'node:util';

/** Preserve explicit field access while keeping incidental JSON/log inspection sanitized. */
export function redactSerialization<T extends object>(value: T, secretFields: string[]): T {
   const sanitized = () => {
      const output: Record<string, unknown> = Object.fromEntries(Object.entries(value));

      for (const name of secretFields) {
         if (output[name] !== null && output[name] !== undefined) {
            output[name] = '[redacted]';
         }
      }

      return output;
   };

   Object.defineProperties(value, {
      toJSON: {value: sanitized},
      [inspect.custom]: {value: sanitized}
   });

   return value;
}
