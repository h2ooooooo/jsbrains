import assert from 'node:assert/strict';
import {mkdtemp, mkdir, writeFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import console from 'node:console';
import {JetBrainsProfileSource} from '@jalsoedesign/jsbrains-portline';

const files = {
   'PhpStorm2026.2/options/webServers.xml': '<application><component name="WebServers"><option name="servers"><webServer id="demo" name="Demo"><fileTransfer accessType="SFTP" host="127.0.0.1" port="22" username="deploy" /></webServer></option></component></application>',
   'PhpStorm2026.2/options/sshConfigs.xml': '<application><component name="SshConfigs"><configs><sshConfig id="demo-ssh" host="127.0.0.1" port="22" username="deploy" authType="OPEN_SSH" /></configs></component></application>'
};
const directory = await mkdtemp(path.join(tmpdir(), 'profile-api-demo-'));

try {
   for (const [name, contents] of Object.entries(files)) {
       const target = path.join(directory, name);

       await mkdir(path.dirname(target), {recursive: true});
       await writeFile(target, contents);
   }

   const source = await JetBrainsProfileSource.open({configPath: path.join(directory, 'PhpStorm2026.2')});
   const profiles = source.list();

   assert.ok(profiles.length > 0);

   for (const profile of profiles) {
       const connections = profile.connections.map(connection => ({
         protocol: connection.protocol,
         host: connection.endpoint?.host ?? null,
       }));

       console.log(JSON.stringify({path: profile.path, connections}));
   }

   const selected = source.get(profiles[0].path);
   const matches = source.search('127.0.0.1', {fields: 'all'});

   assert.equal(selected.path, profiles[0].path);
   assert.ok(matches.length > 0);
   console.log('Exact selection:', selected.path);
   console.log('Host matches:', matches.length);
   console.log('Metadata only; no remote connection.');
} finally {
   await rm(directory, {recursive: true, force: true});
   console.log('Temporary files removed.');
}
