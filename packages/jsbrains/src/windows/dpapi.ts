import {spawn} from 'node:child_process';
import path from 'node:path';
import {PasswordSafeError} from '@/errors/errors';

const script = [
   '$ErrorActionPreference = \'Stop\'',
   'Add-Type -AssemblyName System.Security',
   'try {',
   ' $inputBytes = [Convert]::FromBase64String([Console]::In.ReadToEnd())',
   ' $outputBytes = [Security.Cryptography.ProtectedData]::Unprotect($inputBytes, $null, [Security.Cryptography.DataProtectionScope]::CurrentUser)',
   ' [Console]::Out.Write([Convert]::ToBase64String($outputBytes))',
   ' [Array]::Clear($outputBytes, 0, $outputBytes.Length)',
   '} catch { exit 1 }'
].join('\n');

export async function unprotectWindowsData(data: Uint8Array): Promise<Buffer> {
   if (process.platform !== 'win32') {
      throw new PasswordSafeError('DPAPI requires Windows and the owning user account.');
   }

   return new Promise((resolve, reject) => {
      const executable = path.join(process.env.SystemRoot ?? 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
      const child = spawn(executable, ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', script], {
         windowsHide: true,
         shell: false,
         stdio: ['pipe', 'pipe', 'ignore']
      });
      const chunks: Buffer[] = [];
      let length = 0;
      const timeout = setTimeout(() => child.kill(), 15000);

      child.stdout.on('data', (chunk: Buffer) => {
         length += chunk.length;

         if (length > 1024 * 1024) {
            child.kill();
            return;
         }

         chunks.push(chunk);
      });

      child.on('error', () => {
         clearTimeout(timeout);
         reject(new PasswordSafeError('Unable to start Windows DPAPI helper.'));
      });

      child.on('close', code => {
         clearTimeout(timeout);

         if (code !== 0 || length > 1024 * 1024) {
            reject(new PasswordSafeError('Windows DPAPI could not decrypt the stored main key for this user.'));
         } else {
            resolve(Buffer.from(Buffer.concat(chunks).toString('ascii'), 'base64'));
         }

         for (const chunk of chunks) {
            chunk.fill(0);
         }
      });

      child.stdin.on('error', () => {
         // Process exit is handled above; never forward a stream error with input data.
      });
      child.stdin.end(Buffer.from(data).toString('base64'));
   });
}
