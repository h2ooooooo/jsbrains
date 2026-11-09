import assert from 'node:assert/strict';
import {createDocklineBridge} from '@jalsoedesign/portline-dockline';
import {mkdtemp, mkdir, rm, writeFile} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {JetBrains} from '@jalsoedesign/jsbrains';
import {JetBrainsProfileSource} from '../packages/jsbrains-portline/dist/index.js';

const directory = await mkdtemp(path.join(os.tmpdir(), 'jsbrains-execution-'));
try {
    const configPath = path.join(directory, 'PhpStorm2026.2');
    await mkdir(path.join(configPath, 'options'), {recursive: true});
    await writeFile(path.join(configPath, 'options', 'webServers.xml'), [
        '<application><component name="WebServers"><option name="servers">',
        '<webServer id="site" name="Site"><fileTransfer accessType="SFTP" host="files.example" username="alice" rootFolder="/srv/site" /></webServer>',
        '<webServer id="native" name="Native"><fileTransfer accessType="SFTP" host="files.example" useOpenSSHConfig="true" /></webServer>',
        '</option></component></application>',
    ].join(''));
    const installation = await JetBrains.fromConfigPath(configPath);
    const source = await JetBrainsProfileSource.fromInstallation(installation);
    const bridge = createDocklineBridge({source});
    const options = {password: 'fixture-password', hostFingerprint: 'SHA256:' + 'A'.repeat(43)};
    const config = await bridge.toConfig(source.get('global/deployments/site'), options);
    assert.equal(config.protocol, 'sftp');
    assert.equal(config.host, 'files.example');
    assert.equal(config.root, '/srv/site');
    await assert.rejects(bridge.toConfig('global/deployments/native', options), /useOpenSSHConfig|unsupported/i);
    console.log('JetBrains deployment prepared through the shared bridge; unresolved native auth refused.');
} finally {
    await rm(directory, {recursive: true, force: true});
}
