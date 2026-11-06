// read-profiles.mjs
import {JetBrainsProfileSource} from '@jalsoedesign/jsbrains-portline';

const source = await JetBrainsProfileSource.open({configPath: process.argv[2] ?? './PhpStorm2026.2'});

const profiles = source.list();
const selected = source.get('global/deployments/demo');

if (!selected) {
    throw new Error('The demo profile is missing');
}

console.log('Profiles: ' + profiles.length);
console.log('Selected: ' + selected.path);

for (const connection of selected.connections) {
    console.log(connection.id + ': ' + connection.protocol + ' ' + connection.endpoint.host + ':' + connection.endpoint.port);
}

console.log('Host matches: ' + source.search('127.0.0.1', {fields: 'all'}).length);
console.log('Metadata only: no server connection.');
