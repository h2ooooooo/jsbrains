#!/usr/bin/env node
import process from 'node:process';
import console from 'node:console';
if (process.argv.includes('--no-color')) {
    process.env.NO_COLOR = '1';
    delete process.env.FORCE_COLOR;
} else if (process.argv.includes('--color')) {
    process.env.FORCE_COLOR = '1';
    delete process.env.NO_COLOR;
}

try {
   const {cli} = await import('../dist/index.js');
   process.exitCode = await cli.run();
} catch (error) {
   console.error(process.argv.includes('--json') ? JSON.stringify({error: error.message}) : 'Error: ' + error.message);
   process.exitCode = 1;
}
