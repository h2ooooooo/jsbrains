#!/usr/bin/env node
import {runCli} from '@cli/run';

process.stdout.on('error', (error: NodeJS.ErrnoException) => {
   if (error.code === 'EPIPE') {
      process.exit(0);
   }

   process.exit(1);
});

process.exitCode = await runCli(process.argv.slice(2), {
   cwd: process.cwd(), env: process.env,
   stdinIsTTY: process.stdin.isTTY ?? false,
   stdoutIsTTY: process.stdout.isTTY ?? false,
   stdout: text => {
      process.stdout.write(text);
   },
   stderr: text => {
      process.stderr.write(text);
   },
   readStdin: async () => {
      const chunks: Buffer[] = [];
      let size = 0;

      for await (const chunk of process.stdin) {
         const bytes = Buffer.from(chunk);
         size += bytes.length;

         if (size > 65536) {
            throw new Error('Master-password input exceeds the allowed size.');
         }

         chunks.push(bytes);
      }

      const buffer = Buffer.concat(chunks);
      const input = buffer.toString('utf8');
      buffer.fill(0);

      for (const chunk of chunks) {
         chunk.fill(0);
      }

      return input;
   }
});
