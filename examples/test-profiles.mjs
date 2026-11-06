import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath, URL} from 'node:url';
import process from 'node:process';
import console from 'node:console';
import {setTimeout, clearTimeout} from 'node:timers';

// These are synthetic native settings. No installed application or remote host is used.
const files = {
   'PhpStorm2026.2/options/webServers.xml': '<application><component name="WebServers"><option name="servers"><webServer id="demo" name="Demo"><fileTransfer accessType="SFTP" host="127.0.0.1" port="22" username="deploy" /></webServer></option></component></application>',
   'PhpStorm2026.2/options/sshConfigs.xml': '<application><component name="SshConfigs"><configs><sshConfig id="demo-ssh" host="127.0.0.1" port="22" username="deploy" authType="OPEN_SSH" /></configs></component></application>'
};
const directory = await mkdtemp(path.join(tmpdir(), 'profile-demo-'));
const executable = fileURLToPath(new URL('../packages/jsbrains-portline-cli/bin/cli.js', import.meta.url));
const selector = ['--config', path.join(directory, 'PhpStorm2026.2')];

async function run(args, original = false) {
   const child = spawn(process.execPath, [original ? fileURLToPath(new URL('../packages/jsbrains-cli/bin/jsbrains.js', import.meta.url)) : executable, ...args, ...selector, '--json'], {
      cwd: directory,
      windowsHide: true,
      stdio: ['ignore', 'pipe', 'pipe'],
   });
   let stdout = '';
   let stderr = '';
   const timer = setTimeout(() => child.kill(), 15000);

   child.stdout.on('data', chunk => {
      stdout += chunk;
   });
   child.stderr.on('data', chunk => {
      stderr += chunk;
   });

   try {
      const code = await new Promise((resolve, reject) => {
         child.on('error', reject);
         child.on('close', resolve);
      });

      assert.equal(code, 0, stdout + stderr);
      console.log('$ ' + (original ? 'jsbrains' : 'jsbrains-profiles') + ' ' + args.join(' ') + ' --config <temporary-config> --json');
      console.log(stdout.trim().split(JSON.stringify(directory).slice(1, -1)).join('<temporary-directory>'));

      return JSON.parse(stdout);
   } finally {
      clearTimeout(timer);
   }
}

try {
   for (const [name, contents] of Object.entries(files)) {
      const target = path.join(directory, name);

      await mkdir(path.dirname(target), {recursive: true});
      await writeFile(target, contents);
   }

   const profiles = await run(['list']);

   assert.ok(profiles.length > 0);
   assert.equal(await run(['get', profiles[0].path, 'host']), '127.0.0.1');
   assert.equal((await run(['deployments', '--global'], true)).schemaVersion, 1);
   console.log('PASS: synthetic native settings -> CLI list and exact property lookup.');
   console.log('Metadata only: no remote connection or installed settings access.');
} finally {
   await rm(directory, {recursive: true, force: true});
   console.log('Temporary files removed.');
}
